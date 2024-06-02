import { MappingError } from "../../../support/CustomErrors";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "../../driver/OpenAi/OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../BaseChatAdapter.types";
import { mapFromOpenAi, mapToOpenAi } from "./mappers";

describe("OpenAiChatAdapter Mappers", () => {
    describe("mapToOpenAi", () => {
        it("should map empty request to OpenAi format", () => {
            const request: ChatRequest = {
                history: []
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: []
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should map request to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [
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

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should map request to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [
                    { type: "user", text: "Hello" },
                    { type: "bot", text: "Hi" }
                ]
            };

            // to test error throwing, replace .map function with a function that throws an error
            // we know that .map is called inside the mapping function
            const expectedErr = new Error("ExpectedError");
            request.history.map = () => { throw expectedErr };

            let thrownError: Error | null = null;
            try {
                mapToOpenAi(request)
            } catch (e) {
                thrownError = e as Error;
            }

            expect(thrownError).toBeInstanceOf(MappingError);
            expect((thrownError as MappingError).cause).toBe(expectedErr);
        });
    });

    describe("mapFromOpenAi", () => {
        it("should map empty response from OpenAi to ChatResponse", () => {
            const response: OpenAiChatCompletionResponseBody = {
                choices: [],
                created: 0,
                id: "some-id",
                model: "some-model",
                object: "some-object",
                system_fingerprint: null,
                usage: {
                    completion_tokens: 0,
                    prompt_tokens: 0,
                    total_tokens: 0
                }
            };
            const expected: ChatResponse = {
                history: []
            };

            const result = mapFromOpenAi(response);
            expect(result).toEqual(expected);
        });

        it("should map errors to MappingError", () => {
            const response: OpenAiChatCompletionResponseBody = {
                choices: [],
                created: 0,
                id: "some-id",
                model: "some-model",
                object: "some-object",
                system_fingerprint: null,
                usage: {
                    completion_tokens: 0,
                    prompt_tokens: 0,
                    total_tokens: 0
                }
            };

            // to test error throwing, replace .map function with a function that throws an error
            // we know that .map is called inside the mapping function
            const expectedErr = new Error("ExpectedError");
            response.choices.map = () => { throw expectedErr };

            let thrownError: Error | null = null;
            try {
                mapFromOpenAi(response)
            } catch (e) {
                thrownError = e as Error;
            }

            expect(thrownError).toBeInstanceOf(MappingError);
            expect((thrownError as MappingError).cause).toBe(expectedErr);
        })
    });
});