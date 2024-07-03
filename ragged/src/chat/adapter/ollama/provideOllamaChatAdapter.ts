import { ApiClient } from "../../../support/ApiClient";
import { OllamaChatAdapter } from "./OllamaChatAdapter";
import { OllamaChatAdapterConfig } from "./OllamaChatAdapterTypes";

export type OllamaChatProviderParam = {
  config: OllamaChatAdapterConfig;
  apiClient?: ApiClient;
}

export const provideOllamaChatAdapter = (params: OllamaChatProviderParam): OllamaChatAdapter => {
  const apiClient = params.apiClient || new ApiClient();
  const config = params.config;

  const adapter = new OllamaChatAdapter(apiClient, config);

  return adapter;
}
