// import { ApiClient } from "../../../support/ApiClient";
// import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from ".";

import { ApiClient } from "../../../support/ApiClient";
import { AzureOaiaChatAdapter, AzureOpenaiAssistantsChatAdapterConfig } from "./adapter/AzureOaiaChatAdapter";
import { AzureOaiaAssistantDao } from "./assistant/AzureOaiaAssistantDao";
import { OaiaMessageDao } from "./message/AzureOaiaMessageDao";
import { OaiaRunDao } from "./run/AzureOaiaRunDao";
import { OaiaThreadDao } from "./thread/AzureOaiaThreadDao";

// export type OpenAiChatProviderParam = {
//     config?: Partial<OpenAiChatAdapterConfig>;
//     apiClient?: ApiClient;
// }
// export const provideOpenAiChatAdapter = (params: OpenAiChatProviderParam = {}): OpenAiChatAdapter => {
//     const apiClient = params.apiClient || new ApiClient();
//     const config = params.config || {};

//     const adapter = new OpenAiChatAdapter(apiClient, config)

//     return adapter;
// }

export type OpenaiAssistantsChatProviderParam = {
    config: AzureOpenaiAssistantsChatAdapterConfig;
    apiClient?: ApiClient;
}

export const provideAzureOpenaiAssistantsChatAdapter = (params: OpenaiAssistantsChatProviderParam): AzureOaiaChatAdapter => {
    const config = params.config || {};
    const apiClient = params.apiClient || new ApiClient();

    const assistantDao = new AzureOaiaAssistantDao(apiClient);
    const threadDao = new OaiaThreadDao(apiClient);
    const messageDao = new OaiaMessageDao(apiClient);
    const runDao = new OaiaRunDao(apiClient);

    const adapter = new AzureOaiaChatAdapter({
        config: config,
        assistantDao,
        threadDao,
        messageDao,
        runDao
    });

    return adapter;
}