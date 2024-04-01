import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predictStream, predict } from "./predict";

type RaggedConfiguration = {
  openai: ClientOptions;
};

export class Ragged {
  constructor(private config: RaggedConfiguration) {}

  predictStream(text: string) {
    const o = buildOpenAI(this.config.openai);
    return predictStream(o, text);
  }

  predict(text: string) {
    const o = buildOpenAI(this.config.openai);
    return predict(o, text);
  }
}
