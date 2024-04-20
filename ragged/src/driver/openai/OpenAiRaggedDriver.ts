import OpenAI, { ClientOptions } from "openai";
import { AbstractRaggedDriver } from "../AbstractRaggedDriver";
import { RaggedConfigValidationResult, RaggedLlmStreamEvent } from "../types";
import { predictStream } from "./predictStream";
import { Subject } from "rxjs";
import { RaggedTool } from "../../RaggedTool";

type PredictOptions = {
  tools: RaggedTool[];
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
    const p$ = predictStream(
      o,
      text,
      options?.requestOverrides || {},
      options?.tools || []
    );
    return p$;
  }
  predict(text: string, options?: PredictOptions): Promise<string> {
    const o = new OpenAI(this.config);
    const p$ = predictStream(
      o,
      text,
      options?.requestOverrides || {},
      options?.tools || []
    );
    return new Promise<string>((resolve) => {
      p$.subscribe((event) => {
        if (event.type === "finished") {
          resolve(event.payload);
        }
      });
    });
  }
}
