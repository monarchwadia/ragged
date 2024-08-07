import { provideOllamaChatAdapter } from "./provideOllamaChatAdapter";
import { startPollyRecording } from "../../../test/startPollyRecording";
import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { OllamaChatAdapter } from "./OllamaChatAdapter";
import { ApiClient } from "../../../support/ApiClient";

describe("ollamaChatAdapterProvider", () => {
  let adapter: OllamaChatAdapter;
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
    adapter = provideOllamaChatAdapter({
      config: {
        apiKey: process.env.OLLAMA_API_KEY,
        model: "llama3"
      },
    });
  });

  it("successfully performs a request", async () => {
    const request: ChatAdapterRequest = {
      history: [
        {
          type: "user",
          text: "Reply with only the single word Hello, and nothing else",
        },
      ],
      context: { apiClient }
    };

    const polly = startPollyRecording(
      "ollamaChatAdapterProvider > successfully performs a request"
    );
    const response = await adapter.chat(request);

    await polly.stop();

    expect(response.history).toMatchInlineSnapshot(`
        [
          {
            "text": "Hello",
            "type": "bot",
          },
        ]
    `);

    expect(response.raw?.request).toBeInstanceOf(Request);
    expect(response.raw?.response).toBeInstanceOf(Response);
  }, 15000);

  it("successfully does complex requests", async () => {
    const request: ChatAdapterRequest = {
      history: [
        {
          type: "user",
          text: "Hello, how are you?",
        },
        {
          type: "bot",
          text: "I am a bot message",
        },
        {
          type: "system",
          text: "I am a system message",
        },
        {
          type: "user",
          text: "Response with only the single word Hello and nothing else",
        },
      ],
      context: { apiClient }
    };

    const polly = startPollyRecording(
      "ollamaChatAdapterProvider > successfully does complex requests"
    );
    const response = await adapter.chat(request);

    await polly.stop();

    expect(response.history).toMatchInlineSnapshot(`
        [
          {
            "text": "Hello",
            "type": "bot",
          },
        ]
    `);
    expect(response.raw?.request).toBeInstanceOf(Request);
    expect(response.raw?.response).toBeInstanceOf(Response);
  }, 15000);
});
