import { Subject } from "rxjs";
import type { OpenAI } from "openai";

type LlmStreamEventWithPayload = {
  type: "collected" | "finished";
  payload: string;
};
type LlmStreamEventWithoutPayload = {
  type: "started";
};

type LlmStreamEvent = LlmStreamEventWithPayload | LlmStreamEventWithoutPayload;

export const predict = (o: OpenAI, prompt: string) => {
  const operationEvents = new Subject<LlmStreamEvent>();

  const response = o.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  response
    .then((response) => {
      const answer = response.choices[0].message.content;

      // Emit a 'collected' event with the response data
      operationEvents.next({ type: "collected", payload: answer || "" });

      // When the operation is complete, emit a 'finished' event
      operationEvents.next({ type: "finished", payload: answer || "" });

      // Complete the Subject to let subscribers know the operation is done
      operationEvents.complete();
    })
    .catch((error) => {
      // Handle any errors
      console.error("An error occurred:", error);

      // You might want to emit an 'error' event instead
      operationEvents.error(error);
    });

  return operationEvents;
};

export const qPredict = (o: OpenAI, text: string) => {
  const p$ = predict(o, text);
  return new Promise<string>((resolve) => {
    p$.subscribe((event) => {
      if (event.type === "finished") {
        resolve(event.payload);
      }
    });
  });
};
