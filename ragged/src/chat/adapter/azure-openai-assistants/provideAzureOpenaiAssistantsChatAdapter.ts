import { AzureOaiaDaoCommonConfig } from "./Dao.types";
import { AzureOaiaChatAdapter } from "./adapter/AzureOaiaChatAdapter";
import { AzureOaiaDao } from "./assistant/AzureOaiaAssistantDao";
import { AzureOaiaMessageDao } from "./message/AzureOaiaMessageDao";
import { AzureOaiaRunDao } from "./run/AzureOaiaRunDao";
import { AzureOaiaThreadDao } from "./thread/AzureOaiaThreadDao";

export type AzureOpenaiAssistantsChatProviderParam = {
    config: AzureOaiaDaoCommonConfig;
}

export const provideAzureOpenaiAssistantsChatAdapter = (params: AzureOpenaiAssistantsChatProviderParam): AzureOaiaChatAdapter => {
    const assistantDao = new AzureOaiaDao(params.config);
    const threadDao = new AzureOaiaThreadDao(params.config);
    const messageDao = new AzureOaiaMessageDao(params.config);
    const runDao = new AzureOaiaRunDao(params.config);

    const adapter = new AzureOaiaChatAdapter({
        config: params.config,
        assistantDao,
        threadDao,
        messageDao,
        runDao
    });

    return adapter;
}