import { OpenAI } from "openai";
const { VITE_OPENAI_CREDS } = import.meta.env;
import { Subject } from "rxjs";

type LlmStreamEventWithPayload = {
  type: "collected" | "finished";
  payload: string;
};
type LlmStreamEventWithoutPayload = {
  type: "started";
};

type LlmStreamEvent = LlmStreamEventWithPayload | LlmStreamEventWithoutPayload;

const fetchOpenAICompletion = (prompt: string) => {
  const o = new OpenAI({
    apiKey: VITE_OPENAI_CREDS,
    dangerouslyAllowBrowser: true,
  });

  const operationEvents = new Subject<LlmStreamEvent>();

  const response = o.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
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

export const quickPredict = (text: string) => {
  return fetchOpenAICompletion(text);
};
