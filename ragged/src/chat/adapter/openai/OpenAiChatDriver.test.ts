import { startPollyRecording } from "../../../../test/startPollyRecording.js";
import { ApiClient } from "../../../support/ApiClient.js";
import { OpenAiChatAdapter as OpenAiChatDriver } from "./index.js";
import { objToReadableStream } from "../../../../test/objectToReadableStream.js";

// TODO: merge with OpenAiChatAdapter.test.ts
describe("OpenAiChatDriver", () => {
  let apiClient: ApiClient;
  let driver: OpenAiChatDriver;

  beforeEach(() => {
    const config = {
      // apiKey: process.env.OPENAI_API_KEY,
    };

    apiClient = new ApiClient();
    driver = new OpenAiChatDriver(apiClient, config);
  });

  afterEach(() => { jest.clearAllMocks() });

  it("should pass the body directly into the apiclient", () => {
    const spy = jest.spyOn(apiClient, "post").mockImplementation(() => Promise.resolve(new Response(objToReadableStream("{}"))));

    driver.chat({ model: "gpt-3.5-turbo", history: [] });

    expect(spy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer undefined`,
        },
        body: { "model": "gpt-3.5-turbo", "messages": [], "tools": undefined },
      }
    );

  })

  it("should perform a chat completion", async () => {
    const polly = startPollyRecording(
      "OpenAiChatDriver > should perform a chat completion"
    );
    const result = await driver.chat({
      model: "gpt-3.5-turbo",
      history: [
        { type: "system", text: "You are a chatbot." },
        { type: "user", text: "What are you?" },
      ],
    });
    await polly.stop();

    expect(result).toMatchSnapshot();
  });
});
