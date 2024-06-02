import { DriverApiClient } from "../../driver/DriverApiClient";
import { OpenAiChatCompletionRequestBody } from "../../driver/OpenAi/OpenAiApiTypes";
import { OpenAiChatDriver } from "../../driver/OpenAi/OpenAiChatDriver";
import { ChatRequest } from "../BaseChatAdapter.types";
import { OpenAiChatAdapter } from "./OpenAiChatAdapter";

describe("OpenAiChatAdapter", () => {
    let adapter: OpenAiChatAdapter
    beforeEach(() => {
        const driver = new OpenAiChatDriver(new DriverApiClient());
        adapter = new OpenAiChatAdapter(driver);
    })
    describe("mapToOpenAi", () => {
        it("should map empty request to OpenAi format", () => {
            const request: ChatRequest = {
                content: []
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: []
            };

            const result = adapter.mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should map request to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                content: [
                    { type: "user", text: "Hello" },
                    { type: "bot", text: "Hi" }
                ]
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "user", content: "Hello" },
                    { role: "bot", content: "Hi" }
                ]
            };

            const result = adapter.mapToOpenAi(request);
            expect(result).toEqual(expected);
        });
    });
});