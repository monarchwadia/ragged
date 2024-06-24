import { ApiClient } from "../../../support/ApiClient";
import { AzureOpenAiChatAdapter } from "./AzureOpenAiChatAdapter";

describe("AzureOpenAiChatAdapter", () => {
    it("should instantiate", () => {
        const apiClient = new ApiClient();
        const adapter = new AzureOpenAiChatAdapter(apiClient);
    });

    it("makes a call to the api", async () => {
        const apiClient = new ApiClient();
        const adapter = new AzureOpenAiChatAdapter(apiClient);
        const response = await adapter.chat({
            history: [
                {
                    type: "user",
                    text: "Hello"
                }
            ]
        });
    });
})

