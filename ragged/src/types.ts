import type { ClientOptions } from "openai";

type OpenAiConfig = {
  provider: "openai";
  config: ClientOptions;
};

// type CohereConfig = {
//   provider: "cohere";
//   config: any;
// };

export type RaggedConfiguration = OpenAiConfig;
