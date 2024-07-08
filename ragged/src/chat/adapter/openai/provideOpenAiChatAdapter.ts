import { ApiClient } from "../../../support/ApiClient";
import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from "./OpenAiChatAdapter";

export type OpenAiChatProviderParam = {
    config?: Partial<OpenAiChatAdapterConfig>;
}
export const provideOpenAiChatAdapter = (params: OpenAiChatProviderParam = {}): OpenAiChatAdapter => {
    const config = params.config || {};

    const adapter = new OpenAiChatAdapter(config)

    return adapter;
}
