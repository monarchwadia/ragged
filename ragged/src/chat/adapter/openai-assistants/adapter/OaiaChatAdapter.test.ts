import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatAdapter } from "./OaiaChatAdapter";

describe("OaiaChatAdapter", () => {
    const apiKey: string = process.env.OPENAI_API_KEY as string;
    // const apiKey: string = "not-real";
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
            apiKey,
            assistantConfig: {
                name: "test-agent",
                instructions: "test",
                model: "gpt-3.5-turbo",
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
        const response = await adapter.chat({
            history: [
                { text: "Hello", type: "user" },
            ],
            model: "gpt-3.5-turbo",
            tools: [],
        });

        console.log(response);

        // const response = await adapter.chat(request);
    })
});