import { Chat, ChatResponse } from "./Chat";
import { Tool } from "../tools/Tools.types";
import { Message } from "./Chat.types";
import { BaseChatAdapter } from "./adapter/BaseChatAdapter.types";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { startPollyRecording } from "../test/startPollyRecording";
import {
  ParameterValidationError,
} from "../support/RaggedErrors";
import { fakeRawsFactory } from "../test/fakeFactories";
import { ApiClient } from "../support/ApiClient";
import { ApiClientFactory } from "../support/ApiClient.types";

describe("Chat", () => {
  let adapter: DeepMockProxy<BaseChatAdapter>;
  let apiClient: DeepMockProxy<ApiClient>;
  let apiClientFactory: () => DeepMockProxy<ApiClient>;
  let c: Chat;

  beforeEach(() => {
    adapter = mockDeep<BaseChatAdapter>();
    apiClient = mockDeep<ApiClient>();
    apiClientFactory = () => apiClient;
    c = new Chat(adapter, apiClientFactory);
  });

  describe("Default behaviour", () => {
    it('supports 0 args in the chat call', () => {
      adapter.chat.mockResolvedValue({ history: [], raw: fakeRawsFactory() });

      c.chat();

      expect(adapter.chat).toHaveBeenCalledWith({ history: [], context: { apiClient } });
    })

    it("Calls the adapter with the correct request", async () => {
      adapter.chat.mockResolvedValue({ history: [], raw: fakeRawsFactory() });

      await c.chat(`This is a test message to the adapter`);

      expect(adapter.chat).toHaveBeenCalledWith({
        history: [
          {
            type: "user",
            text: "This is a test message to the adapter",
          },
        ],
        context: { apiClient }
      });
    });

    it("returns the passed-in history, followed by the user prompt, and then the response below it.", async () => {
      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter",
          },
        ],
        raw: fakeRawsFactory()
      });

      const chatResponse = await c.chat([
        {
          type: "system",
          text: "This is a system message",
        },
        {
          type: "user",
          text: "This is a test message to the adapter",
        },
      ]);

      expect(chatResponse.history).toMatchInlineSnapshot(`
        [
          {
            "text": "This is a system message",
            "type": "system",
          },
          {
            "text": "This is a test message to the adapter",
            "type": "user",
          },
          {
            "text": "This is a test response from the adapter",
            "type": "bot",
          },
        ]
      `);
    });

    it("can chat even without a history of messages", async () => {
      const expectedOutput: Message[] = [
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ];

      adapter.chat.mockResolvedValue({ history: expectedOutput, raw: fakeRawsFactory() });

      const chatResponse = await c.chat(`This is a test message to the adapter`);

      expect(chatResponse.history).toMatchObject([
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        ...expectedOutput,
      ] as Message[]);
    });

    describe("When the adapter throws an error", () => {
      it("includes errors in the response", async () => {
        const ERROR_MESSAGE = "This is a super specific error message"
        adapter.chat.mockRejectedValue(new Error(ERROR_MESSAGE));

        const chatResponse = await c.chat(`This is a test message to the adapter`);

        expect(chatResponse.history).toMatchObject([
          {
            type: "user",
            text: `This is a test message to the adapter`,
          },
          {
            type: "error",
            text: ERROR_MESSAGE,
          },
        ] as Message[]);
      });

      it("includes unknown errors in the response", async () => {
        adapter.chat.mockRejectedValue({});

        const chatResponse = await c.chat(`This is a test message to the adapter`);

        expect(chatResponse.history).toMatchObject([
          {
            type: "user",
            text: `This is a test message to the adapter`,
          },
          {
            type: "error",
            text: "An unknown error occurred",
          },
        ] as Message[]);
      });

      describe.each([new Error("error"), {}])("The raw response object", (rejectedValue) => {
        it("should set the raw request and response objects as empty strings", async () => {
          adapter.chat.mockRejectedValue(rejectedValue);

          const chatResponse = await c.chat(`This is a test message to the adapter`);

          expect(chatResponse.raw).toMatchObject({ requests: [], responses: [] });
        })
      })
    })
  });

  describe("with recording", () => {
    it("should return the history of messages", async () => {
      c.record(true);

      // adapter should return just the LLM response
      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter",
          },
        ],
        raw: fakeRawsFactory()
      });

      let chatResponse = await c.chat(`This is a test message to the adapter`);

      expect(chatResponse.history).toMatchObject([
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ] as Message[]);

      // and one more try

      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is the last test response from the adapter",
          },
        ],
        raw: fakeRawsFactory()
      });

      chatResponse = await c.chat(`This is another test message to the adapter`);

      const expectedValue = [
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `This is another test message to the adapter`,
        },
        {
          type: "bot",
          text: "This is the last test response from the adapter",
        },
      ] as Message[];

      expect(chatResponse.history).toMatchObject(expectedValue);
      expect(c.history).toMatchObject(expectedValue);
    });

    it("should append the history passed in even when recording", async () => {
      c.record(true);

      // adapter should return just the LLM response
      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter",
          },
        ],
        raw: fakeRawsFactory()
      });

      const chatResponse = await c.chat([
        {
          type: "system",
          text: "This message will be appended in the history",
        },
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
      ]);

      expect(chatResponse.history).toMatchObject([
        {
          type: "system",
          text: "This message will be appended in the history",
        },
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ] as Message[]);
    });

    it("includes errors in the response", async () => {
      c.record(true);

      adapter.chat.mockRejectedValue(new Error("This is an error"));

      const chatResponse = await c.chat(`This is a test message to the adapter`);

      expect(chatResponse.history).toMatchObject([
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        {
          type: "error",
          text: "This is an error",
        },
      ] as Message[]);
    });

    it("includes unknown errors in the response", async () => {
      c.record(true);

      adapter.chat.mockRejectedValue({});

      const chatResponse = await c.chat(`This is a test message to the adapter`);

      expect(chatResponse.history).toMatchObject([
        {
          type: "user",
          text: `This is a test message to the adapter`,
        },
        {
          type: "error",
          text: "An unknown error occurred",
        },
      ] as Message[]);
    });

    it("should stop recording when record(false) is called", async () => {
      c.record(true);

      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter",
          },
        ],
        raw: fakeRawsFactory()
      });

      await c.chat(`Message 1`);
      await c.chat(`Message 2`);

      expect(c.history).toHaveLength(4);

      c.record(false);

      const response3 = await c.chat(`Message 3`);
      expect(response3.history).toHaveLength(6);
      expect(c.history).toHaveLength(4);
      expect(response3.history).toMatchObject([
        {
          type: "user",
          text: `Message 1`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `Message 2`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `Message 3`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ] as Message[]);

      const response4 = await c.chat(`Message 4`);
      expect(response4.history).toHaveLength(6);
      expect(c.history).toHaveLength(4);
      expect(response4.history).toMatchObject([
        {
          type: "user",
          text: `Message 1`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `Message 2`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `Message 4`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ] as Message[]);

      expect(c.history).toMatchObject([
        {
          type: "user",
          text: `Message 1`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
        {
          type: "user",
          text: `Message 2`,
        },
        {
          type: "bot",
          text: "This is a test response from the adapter",
        },
      ] as Message[]);
    });
  });

  describe("tool calling", () => {
    describe("automatic tool call handling", () => {
      it("should automatically call the tool handler when a tool call is detected and send a response to the LLM", async () => {
        // adapter sends a tool call request
        adapter.chat.mockResolvedValueOnce({
          history: [
            {
              type: "bot",
              text: null,
              toolCalls: [
                {
                  meta: {
                    toolRequestId: "call_SeP7XORPM3I9SWWDtbUaIW6r",
                  },
                  props: `{"query":"latest news"}`,
                  toolName: "todays-news",
                  type: "tool.request",
                },
              ],
            },
          ],
          raw: fakeRawsFactory()
        });

        adapter.chat.mockResolvedValueOnce({
          history: [
            {
              type: "bot",
              text: "And here's the news...",
            },
          ],
          raw: fakeRawsFactory()
        });

        // chat generates a tool call response and re-queries the LLM
        const response = await c.chat("This is a test message to the adapter", {
          tools: [
            {
              id: "todays-news",
              description: "Get the latest news",
              props: {
                type: "object",
                props: {
                  query: {
                    type: "string",
                    description: "The query to search for",
                    required: true,
                  },
                },
              },
              handler: async () => {
                return "Here are the latest news";
              },
            },
          ],
        });

        expect(response.history).toMatchInlineSnapshot(`
          [
            {
              "text": "This is a test message to the adapter",
              "type": "user",
            },
            {
              "text": null,
              "toolCalls": [
                {
                  "meta": {
                    "toolRequestId": "call_SeP7XORPM3I9SWWDtbUaIW6r",
                  },
                  "props": "{"query":"latest news"}",
                  "toolName": "todays-news",
                  "type": "tool.request",
                },
                {
                  "data": "Here are the latest news",
                  "meta": {
                    "toolRequestId": "call_SeP7XORPM3I9SWWDtbUaIW6r",
                  },
                  "toolName": "todays-news",
                  "type": "tool.response",
                },
              ],
              "type": "bot",
            },
            {
              "text": "And here's the news...",
              "type": "bot",
            },
          ]
        `);
      });
    });

    describe("list files in a directory using tool calls", () => {
      let response: ChatResponse;
      beforeEach(async () => {
        const c = Chat.with({
          provider: 'openai',
          config: {
            apiKey: process.env.OPENAI_API_KEY
          }
        })

        const lsTool: Tool = {
          id: "ls",
          description:
            "List the files in any given directory on the user's local machine.",
          props: {
            type: "object",
            props: {
              path: {
                type: "string",
                description: "The path to the directory to list files from.",
                required: true,
              },
            },
          },
          handler: async (props) => {
            try {
              const json = await JSON.parse(props);
              const path = json.path;
              const files = ["cool.doc", "cool2.doc", "cool3.doc"];
              return `The files in the directory ${path} are: ${files.join(
                "\n"
              )}`;
            } catch (e: any) {
              console.error(e);
              if (e?.message) {
                return `An error occurred: ${e.message}`;
              } else {
                return `An unknown error occurred.`;
              }
            }
          },
        };

        const polly = startPollyRecording(
          "can-list-files-in-a-directory-using-tool-calls",
          { matchRequestsBy: { order: true } }
        );
        c.maxIterations = 5;
        response = await c.chat(`What are the files in my root dir?`, {
          tools: [lsTool],
        });

        await polly.stop();
      })
      it("should return the expected response", () => {

        expect(response.history).toMatchInlineSnapshot(`
          [
            {
              "text": "What are the files in my root dir?",
              "type": "user",
            },
            {
              "text": null,
              "toolCalls": [
                {
                  "meta": {
                    "toolRequestId": "call_QGrPTwIBYpTYdRJWISkx7Njt",
                  },
                  "props": "{"path":"/"}",
                  "toolName": "ls",
                  "type": "tool.request",
                },
                {
                  "data": "The files in the directory / are: cool.doc
          cool2.doc
          cool3.doc",
                  "meta": {
                    "toolRequestId": "call_QGrPTwIBYpTYdRJWISkx7Njt",
                  },
                  "toolName": "ls",
                  "type": "tool.response",
                },
              ],
              "type": "bot",
            },
            {
              "text": "The files in your root directory are: cool.doc, cool2.doc, cool3.doc.",
              "type": "bot",
            },
          ]
        `);
      })

      it("should return the raw requests and responses", () => {
        expect(response.raw?.requests.length).toBe(2);
        expect(response.raw?.responses.length).toBe(2);
      })

    });
  });

  describe("with attachments", () => {
    it('should send attachments to the adapter', async () => {
      adapter.chat.mockResolvedValue({ history: [], raw: fakeRawsFactory() });
      await c.chat([
        {
          type: "user",
          text: "This is a test message to the adapter",
          attachments: [
            {
              type: "image",
              payload: {
                mimeType: "image/png",
                encoding: "base64_data_url",
                data: "some base64 data",
              }
            }
          ]
        }
      ]);

      expect(adapter.chat).toHaveBeenCalledWith({
        context: { apiClient },
        history: [
          {
            type: "user",
            text: "This is a test message to the adapter",
            attachments: [
              {
                type: "image",
                payload: {
                  mimeType: "image/png",
                  encoding: "base64_data_url",
                  data: "some base64 data",
                }
              }
            ]
          }
        ]
      });
    });

    it('should preserve attachments in history', async () => {
      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter"
          }
        ],
        raw: fakeRawsFactory()
      });

      const chatResponse = await c.chat([
        {
          type: "user",
          text: "This is a test message to the adapter",
          attachments: [
            {
              type: "image",
              payload: {
                mimeType: "image/png",
                encoding: "base64_data_url",
                data: "some base64 data",
              }
            }
          ]
        }
      ]);

      expect(chatResponse.history).toMatchObject([
        {
          type: "user",
          text: "This is a test message to the adapter",
          attachments: [
            {
              type: "image",
              payload: {
                mimeType: "image/png",
                encoding: "base64_data_url",
                data: "some base64 data",
              }
            }
          ]
        },
        {
          type: "bot",
          text: "This is a test response from the adapter"
        }
      ] as Message[]);
    });
  });

  describe('with hooks', () => {
    beforeEach(() => {
      adapter.chat.mockResolvedValue({
        history: [
          {
            type: "bot",
            text: "This is a test response from the adapter"
          }
        ],
        raw: fakeRawsFactory()
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    })

    describe('beforeSerialize hook', () => {
      it('should set the beforeSerialize hook on the API client before passing it into the adapter.', async () => {
        const beforeSerializeMock = jest.fn();

        await c.chat(`This is a test message to the adapter`, {
          hooks: { beforeSerialize: beforeSerializeMock }
        });

        expect(adapter.chat.mock.calls).toHaveLength(1)
        expect(adapter.chat.mock.lastCall?.[0].context.apiClient.hooks.beforeSerialize).toBe(beforeSerializeMock);
      });
    })

    describe('beforeRequest hook', () => {
      it('should set the beforeRequest hook on the API client before passing it into the adapter.', async () => {
        const beforeRequestMock = jest.fn();

        await c.chat(`This is a test message to the adapter`, {
          hooks: { beforeRequest: beforeRequestMock }
        });

        expect(adapter.chat.mock.calls).toHaveLength(1)
        expect(adapter.chat.mock.lastCall?.[0].context.apiClient.hooks.beforeRequest).toBe(beforeRequestMock);
      });

      it('should set the afterResponse hook on the API client before passing it into the adapter', async () => {
        const afterResponse = jest.fn();

        await c.chat(`This is a test message to the adapter`, {
          hooks: { afterResponse: afterResponse }
        });

        expect(adapter.chat.mock.calls).toHaveLength(1)
        expect(adapter.chat.mock.lastCall?.[0].context.apiClient.hooks.afterResponse).toBe(afterResponse);
      });

      it('should set the afterResponseParsed hook on the API client before passing it into the adapter', async () => {
        const afterResponseParsed = jest.fn();

        await c.chat(`This is a test message to the adapter`, {
          hooks: { afterResponseParsed: afterResponseParsed }
        });

        expect(adapter.chat.mock.calls).toHaveLength(1)
        expect(adapter.chat.mock.lastCall?.[0].context.apiClient.hooks.afterResponseParsed).toBe(afterResponseParsed);
      });
    })
  })

  describe("parameter validation", () => {
    describe("chat()", () => {
      it("should not throw an error in sunny-day cases", async () => {
        adapter.chat.mockResolvedValue({ history: [], raw: fakeRawsFactory() });

        await c.chat();
        await c.chat("");
        await c.chat("Something");
        await c.chat("Something", {});
        await c.chat("Something", { tools: [] });
        await c.chat("Something", { model: "gpt-3" });
        await c.chat("Something", { tools: [], model: "gpt-3" });
        await c.chat([]);
        await c.chat([{ type: "user", text: "Something" }]);
        await c.chat([{ type: "user", text: "Something" }], {
          tools: [],
          model: "gpt-3",
        });
        await c.chat([{ type: "user", text: "Something" }], { tools: [] });
        await c.chat(
          [
            { type: "user", text: "Something" },
            { type: "bot", text: "Something" },
          ],
          { tools: [] }
        );
        await c.chat(
          [
            { type: "user", text: "Something" },
            { type: "bot", text: "Something" },
          ],
          { model: "gpt-3" }
        );
        await c.chat(
          [
            { type: "user", text: "Something" },
            { type: "bot", text: "Something" },
          ],
          { tools: [], model: "gpt-3" }
        );
        await c.chat({});
        await c.chat({ tools: [] });
        await c.chat({ model: "gpt-3" });
        await c.chat({ tools: [], model: "gpt-3" });
      });
      it("should throw an error when the first parameter is weird", async () => {
        await expect(() => c.chat(123 as any)).rejects.toThrow(
          ParameterValidationError
        );
        await expect(() => c.chat(class X { } as any)).rejects.toThrow(
          ParameterValidationError
        );
        await expect(() => c.chat((() => { }) as any)).rejects.toThrow(
          ParameterValidationError
        );
      });
      it("should throw when the first parameter is undefined, but a config object is passed in the 2nd parameter", async () => {
        await expect(() => c.chat(undefined as any, {})).rejects.toThrow(
          ParameterValidationError
        );
      });
    });
  });

  describe('Chat.with', () => {
    describe('instantiation', () => {
      it('can instantiate openai', () => {
        const c = Chat.with({
          provider: 'openai',
          config: {
            apiKey: '123'
          }
        });
        expect(c).toBeDefined();
      })

      it('can instantiate cohere', () => {
        const c = Chat.with({
          provider: 'cohere',
          config: {
            apiKey: '123'
          }
        });

        expect(c).toBeDefined();
      })

      it('can instantiate ollama', () => {
        const c = Chat.with({
          provider: 'ollama',
          config: {}
        })
        expect(c).toBeDefined();
      });

      it('can instantiate azure-openai', () => {
        const c = Chat.with({
          provider: 'azure-openai',
          config: {
            apiKey: '123',
            apiVersion: 'v1',
            resourceName: 'resource',
            deploymentName: 'deployment'
          }
        });
      });

      it('can instantiate openai-assistants', () => {
        const c = Chat.with({
          provider: 'openai-assistants',
          config: {
            apiKey: '123',
            assistant: {
              model: 'model',
              description: 'description',
              instructions: 'instructions',
              name: 'name',
            }
          }
        });
      });
      it('can instantiate azure-openai-assistants', () => {
        const c = Chat.with({
          provider: 'azure-openai-assistants',
          config: {
            apiKey: '123',
            apiVersion: 'v1',
            resourceName: 'resource',
            deploymentName: 'deployment',
            modelName: 'model'
          }
        });
      })
    });

  });
})
