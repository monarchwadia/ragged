import { Chat } from "ragged";
import type { ChatWithConfig } from "ragged/build/chat/Chat";

type ConfigProvider = {
  label: string;
  config: ChatWithConfig;
};
const configs: ConfigProvider[] = [
  {
    label: "OpenAI with GPT-4o",
    config: {
      provider: "openai",
      config: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
      },
    },
  },
  {
    label: "Cohere Command Light",
    config: {
      provider: "cohere",
      config: {
        apiKey: process.env.COHERE_API_KEY,
        model: "command-light",
      },
    },
  },
  {
    label: "Cohere Command Nightly",
    config: {
      provider: "cohere",
      config: {
        apiKey: process.env.COHERE_API_KEY,
        model: "command-nightly",
      },
    },
  },
];

describe("Test Builds", () => {
  it.each(configs)(
    "should echo chat response for %s provider",
    async (config) => {
      const chat = Chat.with(config.config);
      const response = await chat.chat("Respond with exactly: Hello, world!");
      expect(response).toBeDefined();
      expect(chat.history.at(-1)?.text).toBe("Hello, world!");
    },
  );
});
