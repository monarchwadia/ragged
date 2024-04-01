import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predictStream } from "./predictStream";

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
    const p$ = predictStream(o, text);
    return new Promise<string>((resolve) => {
      p$.subscribe((event) => {
        if (event.type === "finished") {
          resolve(event.payload);
        }
      });
    });
  }
}
