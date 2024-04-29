import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "./AbstractRaggedDriver";
import { OpenAiRaggedDriver } from "./openai/OpenAiRaggedDriver";

export class UnknownProviderError extends Error {
  constructor(provider: string) {
    super(`Unknown provider: ${provider}`);
  }
}

export const resolveDriver = (
  config: RaggedConfiguration
): AbstractRaggedDriver<unknown, unknown> => {
  switch (config.provider) {
    case "openai":
      return new OpenAiRaggedDriver();
    // case "cohere":
    //   throw new UnknownProviderError(
    //     "cohere (not yet implemented, but on the roadmap!)"
    //   );
    default:
      throw new UnknownProviderError((config as any).provider);
  }
};
