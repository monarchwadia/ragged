import type { OpenAI } from "openai";

type DeltaCollection = {
  content: string;
  role: string;
  toolCalls?: DeltaCollectionToolCall[];
};

type DeltaCollectionToolCall = {
  name: string;
  arguments: string;
  id: string;
};

export type OpenAiChatCompletionDetectorEvent =
  | {
      type: "CHAT_COMPLETION_START";
      index: number;
    }
  | {
      type: "CHAT_COMPLETION_CHUNK";
      index: number;
      content: string;
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
      toolCalls?: DeltaCollectionToolCall[];
    }
  | {
      type: "TOOL_USE_START";
      index: number;
      toolCallIndex: number;
      toolCall: {
        id: string;
        name: string;
      };
    }
  | {
      type: "TOOL_USE_FINISH";
      index: number;
      toolCallIndex: number;
      toolCall: {
        id: string;
        name: string;
        arguments: string;
      };
    };

type Listener = (obj: OpenAiChatCompletionDetectorEvent) => void;

export class OpenAiChatCompletionDetector {
  private listeners: Listener[] = [];
  private deltaCollections: DeltaCollection[] = [];

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
      const { index: choiceIndex, delta, logprobs, finish_reason } = choice;

      let dc: DeltaCollection;

      if (this.deltaCollections[choiceIndex]) {
        dc = this.deltaCollections[choiceIndex];
      } else {
        dc = {
          content: delta.content || "",
          role: delta.role || "",
        };

        this.deltaCollections[choiceIndex] = dc;

        this.emit({
          type: "CHAT_COMPLETION_START",
          index: choiceIndex,
        });
      }

      if (delta.content) {
        dc.content += delta.content;
      }

      if (delta.role) {
        dc.role = delta.role;
      }

      this.emit({
        type: "CHAT_COMPLETION_CHUNK",
        // if the content is falsey (such as null or undefined), then we send an empty string
        content: delta.content || "",
        index: choiceIndex,
      });

      this.emit({
        type: "CHAT_COMPLETION_COLLECT",
        index: choiceIndex,
        content: dc.content,
      });

      // tool calls

      if (delta.tool_calls) {
        if (!dc.toolCalls) {
          dc.toolCalls = [];
        }

        for (let i = 0; i < delta.tool_calls.length; i++) {
          const {
            index: toolCallIndex,
            function: _function,
            id,
            type,
          } = delta.tool_calls[i];

          let dctWasNewlyCreated = false;
          let dct: DeltaCollectionToolCall;

          if (dc.toolCalls[toolCallIndex]) {
            dct = dc.toolCalls[toolCallIndex];
          } else {
            dctWasNewlyCreated = true;
            dct = {
              name: "",
              arguments: "",
              id: "",
            };

            dc.toolCalls[toolCallIndex] = dct;
          }

          dct.arguments += _function?.arguments || "";
          dct.name += _function?.name || "";
          dct.id += id || "";

          if (dctWasNewlyCreated) {
            this.emit({
              type: "TOOL_USE_START",
              index: choiceIndex,
              toolCallIndex,
              toolCall: {
                name: dct.name,
                id: dct.id,
              },
            });
          }
        }
      }

      if (finish_reason) {
        const parsedToolCalls = [];

        if (dc.toolCalls) {
          for (let i = 0; i < dc.toolCalls.length; i++) {
            // parse the args
            // TODO: Error checking for parsing
            const args = JSON.parse(dc.toolCalls[i].arguments);

            const parsedToolCall = {
              name: dc.toolCalls[i].name,
              arguments: args,
              id: dc.toolCalls[i].id,
            };

            parsedToolCalls.push(parsedToolCall);

            this.emit({
              type: "TOOL_USE_FINISH",
              index: choiceIndex,
              toolCallIndex: i,
              toolCall: parsedToolCall,
            });
          }
        }

        const chatCompletionEvt: OpenAiChatCompletionDetectorEvent = {
          type: "CHAT_COMPLETION_FINISH",
          index: choiceIndex,
          content: dc.content,
        };

        if (parsedToolCalls.length) {
          chatCompletionEvt.toolCalls = parsedToolCalls;
        }

        this.emit(chatCompletionEvt);
      }
    }
  }

  listen(cb: Listener) {
    this.listeners.push(cb);
  }

  private emit(evt: OpenAiChatCompletionDetectorEvent) {
    for (const listener of this.listeners) {
      listener(structuredClone(evt));
    }
  }
}
