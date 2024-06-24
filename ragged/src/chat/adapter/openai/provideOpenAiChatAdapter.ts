import { ApiClient } from "../../../support/ApiClient.js";
import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from "./index.js";

export type OpenAiChatProviderParam = {
    config?: Partial<OpenAiChatAdapterConfig>;
    apiClient?: ApiClient;
}
export const provideOpenAiChatAdapter = (params: OpenAiChatProviderParam = {}): OpenAiChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();
    const config = params.config || {};

    const adapter = new OpenAiChatAdapter(apiClient, config)

    return adapter;
}
