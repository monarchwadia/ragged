import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { OpenAiChatDriver } from "./OpenAiChatDriver";

describe("OpenAiChatDriver", () => {
    let driver: OpenAiChatDriver;

    beforeEach(() => {
        const config = {
            // apiKey: process.env.OPENAI_API_KEY
        };

        const driverApiClient = new ApiClient();
        driver = new OpenAiChatDriver(driverApiClient, config);
    });

    afterEach(() => { });

    it("should perform a chat completion", async () => {
        const polly = startPollyRecording("OpenAiChatDriver > should perform a chat completion");
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

    it("should throw a JsonParseError when the request JSON cannot be stringified", async () => {

    });
});
