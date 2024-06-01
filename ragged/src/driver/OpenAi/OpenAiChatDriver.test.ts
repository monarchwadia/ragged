import { DriverApiClient } from "../DriverApiClient";
import { OpenAiChatDriver } from "./OpenAiChatDriver";
import nock from 'nock';

describe("OpenAiChatDriver", () => {
    beforeEach(() => {
        nock('https://api.openai.com')
            .post('/v1/chat/completions')
            .reply(200, {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": 0,
                        "logprobs": null,
                        "text": "I am a chatbot."
                    }
                ]
            });
    })
    it("should perform a chat completion", async () => {
        // Arrange
        const config = {
            apiKey: process.env.OPENAI_API_KEY
        }

        const driverApiClient = new DriverApiClient();
        const driver = new OpenAiChatDriver(driverApiClient, config);

        // Act
        const result = await driver.chatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a chatbot." },
                { role: "user", content: "What are you?" }
            ]
        });

        console.log(JSON.stringify(result));
    })
})