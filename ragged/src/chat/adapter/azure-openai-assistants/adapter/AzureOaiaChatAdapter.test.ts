import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "../assistant/AzureOaiaAssistantDao";
import { AzureOaiaMessageDao } from "../message/AzureOaiaMessageDao";
import { AzureOaiaRunDao } from "../run/AzureOaiaRunDao";
import { AzureOaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaChatAdapter } from "./AzureOaiaChatAdapter";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

describe("AzureOaiaChatAdapter", () => {
    // const apiKey: string = process.env.OPENAI_API_KEY as string;
    let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
    let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
    let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
    let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
    let modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";
    let apiClient: ApiClient;
    let assistantDao: AzureOaiaDao;
    let threadDao: AzureOaiaThreadDao;
    let messageDao: AzureOaiaMessageDao;
    let runDao: AzureOaiaRunDao;
    let adapter: AzureOaiaChatAdapter;

    beforeEach(() => {
        const config: AzureOaiaDaoCommonConfig = {
            apiKey,
            resourceName,
            deploymentName,
            apiVersion,
        };
        apiClient = new ApiClient();
        assistantDao = new AzureOaiaDao(apiClient, config);
        threadDao = new AzureOaiaThreadDao(apiClient, config);
        messageDao = new AzureOaiaMessageDao(apiClient, config);
        runDao = new AzureOaiaRunDao(apiClient, config);

        adapter = new AzureOaiaChatAdapter({
            config,
            assistantDao,
            threadDao,
            messageDao,
            runDao,
        });
    });

    it("can instantiate", () => {
        expect(adapter).toBeDefined();
    });

    it("can chat", async () => {
        const polly = startPollyRecording("AzureOaiaChatAdapter > can chat", {
            matchRequestsBy: {
                order: true,
            }
        });

        const response = await adapter.chat({
            history: [{ text: "Hello, whats your name?", type: "user" }],
            model: modelName
        });

        polly.stop();

        expect(response).toMatchInlineSnapshot();
    }, 10000);
});
