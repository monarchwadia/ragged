import type { OpenAI } from "openai";
import { OpenAiChatCompletionDetector } from "./detector/OpenAiChatCompletionDetector";
import { RaggedHistoryItem } from "../types";
import { NewToolHolder } from "../../tool-use/types";
import { mapToolToOpenAi } from "./mapToolToOpenAi";
import { RaggedObservable } from "../../RaggedObservable";

export const chatStream = (
  o: OpenAI,
  raggedHistory: RaggedHistoryItem[],
  requestOverrides: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>,
  tools: NewToolHolder[]
) => {
  const responseHistory: RaggedHistoryItem[] = [];

  const chatCompletionDetector = new OpenAiChatCompletionDetector();

  const operationEvents = new RaggedObservable((subscriber) => {

    // set up the listener. the events are pushed to the listener elsewhere in this file.
    chatCompletionDetector.listen((evt) => {
      const { type, index } = evt;

      switch (type) {
        case "CHAT_COMPLETION_START": {
          subscriber.next({ type: "ragged.started" });
          break;
        }
        case "CHAT_COMPLETION_CHUNK": {
          subscriber.next({
            type: "text.chunk",
            index,
            data: evt.content,
          });
          break;
        }
        case "CHAT_COMPLETION_COLLECT": {
          subscriber.next({
            type: "text.joined",
            index,
            data: evt.content,
          });
          break;
        }
        case "CHAT_COMPLETION_FINISH": {
          subscriber.next({
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
          subscriber.next({ ...historyItem });
          break;
        }
        case "TOOL_USE_START": {
          subscriber.next({
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
          subscriber.next({
            type: "tool.inputs",
            index: evt.index,
            toolCallIndex: evt.toolCallIndex,
            data: toolUseRequestData,
          });

          // call the handler and push up the result in the events.
          // if the tool is not found, push up an error

          // utility function to emit the tool use finish event
          const emitToolUseFinish = (result: any) => {
            subscriber.next({
              type: "tool.finished",
              index: evt.index,
              toolCallIndex: evt.toolCallIndex,
              data: {
                name: evt.toolCall.name,
                arguments: evt.toolCall.arguments,
                result
              },
            });
            subscriber.next({
              type: "history.tool.request",
              toolName: evt.toolCall.name,
              toolRequestId: evt.toolCall.id,
              inputs: evt.toolCall.arguments,
            });
          }

          if (!tools?.length) {
            console.error(
              `LLM tried to call tool with name ${evt.toolCall.name} but no tools were provided.`
            );
            emitToolUseFinish(undefined);
            return;
          } else {
            const foundTool = tools.find(
              (tool) => tool.tool.title === evt.toolCall.name
            );
            if (!foundTool) {
              console.error(
                `LLM tried to call tool with name ${evt.toolCall.name} but no such tool was provided.`
              );
              emitToolUseFinish(undefined);
              return;
            }
            const handler = foundTool.handler;
            if (!handler) {
              console.error(
                `LLM tried to call tool with name ${evt.toolCall.name} but no handler was set on the tool.`
              );
              emitToolUseFinish(undefined);
              return;
            }

            // TODO: need to do validation
            // TODO: need to do try/catch around the handler
            const result = handler(evt.toolCall.arguments);

            // TODO: provide the result to the LLM in the openerationEvents
            emitToolUseFinish(result);

            const historyItem: RaggedHistoryItem = {
              type: "history.tool.result",
              toolName: evt.toolCall.name,
              toolRequestId: evt.toolCall.id,
              result,
            };
            subscriber.next(historyItem);
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

    const openaiHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    // this is there because tool_calls is actually a property on the AI's response object
    let toolCallHolder: OpenAI.ChatCompletionAssistantMessageParam | null = null;
    for (let ix = 0; ix < raggedHistory.length; ix++) {
      if (toolCallHolder) {
        toolCallHolder = null;
      }
      const rhi = raggedHistory[ix];
      if (rhi.type === "history.text") {
        let role: OpenAI.Chat.ChatCompletionMessageParam["role"];
        if (rhi.role === "human") {
          role = "user";
        } else if (rhi.role === "ai") {
          role = "assistant";
        } else if (rhi.role === "system") {
          role = "system";
        } else {
          throw new Error(
            `Error while mapping Ragged history to OpenAI history: Unknown role: ${rhi.role}. Valid roles for a Ragged "history.text" item are are human, ai, system`
          );
        }

        const textItem = {
          role,
          content: rhi.data.text,
        };

        openaiHistory.push(textItem);
        continue;
      } else if (rhi.type === "history.tool.request") {
        if (!toolCallHolder) {
          toolCallHolder = {
            role: "assistant",
            content: "",
            tool_calls: [],
          };
          openaiHistory.push(toolCallHolder);
        }

        toolCallHolder.tool_calls!.push({
          id: rhi.toolRequestId,
          type: "function",
          function: {
            arguments: JSON.stringify(rhi.inputs),
            name: rhi.toolName,
          }
        });


        continue;
        // return {
        //   role: "tool",
        //   tool_call_id: item.toolRequestId,
        //   content: JSON.stringify(item.inputs),
        // };
      } else if (rhi.type === "history.tool.result") {
        openaiHistory.push({
          role: "tool",
          tool_call_id: rhi.toolRequestId,
          content: JSON.stringify(rhi.result) || "",
        });
      } else {
        throw new Error(
          `Error while mapping Ragged history to OpenAI history: Unknown type: ${(rhi as any).type}. Valid types are "history.text", "history.tool.request", "history.tool.response"`
        );
      }
    }

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
          subscriber.next({
            type: "ragged.finished",
            data: responseHistory,
          });
          subscriber.complete();
        });

        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                return;
              }

              const val = decoder.decode(value);
              const json = JSON.parse(val);
              chatCompletionDetector.scan(json);
              read();
            })
            .catch((error) => {
              // Handle any errors that may have occurred
              console.error(
                "An error occurred while streaming responses from OpenAI:",
                error
              );

              // You might want to emit an 'error' event instead
              subscriber.error(error);
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
        subscriber.error(error);
      });
  })

  return operationEvents;
};
