import { ApiClient } from "../../../support/ApiClient";
import { AzureOpenAiChatAdapter } from "./AzureOpenAiChatAdapter";

describe("AzureOpenAiChatAdapter", () => {
    it("should instantiate", () => {
        const apiClient = new ApiClient();
        const adapter = new AzureOpenAiChatAdapter(apiClient);
    });
})

