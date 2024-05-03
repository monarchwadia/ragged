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
  constructor(protected config: ClientOptions) {
    super(config);
  }
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
}
