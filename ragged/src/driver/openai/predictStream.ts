import { Subject } from "rxjs";
import type { OpenAI } from "openai";
import { OpenAiChatCompletionDetector } from "./detector/OpenAiChatCompletionDetector";
import { RaggedLlmStreamEvent } from "../types";
import { NewToolHolder } from "../../tool-use/types";
import { mapToolToOpenAi } from "./mapToolToOpenAi";

export const predictStream = (
  o: OpenAI,
  prompt: string,
  requestOverrides: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>,
  tools: NewToolHolder[]
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
          data: evt.content,
        });
        break;
      case "CHAT_COMPLETION_COLLECT":
        operationEvents.next({
          type: "collected",
          index,
          data: evt.content,
        });
        break;
      case "CHAT_COMPLETION_FINISH":
        operationEvents.next({ type: "finished", index, data: evt.content });
        operationEvents.complete();
        break;
      case "TOOL_USE_START":
        operationEvents.next({
          type: "tool_use_start",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          data: {
            name: evt.toolCall.name,
          },
        });
        break;
      case "TOOL_USE_FINISH":
        operationEvents.next({
          type: "tool_use_finish",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          data: {
            name: evt.toolCall.name,
            arguments: evt.toolCall.arguments,
          },
        });

        // call the handler and push up the result in the events.
        // if the tool is not found, push up an error

        if (tools?.length) {
          const foundTool = tools.find(
            (tool) => tool.tool.title === evt.toolCall.name
          );
          if (!foundTool) {
            console.error(
              `LLM tried to call tool with name ${evt.toolCall.name} but no such tool was provided.`
            );
            return;
          }
          const handler = foundTool.handler;
          if (!handler) {
            console.error(
              `LLM tried to call tool with name ${evt.toolCall.name} but no handler was set on the tool.`
            );
            return;
          }

          // TODO: need to do validation
          const result = handler(evt.toolCall.arguments);

          // TODO: provide the result to the LLM in the openerationEvents
          operationEvents.next({
            type: "tool_use_result",
            index: evt.index,
            toolCallIndex: evt.toolCallIndex,
            data: {
              name: evt.toolCall.name,
              arguments: evt.toolCall.arguments,
              result,
            },
          });

          return;
        }

        // // TODO: provide the result to the LLM in the openerationEvents
        // const toolUseResult = handleToolUseFinish(
        //   evt.toolCall.name,
        //   evt.toolCall.arguments,
        //   tools
        // );

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
    ...(requestOverrides || {}),
  };

  if (tools.length) {
    body.tools = tools.map((toolHolder) => mapToolToOpenAi(toolHolder.tool));
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
