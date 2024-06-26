import { ApiClient } from "../../../support/ApiClient";
import { AzureOaiaDaoCommonConfig } from "./Dao.types";
import { AzureOaiaChatAdapter } from "./adapter/AzureOaiaChatAdapter";
import { AzureOaiaDao } from "./assistant/AzureOaiaAssistantDao";
import { AzureOaiaMessageDao } from "./message/AzureOaiaMessageDao";
import { AzureOaiaRunDao } from "./run/AzureOaiaRunDao";
import { AzureOaiaThreadDao } from "./thread/AzureOaiaThreadDao";

export type OpenaiAssistantsChatProviderParam = {
    config: AzureOaiaDaoCommonConfig;
    apiClient?: ApiClient;
}

export const provideAzureOpenaiAssistantsChatAdapter = (params: OpenaiAssistantsChatProviderParam): AzureOaiaChatAdapter => {
    const apiClient = params.apiClient || new ApiClient();

    const assistantDao = new AzureOaiaDao(apiClient, params.config);
    const threadDao = new AzureOaiaThreadDao(apiClient, params.config);
    const messageDao = new AzureOaiaMessageDao(apiClient, params.config);
    const runDao = new AzureOaiaRunDao(apiClient, params.config);

    const adapter = new AzureOaiaChatAdapter({
        config: params.config,
        assistantDao,
        threadDao,
        messageDao,
        runDao
    });

    return adapter;
}