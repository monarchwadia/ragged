import { provideAzureOpenAiChatAdapter } from "./provideAzureOpenaiChatAdapter";

describe("provideAzureOpenaiChatAdapter", () => {
    it('can instantiate', () => {
        const adapter = provideAzureOpenAiChatAdapter({
            config: {
                apiKey: 'test',
                apiVersion: 'test',
                deploymentName: 'test',
                resourceName: 'test'
            }
        });
        expect(adapter).toBeDefined();
    });
});