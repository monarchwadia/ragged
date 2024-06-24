import { ApiClient } from "../../../support/ApiClient.js";
import { CohereChatAdapter } from "./CohereChatAdapter.js";
import type { CohereChatAdapterConfig } from "./CohereChatAdapter.js";

export type CohereChatProviderParam = {
    config?: Partial<CohereChatAdapterConfig>;
    apiClient?: ApiClient;
}
export const provideCohereChatAdapter = (params: CohereChatProviderParam = {}): CohereChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();
    const config = params.config || {};

    const adapter = new CohereChatAdapter(apiClient, config);

    return adapter;
}
