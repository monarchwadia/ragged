import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "../assistant/AzureOaiaAssistantDao";
import { OaiaMessageDao } from "../message/AzureOaiaMessageDao";
import { OaiaRunDao } from "../run/AzureOaiaRunDao";
import { OaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaChatAdapter } from "./AzureOaiaChatAdapter";

describe("AzureOaiaChatAdapter", () => {
    // const apiKey: string = process.env.OPENAI_API_KEY as string;
    const apiKey: string = "not-real";
    const resourceName: string = "not-real";
    const deploymentName: string = "not-real";
    const apiVersion: string = "not-real";
    let apiClient: ApiClient;
    let assistantDao: AzureOaiaDao;
    let threadDao: OaiaThreadDao;
    let messageDao: OaiaMessageDao;
    let runDao: OaiaRunDao;
    let adapter: AzureOaiaChatAdapter;

    beforeEach(() => {
        apiClient = new ApiClient();
        assistantDao = new AzureOaiaDao(apiClient, {
            apiKey,
            resourceName,
            deploymentName,
            apiVersion,

        });
        threadDao = new OaiaThreadDao(apiClient);
        messageDao = new OaiaMessageDao(apiClient);
        runDao = new OaiaRunDao(apiClient);

        adapter = new AzureOaiaChatAdapter({
            config: {
                apiKey,
                assistant: {
                    name: "test-agent",
                    instructions: "test",
                    model: "gpt-3.5-turbo",
                    description: "test",
                },
            },
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
