import { ApiClient } from "../../../support/ApiClient";
import { CohereChatAdapter, CohereChatAdapterConfig } from "./CohereChatAdapter";

export type CohereChatProviderParam = {
    config?: Partial<CohereChatAdapterConfig>;
    apiClient?: ApiClient;
}
export const provideCohereChatAdapter = (params: CohereChatProviderParam = {}): CohereChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();
    const config = params.config || {};

    // const driver = new OpenAiChatDriver(apiClient, config);
    // const adapter = new OpenAiChatAdapter(driver)

    const adapter = new CohereChatAdapter(apiClient, config);

    return adapter;
}
