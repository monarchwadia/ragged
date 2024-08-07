import { MappingError } from "../../../support/RaggedErrors";
import {
  OpenAiChatCompletionRequestBody,
  OpenAiChatCompletionResponseBody,
} from "./OpenAiApiTypes";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { mapFromOpenAi, mapToOpenAi } from "./OpenAiChatMappers";
import { OpenAiToolMapper } from "./ToolMapper";
import { OpenAiChatAdapter } from "./OpenAiChatAdapter";
import { Message } from "../../Chat.types";
import { Tool } from "../../../tools/Tools.types";
import { mockDeep } from "jest-mock-extended";
import { ApiClient } from "../../../support/ApiClient";

describe("OpenAiChatAdapter Mappers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("mapToOpenAi", () => {
    it("should map empty request to OpenAi format", () => {
      const request: ChatAdapterRequest = {
        history: [],
        context: { apiClient: mockDeep<ApiClient>() },
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
      const request: ChatAdapterRequest = {
        history: [
          { type: "user", text: "Hello" },
          { type: "bot", text: "Hi" },
        ],
        context: { apiClient: mockDeep<ApiClient>() },
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

    it("should not map error requests to openai payload", () => {
      // Arrange
      const request: ChatAdapterRequest = {
        history: [
          { type: "user", text: "Hello" },
          { type: "bot", text: "Hi" },
          { type: "error", text: "Error" },
        ],
        context: { apiClient: mockDeep<ApiClient>() },
      };

      const mapped = mapToOpenAi(request);

      expect(mapped).toMatchInlineSnapshot(`
        {
          "messages": [
            {
              "content": "Hello",
              "role": "user",
            },
            {
              "content": "Hi",
              "role": "assistant",
            },
          ],
          "model": "gpt-3.5-turbo",
          "tools": undefined,
        }
      `);
    });

    describe("User messages", () => {
      it("should correctly map a request with type 'user' to OpenAi format", () => {
        // Arrange
        const request: ChatAdapterRequest = {
          history: [{ type: "user", text: "Hello" }],
          context: { apiClient: mockDeep<ApiClient>() },
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });

      it('should correctly map a request with type "user" and an image to OpenAi format', () => {
        // Arrange
        const request: ChatAdapterRequest = {
          context: { apiClient: mockDeep<ApiClient>() },
          history: [
            {
              type: "user",
              text: "Hello",
              attachments: [
                {
                  type: "image",
                  payload: {
                    data: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMWFhUXGBgYGBgYGBgYGBgYGBgYFxgYFxgYHSggGBolHRgXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUt",
                    encoding: "base64_data_url",
                    mimeType: "image/jpeg",
                  }
                }
              ]
            },
          ],
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  text: "Hello",
                  type: "text",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMWFhUXGBgYGBgYGBgYGBgYGBgYFxgYFxgYHSggGBolHRgXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUt",
                  },
                },
              ],
              tool_calls: undefined
            },
          ],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });

      it('should correctly map a request with type "user" and multiple images to OpenAi format', () => {
        // Arrange
        const request: ChatAdapterRequest = {
          context: { apiClient: mockDeep<ApiClient>() },
          history: [
            {
              type: "user",
              text: "Hello",
              attachments: [
                {
                  type: "image",
                  payload: {
                    data: "foo",
                    encoding: "base64_data_url",
                    mimeType: "image/jpeg",
                  },
                },
                {
                  type: "image",
                  payload: {
                    data: "bar",
                    encoding: "base64_data_url",
                    mimeType: "image/png",
                  }
                }
              ]
            },
          ],
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  text: "Hello",
                  type: "text",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/jpeg;base64,foo",
                  },
                },
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/png;base64,bar",
                  },
                },
              ],
              tool_calls: undefined
            },
          ],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });

      it('should correctly map a request with an empty array of attachments', () => {
        // Arrange
        const request: ChatAdapterRequest = {
          context: { apiClient: mockDeep<ApiClient>() },
          history: [
            {
              type: "user",
              text: "Hello",
              attachments: []
            },
          ],
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Hello",
              tool_calls: undefined
            },
          ],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });

      it('should skip any badly formatted attachments', () => {
        // Arrange
        const request: ChatAdapterRequest = {
          history: [
            {
              type: "user",
              text: "Hello",
              attachments: [
                {
                  // @ts-expect-error - testing an error case
                  type: "bad type",
                }
              ]
            },
          ],
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Hello"
                }
              ],
              tool_calls: undefined
            },
          ],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });

      it('should skip any badly formatted attachments but keep good ones', () => {
        // Arrange
        const request: ChatAdapterRequest = {
          history: [
            {
              type: "user",
              text: "Hello",
              attachments: [
                {
                  // @ts-expect-error - testing an error case
                  type: "bad type",
                },
                {
                  type: "image",
                  payload: {
                    data: "foo",
                    encoding: "base64_data_url",
                    mimeType: "image/jpeg",
                  }
                }
              ]
            },
          ],
        };
        const expected: OpenAiChatCompletionRequestBody = {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Hello"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/jpeg;base64,foo",
                  },
                },
              ],
              tool_calls: undefined
            },
          ],
        };

        const result = mapToOpenAi(request);
        expect(result).toEqual(expected);
      });
    });

    it("should correctly map a request with type 'bot' to OpenAi format", () => {
      // Arrange
      const request: ChatAdapterRequest = {
        context: { apiClient: mockDeep<ApiClient>() },
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
      const request: ChatAdapterRequest = {
        context: { apiClient: mockDeep<ApiClient>() },
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
      const request: ChatAdapterRequest = {
        context: { apiClient: mockDeep<ApiClient>() },
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
    it("should map null choices from OpenAi to ChatResponse", () => {
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

      const result = mapFromOpenAi(response);
      expect(result).toEqual([]);
    });
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

      const result = mapFromOpenAi(response);
      expect(result).toEqual([]);
    });

    it("should map Tools to a Tools array", () => {
      const handler = jest.fn().mockReturnValue("OK");

      const mapped = mapToOpenAi({
        context: { apiClient: mockDeep<ApiClient>() },
        history: [{ type: "user", text: "Hello" }],
        tools: [
          {
            id: "tool-1",
            description: "Tool 1",
            handler,
            props: {
              type: "object",
              description: "An object",
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
          },
        ],
      });

      expect(mapped).toMatchInlineSnapshot(`
        {
          "messages": [
            {
              "content": "Hello",
              "role": "user",
            },
          ],
          "model": "gpt-3.5-turbo",
          "tools": [
            {
              "function": {
                "description": "Tool 1",
                "name": "tool-1",
                "parameters": {
                  "properties": {
                    "arr": {
                      "description": "An array of nested objects",
                      "items": {
                        "properties": {
                          "child": {
                            "properties": {},
                            "type": "object",
                          },
                        },
                        "required": [
                          "child",
                        ],
                        "type": "object",
                      },
                      "type": "array",
                    },
                    "bool": {
                      "description": "A boolean, and is required",
                      "type": "boolean",
                    },
                    "num": {
                      "description": "A number, and is required",
                      "type": "number",
                    },
                    "obj": {
                      "properties": {
                        "child": {
                          "description": "An array of arrays",
                          "items": {
                            "description": "An array of strings, and required",
                            "items": {
                              "description": "A string, and required",
                              "type": "string",
                            },
                            "type": "array",
                          },
                          "type": "array",
                        },
                      },
                      "type": "object",
                    },
                    "str": {
                      "description": "A string",
                      "type": "string",
                    },
                  },
                  "required": [
                    "num",
                    "bool",
                  ],
                  "type": "object",
                },
              },
              "type": "function",
            },
          ],
        }
      `);
    });
    it("should map incoming tool requests correctly", () => {
      const result = mapFromOpenAi({
        choices: [
          {
            finish_reason: "tool_calls",
            index: 0,
            logprobs: null,
            message: {
              content: null,
              role: "assistant",
              tool_calls: [
                {
                  function: {
                    arguments: '{"key1":"123","key2":456}',
                    name: "tool-1",
                  },
                  id: "call_gxXgZWPUs5d6pVvNigjaU7sl",
                  type: "function",
                },
              ],
            },
          },
        ],
        created: 1717467292,
        id: "chatcmpl-9WDzIldc9Sltwd7ypMZPsB3c4zhWJ",
        model: "gpt-3.5-turbo-0125",
        object: "chat.completion",
        system_fingerprint: null,
        usage: {
          completion_tokens: 21,
          prompt_tokens: 77,
          total_tokens: 98,
        },
      });

      expect(result).toMatchInlineSnapshot(`
          [
            {
              "text": null,
              "toolCalls": [
                {
                  "meta": {
                    "toolRequestId": "call_gxXgZWPUs5d6pVvNigjaU7sl",
                  },
                  "props": "{"key1":"123","key2":456}",
                  "toolName": "tool-1",
                  "type": "tool.request",
                },
              ],
              "type": "bot",
            },
          ]
      `);
    });

    it("should map outgoing tool responses correctly", () => {
      const tools: Tool[] = [
        {
          id: "tool-1",
          description: "Tool 1",
          handler: jest.fn(),
          props: {
            type: "object",
            props: {
              key1: {
                type: "string",
                description: "A string",
                required: true,
              },
              key2: {
                type: "number",
                description: "A number",
                required: true,
              },
            },
          },
        },
      ];
      const history: Message[] = [
        {
          type: "bot",
          text: null,
          toolCalls: [
            {
              toolName: "tool-1",
              type: "tool.request",
              props: '{"key1":"123","key2":456}',
              meta: {
                toolRequestId: "some-id",
              },
            },
            {
              toolName: "tool-1",
              type: "tool.response",
              data: "tool-1 has responded",
              meta: {
                toolRequestId: "some-id",
              },
            },
          ],
        },
      ];

      expect(
        mapToOpenAi({
          context: { apiClient: mockDeep<ApiClient>() },
          history,
          tools,
        })
      ).toMatchObject({
        "messages": [
          {
            "content": null,
            "role": "assistant",
            "tool_calls": [
              {
                "function": {
                  "arguments": "{\"key1\":\"123\",\"key2\":456}",
                  "name": "tool-1",
                },
                "id": "some-id",
                "type": "function",
              }
            ],
          },
          {
            tool_call_id: "some-id",
            role: "tool",
            name: "tool-1",
            content: "tool-1 has responded",
          }
        ],
        "model": "gpt-3.5-turbo",
        "tools": [
          {
            "function": {
              "description": "Tool 1",
              "name": "tool-1",
              "parameters": {
                "properties": {
                  "key1": {
                    "description": "A string",
                    "type": "string",
                  },
                  "key2": {
                    "description": "A number",
                    "type": "number",
                  },
                },
                "required": [
                  "key1",
                  "key2",
                ],
                "type": "object",
              },
            },
            "type": "function",
          },
        ],
      })
    });
  });
});
