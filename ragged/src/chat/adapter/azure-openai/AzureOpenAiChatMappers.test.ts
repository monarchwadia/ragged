import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { AzureOpenAiChatMappers } from "./AzureOpenAiChatMappers";
import { mapToOpenAi } from "../openai/OpenAiChatMappers";
import { AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { Message } from "../../Chat.types";
import { ApiClient } from "../../../support/ApiClient";

describe("AzureOpenAiChatMappers", () => {
    let apiClient: ApiClient;

    beforeEach(() => {
        apiClient = new ApiClient();
    })

    it("should compile", () => {
        const mappers = new AzureOpenAiChatMappers();
    })

    describe("mapToOpenAi", () => {
        it("can map from chat adapter request", () => {
            const request: Message[] = [
                {
                    type: "user",
                    text: "Hello"
                }
            ];


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

        it('filters out error messages', () => {
            const request: Message[] = [
                {
                    type: "error",
                    text: "Hello"
                }
            ];

            const result = AzureOpenAiChatMappers.mapToOpenAi(request);
            expect(result).toEqual({
                messages: []
            });
        });
    });

    describe("mapFromOpenAi", () => {
        it("can map from chat adapter response", () => {
            const response: AzureOpenAiChatCompletionResponseBody = {
                id: "1",
                created: 1,
                model: "test",
                object: "text_completion",
                usage: {
                    completion_tokens: 1,
                    prompt_tokens: 1,
                    total_tokens: 1
                },
                choices: [
                    {
                        finish_reason: "stop",
                        index: 0,
                        message: {
                            role: "assistant",
                            content: "Hello"
                        }
                    }
                ]
            };

            const result = AzureOpenAiChatMappers.mapFromOpenAi(response);
            expect(result).toEqual([
                {
                    text: "Hello",
                    type: "bot"
                }
            ]);
        });
    });
}); 