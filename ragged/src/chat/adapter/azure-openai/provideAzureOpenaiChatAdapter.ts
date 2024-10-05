import { AzureOpenAiChatAdapter, AzureOpenAiChatAdapterConfig } from "./AzureOpenAiChatAdapter";

export type AzureOpenAiChatProviderParam = {
    config: AzureOpenAiChatAdapterConfig;
}
export const provideAzureOpenAiChatAdapter = (params: AzureOpenAiChatProviderParam): AzureOpenAiChatAdapter => {
    const adapter = new AzureOpenAiChatAdapter(params.config)

    return adapter;
}
