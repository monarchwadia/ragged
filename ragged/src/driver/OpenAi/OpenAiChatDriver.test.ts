import { DriverApiClient } from "../DriverApiClient";
import { OpenAiChatDriver } from "./OpenAiChatDriver";

describe("OpenAiChatDriver", () => {
    it("should perform a chat completion", async () => {
        // Arrange
        const config = {
            apiKey: process.env.OPENAI_API_KEY
        }

        const driverApiClient = new DriverApiClient();
        const driver = new OpenAiChatDriver(driverApiClient, config);

        // Act
        const result = await driver.chatCompletion({
            model: "",
            messages: [
                { role: "system", content: "You are a chatbot." },
                { role: "user", content: "What are you?" }
            ]
        });

        console.log(JSON.stringify(result));
    })
})