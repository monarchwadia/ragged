import { OpenAI } from "openai";
import type { ClientOptions } from "openai";

export const buildOpenAI = (opts: ClientOptions) => {
  return new OpenAI(opts);
};
