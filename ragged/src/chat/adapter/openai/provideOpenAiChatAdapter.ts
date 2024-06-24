import { ApiClient } from "../../../support/ApiClient";
import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from "./OpenAiChatAdapter";

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
