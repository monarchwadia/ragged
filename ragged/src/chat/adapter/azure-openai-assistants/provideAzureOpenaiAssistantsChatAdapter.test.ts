import { provideAzureOpenaiAssistantsChatAdapter } from "./provideAzureOpenaiAssistantsChatAdapter";

describe("provideAzureOpenaiAssistantsChatAdapter", () => {
    it("can instantiate", () => {
        const adapter = provideAzureOpenaiAssistantsChatAdapter({
            config: {
                apiKey: "not-real",
                resourceName: "not-real",
                deploymentName: "not-real",
                apiVersion: "not-real"
            }
        });
        expect(adapter).toBeDefined();
    });
});