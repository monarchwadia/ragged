import { startPollyRecording } from "../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { AzureOpenAiChatAdapter } from "./AzureOpenAiChatAdapter";

describe("AzureOpenAiChatAdapter", () => {
    let apiClient: ApiClient;
    let adapter: AzureOpenAiChatAdapter;

    beforeEach(() => {
        apiClient = new ApiClient();
        adapter = new AzureOpenAiChatAdapter({
            apiKey: process.env.AZURE_OPENAI_API_KEY || "",
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || "",
            resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || "",
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || ""
        });
    });

    it.skip("makes a call to the api", async () => {
        const polly = startPollyRecording("AzureOpenAiChatAdapter-makes-a-call-to-the-api");
        const response = await adapter.chat({
            history: [
                {
                    type: "user",
                    text: "Hello"
                }
            ],
            context: {
                apiClient
            }
        });

        expect(response).toMatchObject({
            history: [
                {
                    type: "bot",
                    text: expect.any(String)
                }
            ]
        });

        await polly.stop();
    });
})

