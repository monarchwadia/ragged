import { ApiClient } from "../../../support/ApiClient";
import { CohereChatAdapter, CohereChatAdapterConfig } from "./CohereChatAdapter";

export type CohereChatProviderParam = {
    config?: Partial<CohereChatAdapterConfig>;
}
export const provideCohereChatAdapter = (params: CohereChatProviderParam = {}): CohereChatAdapter => {
    const config = params.config || {};

    const adapter = new CohereChatAdapter(config);

    return adapter;
}
