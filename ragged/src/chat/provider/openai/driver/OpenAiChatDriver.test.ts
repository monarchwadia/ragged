import { startPollyRecording } from "../../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OpenAiChatDriver } from ".";

describe("OpenAiChatDriver", () => {
  let driver: OpenAiChatDriver;

  beforeEach(() => {
    const config = {
      // apiKey: process.env.OPENAI_API_KEY,
    };

    const driverApiClient = new ApiClient();
    driver = new OpenAiChatDriver(driverApiClient, config);
  });

  afterEach(() => { });

  it("should perform a chat completion", async () => {
    const polly = startPollyRecording(
      "OpenAiChatDriver > should perform a chat completion"
    );
    const result = await driver.chatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a chatbot." },
        { role: "user", content: "What are you?" },
      ],
    });
    await polly.stop();

    expect(result).toMatchSnapshot();
  });

  it("should do tool calls", async () => {
    const polly = startPollyRecording(
      "OpenAiChatDriver > should do tool calls"
    );

    const result = await driver.chatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a chatbot." },
        { role: "user", content: "Call tool-1 with key1=123, key2=456" },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "tool-1",
            description: "A tool.",
            parameters: {
              type: "object",
              properties: {
                key1: {
                  type: "string",
                  description: "A key.",
                },
                key2: {
                  type: "number",
                  description: "Another key.",
                },
              },
              required: ["key1", "key2"],
            },
          },
        },
      ],
    });

    polly.stop();

    expect(result).toMatchInlineSnapshot(`
      {
        "choices": [
          {
            "finish_reason": "tool_calls",
            "index": 0,
            "logprobs": null,
            "message": {
              "content": null,
              "role": "assistant",
              "tool_calls": [
                {
                  "function": {
                    "arguments": "{"key1":"123","key2":456}",
                    "name": "tool-1",
                  },
                  "id": "call_gxXgZWPUs5d6pVvNigjaU7sl",
                  "type": "function",
                },
              ],
            },
          },
        ],
        "created": 1717467292,
        "id": "chatcmpl-9WDzIldc9Sltwd7ypMZPsB3c4zhWJ",
        "model": "gpt-3.5-turbo-0125",
        "object": "chat.completion",
        "system_fingerprint": null,
        "usage": {
          "completion_tokens": 21,
          "prompt_tokens": 77,
          "total_tokens": 98,
        },
      }
    `);
  });
});
