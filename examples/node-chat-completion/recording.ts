/*
 * This example demonstrates how to persist the history of messages in a Chat instance 
 * by turning on recording.
 */

// configure dotenv to load environment variables from a .env file into process.env
import { config } from 'dotenv';
config();

// import the Chat class from the ragged/chat module
import { Chat } from "ragged/chat"

// create a new Chat instance with the OpenAI provider
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// turn on recording
c.record(true);

// chat with the model
let response = await c.chat('What is a rickroll?');
console.log(response.at(-1)?.text); // A rickroll is a prank...
response = await c.chat('Where did it originate?');
console.log(response.at(-1)?.text); // The Rickroll meme originated in the...
response = await c.chat('What is the purpose?');
console.log(response.at(-1)?.text); // The purpose of a rickroll is to...
