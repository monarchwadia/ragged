import { Subject } from "rxjs";
import type { OpenAI } from "openai";
import { ChatCompletionDetector } from "../detector/ChatCompletionDetector";

type LlmStreamEvent =
  | { type: "started"; index: number }
  | { type: "chunk"; index: number; payload: string }
  | { type: "collected"; index: number; payload: string }
  | { type: "finished"; index: number; payload: string };

export const predictStream = (o: OpenAI, prompt: string) => {
  const operationEvents = new Subject<LlmStreamEvent>();

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

  const chatCompletionDetector = new ChatCompletionDetector();
  chatCompletionDetector.listen((evt) => {
    const { type, index } = evt;

    switch (type) {
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
      case "CHAT_COMPLETION_START":
        operationEvents.next({ type: "started", index });
        break;
    }
  });

  response
    .then((response) => {
      for (const chunk in response) {
        chatCompletionDetector.scan(chunk);
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("An error occurred:", error);

      // You might want to emit an 'error' event instead
      operationEvents.error(error);
    });

  return operationEvents;
};

export const predict = (o: OpenAI, text: string) => {
  const p$ = predictStream(o, text);
  return new Promise<string>((resolve) => {
    p$.subscribe((event) => {
      if (event.type === "finished") {
        resolve(event.payload);
      }
    });
  });
};
