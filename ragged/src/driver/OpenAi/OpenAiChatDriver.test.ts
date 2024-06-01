import { Polly } from '@pollyjs/core';
import FetchAdapter from '@pollyjs/adapter-fetch';
import FSPersister from "@pollyjs/persister-fs";

/*
  Register the adapters and persisters we want to use. This way all future
  polly instances can access them by name.
*/
Polly.register(FetchAdapter);
Polly.register(FSPersister);

import { DriverApiClient } from "../DriverApiClient";
import { OpenAiChatDriver } from "./OpenAiChatDriver";

describe("OpenAiChatDriver", () => {
    beforeEach(() => {
    });

    afterEach(() => {

    });

    it("should perform a chat completion", async () => {
        // Arrange
        const config = {
            // apiKey: process.env.OPENAI_API_KEY
        }

        const driverApiClient = new DriverApiClient();
        const driver = new OpenAiChatDriver(driverApiClient, config);

        // Act
        const polly = new Polly('OpenAiChatDriver > should perform a chat completion', {
            adapters: ['fetch'],
            persister: 'fs',
            matchRequestsBy: {
                headers: false,
                body: false,
                order: false,
            }
        });
        polly.server.any().on('beforeResponse', (req) => {
            // mask auth header
            if (req.headers['authorization']) {
                req.headers['authorization'] = 'Bearer <redacted>';
            }
        });
        const result = await driver.chatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a chatbot." },
                { role: "user", content: "What are you?" }
            ]
        });

        await polly.stop();

        console.log(JSON.stringify(result));
    })
})