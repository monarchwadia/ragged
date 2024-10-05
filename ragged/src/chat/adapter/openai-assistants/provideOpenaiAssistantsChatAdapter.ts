// import { ApiClient } from "../../../support/ApiClient";
// import { OpenAiChatAdapter, OpenAiChatAdapterConfig } from ".";

import { ApiClient } from "../../../support/ApiClient";
import { OaiaChatAdapter, OpenaiAssistantsChatAdapterConfig } from "./adapter/OaiaChatAdapter";
import { OaiaAssistantDao } from "./assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "./message/OaiaMessageDao";
import { OaiaRunDao } from "./run/OaiaRunDao";
import { OaiaThreadDao } from "./thread/OaiaThreadDao";

export type OpenaiAssistantsChatProviderParam = {
    config: OpenaiAssistantsChatAdapterConfig;
}

export const provideOpenaiAssistantsChatAdapter = (params: OpenaiAssistantsChatProviderParam): OaiaChatAdapter => {
    const assistantDao = new OaiaAssistantDao();
    const threadDao = new OaiaThreadDao();
    const messageDao = new OaiaMessageDao();
    const runDao = new OaiaRunDao();

    const adapter = new OaiaChatAdapter({
        config: params.config,
        assistantDao,
        threadDao,
        messageDao,
        runDao
    });

    return adapter;
}