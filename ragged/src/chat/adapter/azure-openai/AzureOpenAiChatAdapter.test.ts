import { ApiClient } from "../../../support/ApiClient";
import { AzureOpenAiChatAdapter } from "./AzureOpenAiChatAdapter";

describe("AzureOpenAiChatAdapter", () => {
    let apiClient: ApiClient;
    let adapter: AzureOpenAiChatAdapter;

    beforeEach(() => {
        apiClient = new ApiClient();
        adapter = new AzureOpenAiChatAdapter(apiClient, {
            apiKey: process.env.AZURE_OPENAI_API_KEY || "",
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || "",
            resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || "",
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || ""
        });
    });

    it("makes a call to the api", async () => {
        const response = await adapter.chat({
            history: [
                {
                    type: "user",
                    text: "Hello"
                }
            ]
        });

        expect(response).toMatchObject({
            history: [
                {
                    type: "bot",
                    text: expect.any(String)
                }
            ]
        })
    });
})

