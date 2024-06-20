import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatAdapter, OaiaChatAdapterConstructorOpts } from "./OaiaChatAdapter";

describe("OaiaChatAdapter", () => {
    it("can instantiate", () => {
        const apiClient = new ApiClient();

        const opts: OaiaChatAdapterConstructorOpts = {
            apiKey: "not-real",
            assistantConfig: { assistantId: "test" },
            assistantDao: new OaiaAssistantDao(apiClient),
            threadDao: new OaiaThreadDao(apiClient),
            messageDao: new OaiaMessageDao(apiClient),
            runDao: new OaiaRunDao(apiClient)
        };

        const adapter = new OaiaChatAdapter(opts);

        expect(adapter).toBeDefined();
    })
});