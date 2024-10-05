import { OllamaChatAdapter } from "./OllamaChatAdapter";
import { OllamaChatAdapterConfig } from "./OllamaChatAdapterTypes";

export type OllamaChatProviderParam = {
  config: OllamaChatAdapterConfig;
}

export const provideOllamaChatAdapter = (params: OllamaChatProviderParam): OllamaChatAdapter => {
  const config = params.config;

  const adapter = new OllamaChatAdapter(config);

  return adapter;
}
