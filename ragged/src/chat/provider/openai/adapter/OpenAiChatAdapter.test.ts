import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { OpenAiChatAdapter } from ".";
import { OpenAiChatDriver } from "../driver";
import { ApiClient } from "../../../../support/ApiClient";
import { startPollyRecording } from "../../../../../test/startPollyRecording";
import { Message } from "../../../index.types";

describe("OpenAiChatAdapter", () => {
  let apiClient: ApiClient;
  let adapter: OpenAiChatAdapter;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    apiClient = new ApiClient();
    spy = jest.spyOn(apiClient, "post");
    const config = {
      // apiKey: process.env.OPENAI_API_KEY,
    };
    const driver = new OpenAiChatDriver(apiClient, config);
    adapter = new OpenAiChatAdapter(driver);
  });

  afterEach(() => {
    jest.clearAllMocks();
    spy.mockClear();
  });

  it("should do API calls as expected", async () => {
    const polly = startPollyRecording(
      "OpenAiChatAdapter > should do API calls as expected"
    );

    const response = await adapter.chat({
      history: [
        {
          type: "user",
          text: "Hello, World!",
        },
      ],
    });

    await polly.stop();

    expect(response.history).toHaveLength(1);
    expect(response.history[0]).toMatchObject({
      type: "bot",
      text: "Hello there! How can I assist you today?",
    });
  });

  it("should do tool calling", async () => {
    const polly = startPollyRecording(
      "OpenAiChatAdapter > should do tool calling"
    );

    const response = await adapter.chat({
      history: [
        {
          type: "user",
          text: "Retrieve today's news using the todays-news tool.",
        },
      ],
      tools: [
        {
          id: "todays-news",
          description: "Retrieve today's news.",
          props: {
            type: "object",
            props: {
              query: {
                type: "string",
                description: "The query to search for.",
                required: true,
              },
            },
          },
          handler: async (query) => {
            return "Here are today's news: ...";
          },
        },
      ],
    });

    await polly.stop();

    expect(response).toMatchInlineSnapshot(`
      {
        "history": [
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
            ],
            "type": "bot",
          },
        ],
      }
    `);
  });
});
