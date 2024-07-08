/*
 * This example demonstrates how to use the Chat class to chat with the OpenAI API.
 * It is the simplest way to use the Chat class to chat with a model.
 */

// configure dotenv to load environment variables from a .env file into process.env
import { config } from 'dotenv';
config();

import { Chat } from "ragged"

// create a new Chat instance with the OpenAI provider
const c = Chat.with({
    provider: "openai",
    config: { apiKey: process.env.OPENAI_API_KEY }
});

// chat with the model
const messages = await c.chat('What is a rickroll?');

// log the messages
console.log(messages.history.at(-1)?.text); // A rickroll is a prank...
