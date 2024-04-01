import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predictStream } from "./predictStream";
import type { PredictOptions } from "./predictStream";

type RaggedConfiguration = {
  openai: ClientOptions;
};

export class Ragged {
  constructor(private config: RaggedConfiguration) {}

  predictStream(text: string, opts?: Partial<PredictOptions>) {
    const o = buildOpenAI(this.config.openai);
    return predictStream(o, text, opts);
  }

  predict(text: string, opts?: Partial<PredictOptions>) {
    const o = buildOpenAI(this.config.openai);
    const p$ = predictStream(o, text, opts);
    return new Promise<string>((resolve) => {
      p$.subscribe((event) => {
        if (event.type === "finished") {
          resolve(event.payload);
        }
      });
    });
  }
}
