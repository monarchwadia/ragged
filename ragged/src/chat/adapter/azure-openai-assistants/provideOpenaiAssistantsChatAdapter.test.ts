import { provideAzureOpenaiAssistantsChatAdapter } from "./provideAzureOpenaiAssistantsChatAdapter";

describe("provideAzureOpenaiAssistantsChatAdapter", () => {
    it("can instantiate", () => {
        const adapter = provideAzureOpenaiAssistantsChatAdapter({
            config: {
                // apiKey: process.env.OPENAI_API_KEY as string,
                apiKey: "not-real",
                assistant: {
                    description: "test",
                    instructions: "test",
                    model: "gpt-3.5-turbo",
                    name: "test-agent"
                }
            }
        });
        expect(adapter).toBeDefined();
    });
});