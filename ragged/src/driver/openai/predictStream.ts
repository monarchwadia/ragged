import { Subject } from "rxjs";
import type { OpenAI } from "openai";
import { OpenAiChatCompletionDetector } from "./detector/OpenAiChatCompletionDetector";
import { Tool } from "../../ToolExecutor";
import type { RaggedTool } from "../../RaggedTool";
import { RaggedLlmStreamEvent } from "../types";
import { ChatCompletionTool } from "openai/resources/index.mjs";

const buildCallTool = (): ChatCompletionTool => ({
  type: "function",
  function: {
    name: "callTool",
    description:
      "Calls a tool with a given name and input. Tools are all accessible via a unified interface. The only tool available to the GPT model is `callTool`, which allows the model to call a tool with a given name and input.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "The name of the tool to call. A list of tools will be provided in the context, in a section called 'Tools Catalogue'.",
        },
        payload: {
          description:
            "The input to the tool. The format of this input will depend on the tool being called.",
        },
      },
      required: ["name"],
    },
  },
})

// TODO: need to migrate to ToolExecutor
const handleToolUseFinish = (
  callToolName: string,
  payload: any,
  tools: RaggedTool[]
) => {
  if (callToolName !== "callTool") {
    console.error(
      `LLM failed to correctly call Ragged's OpenAI driver's callTool middle tier. The name provided by OpenAI was ${callToolName} but it should have been callTool.`
    );
    return;
  }

  if (!payload.name) {
    console.error(
      `LLM failed to correctly call Ragged's OpenAI driver's callTool middle tier. No name for the tool was provided was provided.`
    );
    return;
  }

  if (tools?.length) {
    const foundTool = tools.find(
      (tool: RaggedTool) => tool.getTitle() === payload.name
    );
    if (!foundTool) {
      console.error(
        `LLM tried to call tool with name ${payload.name} but no such tool was provided.`
      );
      return;
    }
    const handler = foundTool.getHandler();
    if (!handler) {
      console.error(
        `LLM tried to call tool with name ${payload.name} but no handler was set on the tool.`
      );
      return;
    }

    // TODO: need to do validation

    const result = handler(payload.payload);

    return result;
  }
};

export const predictStream = (
  o: OpenAI,
  prompt: string,
  requestOverrides: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>,
  tools: RaggedTool[]
) => {
  const operationEvents = new Subject<RaggedLlmStreamEvent>();

  const chatCompletionDetector = new OpenAiChatCompletionDetector();

  // set up the listener. the events are pushed to the listener elsewhere in this file.
  chatCompletionDetector.listen((evt) => {
    const { type, index } = evt;

    switch (type) {
      case "CHAT_COMPLETION_START":
        operationEvents.next({ type: "started", index });
        break;
      case "CHAT_COMPLETION_CHUNK":
        operationEvents.next({
          type: "chunk",
          index,
          payload: evt.content,
        });
        break;
      case "CHAT_COMPLETION_COLLECT":
        operationEvents.next({
          type: "collected",
          index,
          payload: evt.content,
        });
        break;
      case "CHAT_COMPLETION_FINISH":
        operationEvents.next({ type: "finished", index, payload: evt.content });
        operationEvents.complete();
        break;
      case "TOOL_USE_START":
        operationEvents.next({
          type: "tool_use_start",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          payload: {
            name: evt.toolCall.name,
          },
        });
        break;
      case "TOOL_USE_FINISH":
        operationEvents.next({
          type: "tool_use_finish",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          payload: {
            name: evt.toolCall.name,
            arguments: evt.toolCall.arguments,
          },
        });

        // TODO: provide the result to the LLM in the openerationEvents
        const toolUseResult = handleToolUseFinish(
          evt.toolCall.name,
          evt.toolCall.arguments,
          tools
        );

        break;
    }
  });

  const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
    ...requestOverrides,
  };

  if (tools?.length) {
    let systemPrompts = "# Tools Catalogue\n\n";

    // TODO: RaggedTool should be sent in a separate argument or not at all
    tools.forEach((tool: RaggedTool) => {
      const compiled = tool._compile();
      systemPrompts += compiled + "\n\n";
    });

    body.messages = [
      {
        role: "system",
        content: systemPrompts,
      },
      ...body.messages,
    ];

    body.tools = [buildCallTool()];
  }

  const response = o.chat.completions.create(body);

  const decoder = new TextDecoder();
  response
    .then((response) => {
      const reader = response.toReadableStream().getReader();

      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              return;
            }

            const val = decoder.decode(value);
            chatCompletionDetector.scan(JSON.parse(val));
            read();
          })
          .catch((error) => {
            // Handle any errors that may have occurred
            console.error(
              "An error occurred while streaming responses from OpenAI:",
              error
            );

            // You might want to emit an 'error' event instead
            operationEvents.error(error);
          });
      }

      read();
    })
    .catch((error) => {
      // Handle any errors
      console.error(
        "An error occurred while trying to open the connection with OpenAI:",
        error
      );

      // You might want to emit an 'error' event instead
      operationEvents.error(error);
    });

  return operationEvents;
};
