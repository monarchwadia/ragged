import { ApiClient } from "../../../support/ApiClient";
import { AzureOpenAiChatAdapter, AzureOpenAiChatAdapterConfig } from "./AzureOpenAiChatAdapter";

export type AzureOpenAiChatProviderParam = {
    config: AzureOpenAiChatAdapterConfig;
    apiClient?: ApiClient;
}
export const provideAzureOpenAiChatAdapter = (params: AzureOpenAiChatProviderParam): AzureOpenAiChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();

    const adapter = new AzureOpenAiChatAdapter(apiClient, params.config)

    return adapter;
}
