import OpenAI, { ClientOptions } from "openai";
import { AbstractRaggedDriver } from "../AbstractRaggedDriver";
import {
  RaggedConfigValidationResult,
  RaggedHistoryItem,
  RaggedLlmStreamEvent,
} from "../types";
import { chatStream } from "./chatStream";
import { NewToolBuilder } from "../../tool-use/NewToolBuilder";
import { buildTool } from "../../tool-use/buildTool";
import { RaggedSubject } from "../../RaggedSubject";

type PredictOptions = {
  tools: NewToolBuilder[];
  requestOverrides?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>;
};

export class OpenAiRaggedDriver extends AbstractRaggedDriver<
  ClientOptions,
  Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>
> {
  initializeAndValidateConfiguration(
    opts: Object
  ): RaggedConfigValidationResult {
    try {
      new OpenAI(opts);
    } catch (e: any) {
      if (!e) {
        return {
          isValid: false,
          errors: ["Unknown error"],
        };
      }
      if (e instanceof Error) {
        return {
          isValid: false,
          errors: [e.message],
        };
      } else {
        return {
          isValid: false,
          errors: [e.toString()],
        };
      }
    }

    this.config = opts as ClientOptions;

    return {
      isValid: true,
    };
  }

  chatStream(
    history: RaggedHistoryItem[],
    options?: PredictOptions
  ): RaggedSubject {
    const o = new OpenAI(this.config);
    const tools = options?.tools.map((tool) => tool.build()) || [];

    const p$ = chatStream(o, history, options?.requestOverrides || {}, tools);
    return p$;
  }
  // chat(
  //   text: string,
  //   options?: PredictOptions
  // ): Promise<RaggedLlmPromisableEvent[]> {
  //   const o = new OpenAI(this.config);
  //   const tools = options?.tools.map((tool) => tool.build()) || [];

  //   const p$ = chatStream(o, text, options?.requestOverrides || {}, tools);
  //   return new Promise<RaggedLlmPromisableEvent[]>((resolve) => {
  //     let mostRecentlyCollected: RaggedLlmPromisableEvent | null = null;
  //     const events: RaggedLlmPromisableEvent[] = [];

  //     p$.subscribe((event) => {
  //       // for certain events, we don't want to include them in the final result because they're more relevant for streaming
  //       switch (event.type) {
  //         case "started":
  //         case "tool.started":
  //         case "text.chunk":
  //         case "text.joined":
  //           return;
  //         case "finished":
  //           events.push(event);
  //           resolve(events);
  //           return;
  //         case "tool.inputs":
  //         case "tool.finished":
  //           events.push(event);
  //           return;
  //         // TODO: error case
  //       }
  //     });
  //   });
  // }
}
