import { ChatRequest } from "../index.types";
import { CohereChatMapper } from "./CohereChatMapper";

describe("CohereChatMapper", () => {
    it("should map a single user message to just the message field, and not contain any history field", () => {
        const request: ChatRequest = {
            history: [
                {
                    type: "user",
                    text: "Hello, how are you?"
                }
            ]
        };

        const mappedRequest = CohereChatMapper.mapChatRequestToApiRequest(request);

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

        const mappedRequest = CohereChatMapper.mapChatRequestToApiRequest(request);

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

        const mappedRequest = CohereChatMapper.mapChatRequestToApiRequest(request);

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
});