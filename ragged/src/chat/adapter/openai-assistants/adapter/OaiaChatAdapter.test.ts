import { startPollyRecording } from "../../../../../test/startPollyRecording.js";
import { ApiClient } from "../../../../support/ApiClient.js";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao.js";
import { OaiaMessageDao } from "../message/OaiaMessageDao.js";
import { OaiaRunDao } from "../run/OaiaRunDao.js";
import { OaiaThreadDao } from "../thread/OaiaThreadDao.js";
import { OaiaChatAdapter } from "./OaiaChatAdapter.js";

describe("OaiaChatAdapter", () => {
    // const apiKey: string = process.env.OPENAI_API_KEY as string;
    const apiKey: string = "not-real";
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
