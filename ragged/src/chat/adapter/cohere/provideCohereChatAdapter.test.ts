import { provideCohereChatAdapter } from "./provideCohereChatAdapter";
import { startPollyRecording } from "../../../test/startPollyRecording";
import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { CohereChatAdapter } from "./CohereChatAdapter";

describe("cohereChatAdapterProvider", () => {
  let adapter: CohereChatAdapter;
  beforeEach(() => {
    adapter = provideCohereChatAdapter({
      config: {
        apiKey: process.env.COHERE_API_KEY,
      },
    });
  });

  it("successfully performs a request", async () => {
    const request: ChatAdapterRequest = {
      history: [
        {
          type: "user",
          text: "Hello, how are you?",
        },
      ],
    };

    const polly = startPollyRecording(
      "cohereChatAdapterProvider > successfully performs a request"
    );
    const response = await adapter.chat(request);

    await polly.stop();

    expect(response).toMatchInlineSnapshot(`
      {
        "history": [
          {
            "text": "Hello! As an AI chatbot, I don't have emotions or feelings, but I'm always ready to assist you. How can I help you today?",
            "type": "bot",
          },
        ],
      }
    `);
  });

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
          text: "Hello, how are you?",
        },
      ],
    };

    const polly = startPollyRecording(
      "cohereChatAdapterProvider > successfully does complex requests"
    );
    const response = await adapter.chat(request);

    await polly.stop();

    expect(response).toMatchInlineSnapshot(`
      {
        "history": [
          {
            "text": "I am an AI assistant chatbot, and I do not possess emotions or feelings. I am designed to assist users by providing helpful and thorough responses to their queries. How can I help you today?",
            "type": "bot",
          },
        ],
      }
    `);
  });
});
