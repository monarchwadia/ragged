import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "../assistant/AzureOaiaAssistantDao";
import { OaiaMessageDao } from "../message/AzureOaiaMessageDao";
import { OaiaRunDao } from "../run/AzureOaiaRunDao";
import { OaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaChatAdapter } from "./AzureOaiaChatAdapter";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

describe("AzureOaiaChatAdapter", () => {
    // const apiKey: string = process.env.OPENAI_API_KEY as string;
    let apiKey = process.env.AZURE_OPENAI_API_KEY || "";
    let apiVersion = process.env.AZURE_OPENAI_API_VERSION || "";
    let resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME || "";
    let deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";
    let apiClient: ApiClient;
    let assistantDao: AzureOaiaDao;
    let threadDao: OaiaThreadDao;
    let messageDao: OaiaMessageDao;
    let runDao: OaiaRunDao;
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
        threadDao = new OaiaThreadDao(apiClient, config);
        messageDao = new OaiaMessageDao(apiClient, config);
        runDao = new OaiaRunDao(apiClient, config);

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
            model: "gpt-3.5-turbo",
        });

        polly.stop();

        expect(response).toMatchInlineSnapshot(`
      {
        "history": [
          {
            "text": "Hello! I am an AI assistant, you can call me Assistant. How can I help you today?",
            "type": "bot",
          },
        ],
      }
    `);
    });
});
