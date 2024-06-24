import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { AzureOpenAiChatMappers } from "./AzureOpenAiChatMappers";

describe("AzureOpenAiChatMappers", () => {
    it("should compile", () => {
        const mappers = new AzureOpenAiChatMappers();
    })

    describe("mapToOpenAi", () => {
        it("can map from chat adapter request", () => {
            const request: ChatAdapterRequest = {
                history: [
                    {
                        type: "user",
                        text: "Hello"
                    }
                ]
            };
            const result = AzureOpenAiChatMappers.mapToOpenAi(request);
            expect(result).toEqual({
                messages: [
                    {
                        role: "user",
                        content: "Hello"
                    }
                ]
            });
        });
    });
}); 