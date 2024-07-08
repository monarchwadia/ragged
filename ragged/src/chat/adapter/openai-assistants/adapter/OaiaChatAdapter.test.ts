import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatAdapter } from "./OaiaChatAdapter";

describe("OaiaChatAdapter", () => {
    const apiKey: string = process.env.OPENAI_API_KEY || "";
    let apiClient: ApiClient;
    let assistantDao: OaiaAssistantDao;
    let threadDao: OaiaThreadDao;
    let messageDao: OaiaMessageDao;
    let runDao: OaiaRunDao;
    let adapter: OaiaChatAdapter;

    beforeEach(() => {
        apiClient = new ApiClient();
        assistantDao = new OaiaAssistantDao(apiClient);
        threadDao = new OaiaThreadDao(apiClient);
        messageDao = new OaiaMessageDao(apiClient);
        runDao = new OaiaRunDao(apiClient);

        adapter = new OaiaChatAdapter({
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
        const polly = startPollyRecording("OaiaChatAdapter > can chat", {
            matchRequestsBy: {
                order: true,
            },
        });

        const response = await adapter.chat({
            history: [{ text: "Hello, whats your name?", type: "user" }],
            model: "gpt-3.5-turbo",
        });

        await polly.stop();
        expect(response.history).toMatchInlineSnapshot(`
      [
        {
          "text": "Hello! I am an AI assistant, you can call me Assistant. How can I help you today?",
          "type": "bot",
        },
      ]
    `);
        expect(response.raw.request).toBeNull();
        expect(response.raw.response).toBeNull();
    });
});
