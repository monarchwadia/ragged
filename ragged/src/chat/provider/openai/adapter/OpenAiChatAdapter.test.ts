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

  it("should do API calls well", async () => {
    const polly = startPollyRecording(
      "OpenAiChatAdapter > should do tool calling"
    );

    const response = await adapter.chat({
      history: [
        {
          type: "user",
          text: "Hello, World!",
        }
      ],
    });

    await polly.stop();

    expect(response.history).toHaveLength(1);
    expect(response.history[0]).toMatchObject({
      type: "bot",
      text: "Hello! How can I assist you today?",
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
          text: "Retrieve today's news.",
        },
      ],
      tools: [
        {
          id: "todays-news",
          description: "Retrieve today's news.",
          props: {
            query: {
              type: "string",
              description: "The query to search for.",
              required: true,
            }
          },
          handler: async (props) => {
            return "Here are today's news: ...";
          }
        }
      ]
    });

    await polly.stop();

    expect(response.history).toHaveLength(1);
    expect(response.history[0]).toMatchObject({
      type: "bot",
      text: ""
    } as Message)
    expect(response.history[1]).toMatchObject({
      type: "tool.request",
      toolId: "todays-news",
      toolRequestId: "something-random",
      props: {}
    } as Message);

    expect(response.history[2]).toMatchObject({
      type: "tool.response",
      toolRequestId: "something-random",
      data: "Here are today's news: ..."
    } as Message);
  });
});
