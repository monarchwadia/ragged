import { startPollyRecording } from "../../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatAdapter } from "./OaiaChatAdapter";

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
                    description: "test"
                }
            },
            assistantDao,
            threadDao,
            messageDao,
            runDao
        });
    });

    it("can instantiate", () => {
        expect(adapter).toBeDefined();
    })

    it.only("can chat", async () => {
        const polly = startPollyRecording("OaiaChatAdapter > can chat", {
            matchRequestsBy: {
                order: true
            }
        });

        const response = await adapter.chat({
            history: [
                { text: "Hello", type: "user" },
            ],
            model: "gpt-3.5-turbo"
        });

        polly.stop();

        expect(response).toMatchObject({
            history: [
                { text: 'Hello! How can I assist you today?', type: 'bot' }
            ]
        });
    })
});