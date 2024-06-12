import { MappingError } from "../../../support/CustomErrors";
import { ChatRequest } from "../index.types";
import { CohereChatResponseRoot } from "./CohereApiResponseTypes";
import { CohereChatMapper } from "./CohereChatMapper";

describe("CohereChatMapper", () => {
    describe("mapChatRequestToApiRequest", () => {

        it("should map a single user message to just the message field, and not contain any history field", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "user",
                        text: "Hello, how are you?"
                    }
                ]
            };

            const mappedRequest = CohereChatMapper.mapChatRequestToCohereRequest(request);

            expect(mappedRequest).toMatchObject({
                message: "Hello, how are you?"
            });
        });

        it("should correctly match user and system messages", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "system",
                        text: "I am a system message"
                    },
                    {
                        type: "bot",
                        text: "I am a bot message"
                    },
                    {
                        type: "user",
                        text: "Hello, how are you?"
                    }
                ]
            };

            const mappedRequest = CohereChatMapper.mapChatRequestToCohereRequest(request);

            expect(mappedRequest).toMatchObject({
                chat_history: [
                    {
                        role: "SYSTEM",
                        message: "I am a system message"
                    },
                    {
                        role: "CHATBOT",
                        message: "I am a bot message"
                    }
                ],
                message: "Hello, how are you?"
            });
        });

        it("maps error messages to chatbot messages", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "error",
                        text: "I am an error message"
                    },
                    {
                        type: "user",
                        text: "Hello, how are you?"
                    }
                ]
            };

            const mappedRequest = CohereChatMapper.mapChatRequestToCohereRequest(request);

            expect(mappedRequest).toMatchObject({
                chat_history: [
                    {
                        role: "CHATBOT",
                        message: "I am an error message"
                    }
                ],
                message: "Hello, how are you?"
            });
        });

        it("throws an error if the last message in history was not a user message", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "system",
                        text: "I am a system message"
                    }
                ]
            };

            expect(() => CohereChatMapper.mapChatRequestToCohereRequest(request)).toThrow(MappingError);
        })

        it("throws an error if the last user message has no text", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "user",
                        text: ""
                    }
                ]
            };

            expect(() => CohereChatMapper.mapChatRequestToCohereRequest(request)).toThrow(MappingError);
        })

        it("throws an error if the last user message has null text", () => {
            const request: ChatRequest = {
                history: [
                    {
                        type: "user",
                        text: null
                    }
                ]
            };

            expect(() => CohereChatMapper.mapChatRequestToCohereRequest(request)).toThrow(MappingError);
        })

        it("throws an error if no history is provided", () => {
            const request: ChatRequest = {
                history: []
            };

            expect(() => CohereChatMapper.mapChatRequestToCohereRequest(request)).toThrow(MappingError);
        })
    })

    describe("mapChatResponseToApiResponse", () => {
        it("should map a single user message to just the message field, and not contain any history field", () => {
            const response: CohereChatResponseRoot = {
                chat_history: [
                    {
                        role: "USER",
                        message: "Hello, how are you?"
                    }
                ],
                response_id: "123",
                text: "I am a response",
                generation_id: "456",
                finish_reason: "completed",
                meta: {
                    api_version: {
                        version: "1.0"
                    },
                    billed_units: {
                        input_tokens: 1,
                        output_tokens: 1
                    },
                    tokens: {
                        input_tokens: 1,
                        output_tokens: 1
                    }
                }
            };

            const mappedResponse = CohereChatMapper.mapCohereResponseToChatResponse(response);

            expect(mappedResponse).toMatchObject({
                history: [
                    {
                        type: "user",
                        text: "Hello, how are you?"
                    }
                ]
            });
        });

        it("should map a complex response with multiple messages", () => {
            const response: CohereChatResponseRoot = {
                chat_history: [
                    {
                        role: "SYSTEM",
                        message: "I am a system message"
                    },
                    {
                        role: "CHATBOT",
                        message: "I am a bot message"
                    },
                    {
                        role: "USER",
                        message: "Hello, how are you?"
                    }
                ],
                response_id: "123",
                text: "I am a response",
                generation_id: "456",
                finish_reason: "completed",
                meta: {
                    api_version: {
                        version: "1.0"
                    },
                    billed_units: {
                        input_tokens: 1,
                        output_tokens: 1
                    },
                    tokens: {
                        input_tokens: 1,
                        output_tokens: 1
                    }
                }
            };

            const mappedResponse = CohereChatMapper.mapCohereResponseToChatResponse(response);

            expect(mappedResponse).toMatchObject({
                history: [
                    {
                        type: "system",
                        text: "I am a system message"
                    },
                    {
                        type: "bot",
                        text: "I am a bot message"
                    },
                    {
                        type: "user",
                        text: "Hello, how are you?"
                    }
                ]
            });
        });
    });
});