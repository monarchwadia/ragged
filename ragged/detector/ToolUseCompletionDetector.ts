import type { OpenAI } from "openai";

export type ToolUseDetectorEvent =
  | {
      type: "TOOL_USE_START";
      choiceIndex: number;
      toolCallIndex: number;
      toolCall: {
        name: string;
      };
    }
  | {
      type: "TOOL_USE_FINISH";
      choiceIndex: number;
      toolCallIndex: number;
      toolCall: {
        name: string;
        arguments: string;
      };
    };

type DeltaCollection = {
  choiceIndex: number;
  toolCallIndex: number;
  toolCall: {
    name: string;
    arguments: string;
  };
};

type Listener = (obj: ToolUseDetectorEvent) => void;

export class ToolUseCompletionDetector {
  private listeners: Listener[] = [];
  private collection: DeltaCollection[][] = [];

  scan(obj: unknown) {
    const isChatCompletionChunk =
      obj instanceof Object &&
      obj.hasOwnProperty("object") &&
      // @ts-expect-error
      obj["object"] === "chat.completion.chunk";

    if (!isChatCompletionChunk) {
      return;
    }

    const chunk = obj as OpenAI.Chat.ChatCompletionChunk;

    chunk.choices.forEach((choice) => {
      const isChatCompletionChunk =
        obj instanceof Object &&
        obj.hasOwnProperty("object") &&
        // @ts-expect-error
        obj["object"] === "chat.completion.chunk";

      if (!isChatCompletionChunk) {
        return;
      }

      if (choice.finish_reason === "stop") {
        for (const toolCallChoice of this.collection[choice.index]) {
          this.emit({
            type: "TOOL_USE_FINISH",
            choiceIndex: choice.index,
            toolCallIndex: toolCallChoice.toolCallIndex,
            toolCall: {
              name: toolCallChoice.toolCall.name,
              arguments: JSON.parse(toolCallChoice.toolCall.arguments),
            },
          });
        }
      }

      choice.delta.tool_calls?.forEach((toolCallChoice) => {
        const { type, function: _function } = toolCallChoice;

        if (typeof toolCallChoice.index !== "number") {
          return;
        }

        const choiceIndex = choice.index;
        const toolCallIndex = toolCallChoice.index;

        if (!this.collection[choiceIndex]) {
          this.collection[choiceIndex] = [];
        }

        let isNewlyCreated = false;
        if (!this.collection[choiceIndex][toolCallIndex]) {
          isNewlyCreated = true;
          this.collection[choiceIndex][toolCallIndex] = {
            choiceIndex,
            toolCallIndex,
            toolCall: {
              name: "",
              arguments: "",
            },
          };
        }

        const collection = this.collection[choiceIndex][toolCallIndex];
        collection.toolCall.name += _function?.name || "";
        collection.toolCall.arguments += _function?.arguments || "";

        if (isNewlyCreated) {
          this.emit({
            type: "TOOL_USE_START",
            choiceIndex,
            toolCallIndex,
            toolCall: {
              name: collection.toolCall.name,
            },
          });
        }
      });
    });
  }

  listen(cb: Listener) {
    this.listeners.push(cb);
  }

  private emit(evt: ToolUseDetectorEvent) {
    for (const listener of this.listeners) {
      listener(structuredClone(evt));
    }
  }
}
