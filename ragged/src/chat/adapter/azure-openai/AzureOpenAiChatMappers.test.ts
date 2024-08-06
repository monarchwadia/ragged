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
        it("can map user messages from chat adapter request", () => {
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
                        content: [
                            {
                                type: "text",
                                text: "Hello"
                            }
                        ]
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

        it('correctly maps images', () => {
            const imgData = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC";
            const request: Message[] = [
                {
                    type: "user",
                    text: "What is in this image?",
                    attachments: [
                        {
                            type: "image",
                            payload: {
                                encoding: "base64_data_url",
                                data: imgData,
                                mimeType: "image/png",
                            },
                        }
                    ]
                }
            ];

            const result = AzureOpenAiChatMappers.mapToOpenAi(request);

            // this has to be the `chatCompletionRequestMessageUser` type
            // the messages need to be `chatCompletionRequestMessageContentPart` for the user

            expect(result.messages.length).toBe(1);
            const message0 = result.messages[0];
            expect(message0.role).toBe('user');
            expect(message0.content.length).toBe(2);
            if (message0.role !== "user") {
                throw new Error("expected role to be user, instead got " + message0.role);
            }

            expect(message0.content.length).toBe(2);

            const content0 = message0.content[0];
            if (content0.type !== "text") {
                throw new Error("expected content type to be text, instead got" + content0.type);
            }
            expect(content0.text).toBe("What is in this image?");

            const content1 = message0.content[1];
            if (content1.type !== "image_url") {
                throw new Error("expected content type to be text, instead got" + content1.type);
            }
            expect(content1.detail).toBe("auto");
            expect(content1.image_url.url).toBe("data:image/png;base64," + imgData);
        })
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