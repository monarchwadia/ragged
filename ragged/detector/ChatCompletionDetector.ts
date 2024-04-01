import type { OpenAI } from "openai";

type DeltaCollection = {
  content: string;
  role: string;
};

export type ChatCompletionDetectorEvent =
  | {
      type: "CHAT_COMPLETION_START";
      index: number;
    }
  | {
      type: "CHAT_COMPLETION_CHUNK";
      index: number;
      content: string | null | undefined;
    }
  | {
      type: "CHAT_COMPLETION_COLLECT";
      index: number;
      content: string;
    }
  | {
      type: "CHAT_COMPLETION_FINISH";
      index: number;
      content: string;
    };

type Listener = (obj: ChatCompletionDetectorEvent) => void;

export class ChatCompletionDetector {
  private listeners: Listener[] = [];
  private collection: DeltaCollection[] = [];

  scan(obj: unknown) {
    // check if the object is a chat completion chunk
    const isChatCompletionChunk =
      obj instanceof Object &&
      obj.hasOwnProperty("object") &&
      // @ts-expect-error
      obj["object"] === "chat.completion.chunk";

    if (!isChatCompletionChunk) {
      return;
    }

    // it is a chat completion chunk. now, collect it.

    const chunk = obj as OpenAI.Chat.ChatCompletionChunk;
    for (const choice of chunk.choices) {
      const { index, delta, logprobs, finish_reason } = choice;

      if (!this.collection[index]) {
        this.collection[index] = {
          content: delta.content || "",
          role: delta.role || "",
        };
        this.emit({
          type: "CHAT_COMPLETION_START",
          index,
        });
      }

      if (delta.content) {
        this.collection[index].content += delta.content;
      }

      if (delta.role) {
        this.collection[index].role = delta.role;
      }

      this.emit({
        type: "CHAT_COMPLETION_CHUNK",
        content: delta.content,
        index,
      });

      this.emit({
        type: "CHAT_COMPLETION_COLLECT",
        index,
        content: this.collection[index].content,
      });

      if (finish_reason) {
        this.emit({
          type: "CHAT_COMPLETION_FINISH",
          index,
          content: this.collection[index].content,
        });
      }
    }
  }

  listen(cb: Listener) {
    this.listeners.push(cb);
  }

  private emit(evt: ChatCompletionDetectorEvent) {
    for (const listener of this.listeners) {
      listener(evt);
    }
  }
}
