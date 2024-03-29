import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predict, qPredict } from "./predict";

type LlmFunctionsConfiguration = {
  openai: ClientOptions;
};

export class LlmFunctions {
  constructor(private config: LlmFunctionsConfiguration) {}

  predict(text: string) {
    const o = buildOpenAI(this.config.openai);
    return predict(o, text);
  }

  qPredict(text: string) {
    const o = buildOpenAI(this.config.openai);
    return qPredict(o, text);
  }
}
