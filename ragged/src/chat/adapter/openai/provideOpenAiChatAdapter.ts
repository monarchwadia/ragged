import { ApiClient } from "../../../support/ApiClient";
import { OpenAiChatAdapter } from "./adapter";
import { OpenAiChatDriver, OpenAiChatDriverConfig } from "./driver"

export type OpenAiChatProviderParam = {
    config?: Partial<OpenAiChatDriverConfig>;
    apiClient?: ApiClient;
}
export const provideOpenAiChatAdapter = (params: OpenAiChatProviderParam = {}): OpenAiChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();
    const config = params.config || {};

    const driver = new OpenAiChatDriver(apiClient, config);
    const adapter = new OpenAiChatAdapter(driver)

    return adapter;
}
