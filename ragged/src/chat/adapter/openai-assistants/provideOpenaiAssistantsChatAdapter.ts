// import { ApiClient } from "../../../support/ApiClient";
// import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from ".";

import { ApiClient } from "../../../support/ApiClient";
import { OaiaChatAdapter, OpenaiAssistantsChatAdapterConfig } from "./adapter/OaiaChatAdapter";
import { OaiaAssistantDao } from "./assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "./message/OaiaMessageDao";
import { OaiaRunDao } from "./run/OaiaRunDao";
import { OaiaThreadDao } from "./thread/OaiaThreadDao";

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
    config: OpenaiAssistantsChatAdapterConfig;
    apiClient?: ApiClient;
}

export const provideOpenaiAssistantsChatAdapter = (params: OpenaiAssistantsChatProviderParam): OaiaChatAdapter => {
    const config = params.config || {};
    const apiClient = params.apiClient || new ApiClient();

    const assistantDao = new OaiaAssistantDao(apiClient);
    const threadDao = new OaiaThreadDao(apiClient);
    const messageDao = new OaiaMessageDao(apiClient);
    const runDao = new OaiaRunDao(apiClient);

    const adapter = new OaiaChatAdapter({
        config: config,
        assistantDao,
        threadDao,
        messageDao,
        runDao
    });

    return adapter;
}