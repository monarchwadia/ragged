// import { ApiClient } from "../../../support/ApiClient.js";
// import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from "..js";

import { ApiClient } from "../../../support/ApiClient.js";
import { OaiaChatAdapter } from "./adapter/OaiaChatAdapter.js";
import type { OpenaiAssistantsChatAdapterConfig } from "./adapter/OaiaChatAdapter.js";
import { OaiaAssistantDao } from "./assistant/OaiaAssistantDao.js";
import { OaiaMessageDao } from "./message/OaiaMessageDao.js";
import { OaiaRunDao } from "./run/OaiaRunDao.js";
import { OaiaThreadDao } from "./thread/OaiaThreadDao.js";

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