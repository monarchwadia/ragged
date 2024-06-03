import { MappingError } from "../../../../support/CustomErrors";
import {
    OpenAiChatCompletionRequestBody,
    OpenAiChatCompletionResponseBody,
} from "../driver/OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../../index.types";
import { mapFromOpenAi, mapToOpenAi } from "./mappers";

describe("OpenAiChatAdapter Mappers", () => {
    describe("mapToOpenAi", () => {
        it("should map empty request to OpenAi format", () => {
            const request: ChatRequest = {
                history: [],
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should map request to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [
                    { type: "user", text: "Hello" },
                    { type: "bot", text: "Hi" },
                ],
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "user", content: "Hello" },
                    { role: "assistant", content: "Hi" },
                ],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should map request to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [
                    { type: "user", text: "Hello" },
                    { type: "bot", text: "Hi" },
                ],
            };

            // to test error throwing, replace .filter function with a function that throws an error
            // we know that .filter is called inside the mapping function
            const expectedErr = new Error("ExpectedError");
            request.history.filter = () => {
                throw expectedErr;
            };

            let thrownError: Error | null = null;
            try {
                mapToOpenAi(request);
            } catch (e) {
                thrownError = e as Error;
            }

            expect(thrownError).toBeInstanceOf(MappingError);
            expect((thrownError as MappingError).cause).toBe(expectedErr);
        });

        it("should correctly map a request with type 'user' to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [{ type: "user", text: "Hello" }],
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Hello" }],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should correctly map a request with type 'bot' to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [{ type: "bot", text: "Hello" }],
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [{ role: "assistant", content: "Hello" }],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should correctly map a request with type 'system' to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [{ type: "system", text: "Hello" }],
            };
            const expected: OpenAiChatCompletionRequestBody = {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: "Hello" }],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
        });

        it("should skip messages with type 'error' when mapping to OpenAi format", () => {
            // Arrange
            const request: ChatRequest = {
                history: [
                    { type: "system", text: "System message" },
                    { type: "error", text: "Hello" },
                    { type: "user", text: "Hello" },
                ],
            };
            const expected = {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "System message" },
                    { role: "user", content: "Hello" },
                ],
            };

            const result = mapToOpenAi(request);
            expect(result).toEqual(expected);
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
                    total_tokens: 0,
                },
            };
            const expected: ChatResponse = {
                history: [],
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
                    total_tokens: 0,
                },
            };

            // to test error throwing, replace .map function with a function that throws an error
            // we know that .map is called inside the mapping function
            const expectedErr = new Error("ExpectedError");
            response.choices.map = () => {
                throw expectedErr;
            };

            let thrownError: Error | null = null;
            try {
                mapFromOpenAi(response);
            } catch (e) {
                thrownError = e as Error;
            }

            expect(thrownError).toBeInstanceOf(MappingError);
            expect((thrownError as MappingError).cause).toBe(expectedErr);
        });

        it.only("should map Tools to a Tools array", () => {
            const handler = jest.fn().mockReturnValue("OK");

            const mapped = mapToOpenAi({
                history: [{ type: "user", text: "Hello" }],
                tools: [
                    {
                        id: "tool-1",
                        description: "Tool 1",
                        handler,
                        props: {
                            str: {
                                type: "string",
                                description: "A string",
                            },
                            num: {
                                type: "number",
                                description: "A number, and is required",
                                required: true,
                            },
                            bool: {
                                type: "boolean",
                                description: "A boolean, and is required",
                                required: true,
                            },
                            arr: {
                                type: "array",
                                description: "An array of nested objects",
                                children: {
                                    type: "object",
                                    description: "An object with a child",
                                    props: {
                                        child: {
                                            type: "object",
                                            description: "An empty object, and is required",
                                            props: {},
                                            required: true,
                                        },
                                    },
                                },
                            },
                            obj: {
                                type: "object",
                                description: "An object with a child array",
                                props: {
                                    child: {
                                        type: "array",
                                        description: "An array of arrays",
                                        children: {
                                            type: "array",
                                            description: "An array of strings, and required",
                                            children: {
                                                type: "string",
                                                description: "A string, and required",
                                                required: true,
                                            },
                                            required: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            });

            console.log(mapped, 1)

            //         expect(mapped).toMatchInlineSnapshot(`
            //     {
            //       "messages": [
            //         {
            //           "content": "Hello",
            //           "role": "user",
            //         },
            //       ],
            //       "model": "gpt-3.5-turbo",
            //     }
            //   `);
        });
    });
});
