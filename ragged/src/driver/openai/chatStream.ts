import type { OpenAI } from "openai";
import { OpenAiChatCompletionDetector } from "./detector/OpenAiChatCompletionDetector";
import { RaggedHistoryItem } from "../types";
import { NewToolHolder } from "../../tool-use/types";
import { mapToolToOpenAi } from "./mapToolToOpenAi";
import { RaggedSubject } from "../../RaggedSubject";

export const chatStream = (
  o: OpenAI,
  history: RaggedHistoryItem[],
  requestOverrides: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>,
  tools: NewToolHolder[]
) => {
  const responseHistory: RaggedHistoryItem[] = [];
  const operationEvents = new RaggedSubject();

  const chatCompletionDetector = new OpenAiChatCompletionDetector();

  // set up the listener. the events are pushed to the listener elsewhere in this file.
  chatCompletionDetector.listen((evt) => {
    const { type, index } = evt;

    switch (type) {
      case "CHAT_COMPLETION_START": {
        operationEvents.next({ type: "ragged.started" });
        break;
      }
      case "CHAT_COMPLETION_CHUNK": {
        operationEvents.next({
          type: "text.chunk",
          index,
          data: evt.content,
        });
        break;
      }
      case "CHAT_COMPLETION_COLLECT": {
        operationEvents.next({
          type: "text.joined",
          index,
          data: evt.content,
        });
        break;
      }
      case "CHAT_COMPLETION_FINISH": {
        operationEvents.next({
          type: "text.finished",
          index,
          data: evt.content,
        });
        const historyItem: RaggedHistoryItem = {
          type: "history.text",
          role: "ai",
          data: {
            text: evt.content,
          },
        };
        responseHistory.push(historyItem);
        operationEvents.next({ ...historyItem });
        break;
      }
      case "TOOL_USE_START": {
        operationEvents.next({
          type: "tool.started",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          data: {
            name: evt.toolCall.name,
          },
        });
        break;
      }
      case "TOOL_USE_FINISH": {
        const toolUseRequestData = {
          name: evt.toolCall.name,
          arguments: evt.toolCall.arguments,
        };
        operationEvents.next({
          type: "tool.inputs",
          index: evt.index,
          toolCallIndex: evt.toolCallIndex,
          data: toolUseRequestData,
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
          // TODO: need to do try/catch around the handler
          const result = handler(evt.toolCall.arguments);

          // TODO: provide the result to the LLM in the openerationEvents
          operationEvents.next({
            type: "tool.finished",
            index: evt.index,
            toolCallIndex: evt.toolCallIndex,
            data: {
              name: evt.toolCall.name,
              arguments: evt.toolCall.arguments,
              result,
            },
          });

          const historyItem: RaggedHistoryItem = {
            type: "history.tool.result",
            toolName: evt.toolCall.name,
            toolRequestId: evt.toolCall.id,
            result,
          };
          operationEvents.next(historyItem);
          responseHistory.push({ ...historyItem });

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
    }
  });

  const openaiHistory: OpenAI.Chat.ChatCompletionMessageParam[] = history.map(
    (item): OpenAI.Chat.ChatCompletionMessageParam => {
      if (item.type === "history.text") {
        let role: OpenAI.Chat.ChatCompletionMessageParam["role"];
        if (item.role === "human") {
          role = "user";
        } else if (item.role === "ai") {
          role = "assistant";
        } else if (item.role === "system") {
          role = "system";
        } else {
          throw new Error(
            `Error while mapping Ragged history to OpenAI history: Unknown role: ${item.role}. Valid roles for a Ragged "history.text" item are are human, ai, system`
          );
        }

        return {
          role,
          content: item.data.text,
        };
      } else if (item.type === "history.tool.request") {
        return {
          role: "tool",
          tool_call_id: item.toolRequestId,
          content: JSON.stringify(item.inputs),
        };
      } else if (item.type === "history.tool.result") {
        return {
          role: "tool",
          tool_call_id: item.toolRequestId,
          content: JSON.stringify(item.result),
        };
      } else {
        throw new Error(
          `Error while mapping Ragged history to OpenAI history: Unknown type: ${(item as any).type}. Valid types are "history.text", "history.tool.request", "history.tool.response"`
        );
      }
    }
  );

  const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
    model: "gpt-3.5-turbo",
    messages: openaiHistory,
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

      reader.closed.then(() => {
        operationEvents.next({
          type: "ragged.finished",
          data: responseHistory,
        });
        operationEvents.complete();
      });

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
