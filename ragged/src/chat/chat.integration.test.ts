import { Chat } from "ragged";
import type { ChatWithConfig } from "ragged/build/chat/Chat";

type ConfigProvider = {
  label: string;
  config: ChatWithConfig;
};
const configs: ConfigProvider[] = [
  {
    label: "openai",
    config: {
      provider: "openai",
      config: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
      },
    },
  },
];

describe("Test Builds", () => {
  it.each(configs)(
    "should echo chat response for %s provider",
    async (config) => {
      console.log("OPENAI API KEY", process.env.OPENAI_API_KEY);
      const chat = Chat.with(config.config);
      const response = await chat.chat("Respond with exactly: Hello, world!");
      expect(response).toBeDefined();
      expect(chat.history.at(-1)?.text).toBe("Hello, world!");
    },
  );
});
