import { Subject } from "rxjs";
import type { OpenAI } from "openai";
import { ChatCompletionDetector } from "../detector/OpenAiChatCompletionDetector";

type LlmStreamEvent =
  | { type: "started"; index: number }
  | { type: "chunk"; index: number; payload: string }
  | { type: "collected"; index: number; payload: string }
  | { type: "finished"; index: number; payload: string }
  | {
      type: "tool_use_start";
      index: number;
      toolCallIndex: number;
      payload: {
        name: string;
      };
    }
  | {
      type: "tool_use_finish";
      index: number;
      toolCallIndex: number;
      payload: {
        name: string;
        arguments: unknown;
      };
    };

export const predictStream = (o: OpenAI, prompt: string) => {
  const operationEvents = new Subject<LlmStreamEvent>();

  const chatCompletionDetector = new ChatCompletionDetector();

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
        break;
    }
  });

  const response = o.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

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
