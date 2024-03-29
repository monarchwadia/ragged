import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predict, qPredict } from "./predict";

type RaggedConfiguration = {
  openai: ClientOptions;
};

export class Ragged {
  constructor(private config: RaggedConfiguration) {}

  predict(text: string) {
    const o = buildOpenAI(this.config.openai);
    return predict(o, text);
  }

  qPredict(text: string) {
    const o = buildOpenAI(this.config.openai);
    return qPredict(o, text);
  }
}
