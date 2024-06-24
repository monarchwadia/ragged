import { OpenAiChatAdapter } from "./OpenAiChatAdapter.js";
import { ApiClient } from "../../../support/ApiClient.js";
import { startPollyRecording } from "../../../../test/startPollyRecording.js";
import { mockDeep } from "jest-mock-extended";

describe("OpenAiChatAdapter", () => {
  let apiClient: ApiClient;
  let adapter: OpenAiChatAdapter;
  let spy: jest.SpyInstance;

  describe("integration", () => {

    beforeEach(() => {
      apiClient = new ApiClient();
      spy = jest.spyOn(apiClient, "post");
      const config = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      adapter = new OpenAiChatAdapter(apiClient, config);
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
            handler: async () => {
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
                    "toolRequestId": "call_MhanXUgR5MD6pSGbsWi2D4Of",
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
  })

  describe("behaviour", () => {
    beforeEach(() => {
      apiClient = mockDeep<ApiClient>();
      adapter = new OpenAiChatAdapter(apiClient, {
        apiKey: "nope-key",
        organizationId: "nope-org",
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should do API calls as expected", async () => {

      try {
        await adapter.chat({
          history: [
            {
              type: "user",
              text: "Hello, World!",
            },
          ],
        });
      } catch (e) {
        // expected
      }

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        {
          body: {
            messages: [
              {
                role: "user",
                content: "Hello, World!",
              },
            ],
            model: "gpt-3.5-turbo",
            tools: undefined
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer nope-key`,
            "OpenAI-Organization": "nope-org",
          },
        }
      );
    });
  })
});
