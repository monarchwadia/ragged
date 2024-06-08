/*
 * This example demonstrates how to persist the history of messages in a Chat instance 
 * by turning on recording.
 */

import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
c.record(true);

const response = await c.chat('What is a rickroll?');


// you can access the response directly from the chat instance
console.log("FROM C OBJECT", c.history.at(-1)?.text); // A rickroll is a prank...
// or, alternatively, you can get the last message from the response
console.log("FROM RESPONSE", response.at(-1)?.text); // A rickroll is a prank...

// continue the conversation
await c.chat('Where did it originate?');
console.log(c.history.at(-1)?.text); // The Rickroll meme originated in the...
await c.chat('What is the purpose?');
console.log(c.history.at(-1)?.text); // The purpose of a rickroll is to...
