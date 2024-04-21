import OpenAI, { ClientOptions } from "openai";
import { AbstractRaggedDriver } from "../AbstractRaggedDriver";
import {
  RaggedConfigValidationResult,
  RaggedLlmPromisableEvent,
  RaggedLlmStreamEvent,
} from "../types";
import { predictStream } from "./predictStream";
import { Subject } from "rxjs";
import { NewToolBuilder } from "../../tool-use/NewToolBuilder";
import { buildTool } from "../../tool-use/buildTool";

type PredictOptions = {
  tools: NewToolBuilder[];
  requestOverrides: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming>;
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

  predictStream(
    text: string,
    options?: PredictOptions
  ): Subject<RaggedLlmStreamEvent> {
    const o = new OpenAI(this.config);
    const tools = options?.tools.map((tool) => tool.build()) || [];

    const p$ = predictStream(o, text, options?.requestOverrides || {}, tools);
    return p$;
  }
  predict(
    text: string,
    options?: PredictOptions
  ): Promise<RaggedLlmPromisableEvent[]> {
    const o = new OpenAI(this.config);
    const tools = options?.tools.map((tool) => tool.build()) || [];

    const p$ = predictStream(o, text, options?.requestOverrides || {}, tools);
    return new Promise<RaggedLlmPromisableEvent[]>((resolve) => {
      let mostRecentlyCollected: RaggedLlmPromisableEvent | null = null;
      const events: RaggedLlmPromisableEvent[] = [];

      p$.subscribe((event) => {
        // for certain events, we don't want to include them in the final result because they're more relevant for streaming
        switch (event.type) {
          case "started":
          case "tool_use_start":
          case "chunk":
          case "collected":
            return;
          case "finished":
            events.push(event);
            resolve(events);
            return;
          case "tool_use_finish":
          case "tool_use_result":
            events.push(event);
            return;
          // TODO: error case
        }
      });
    });
  }
}
