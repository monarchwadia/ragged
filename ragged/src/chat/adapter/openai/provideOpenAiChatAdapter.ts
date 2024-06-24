import { ApiClient } from "../../../support/ApiClient.js";
import { OpenAiChatAdapter } from "./OpenAiChatAdapter.js";
import type { OpenAiChatAdapterConfig } from "./OpenAiChatAdapter.js";

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
