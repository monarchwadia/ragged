import { config } from 'dotenv';
config();

import { Chat } from "ragged"
const c = Chat.with({
    provider: "openai",
    config: { apiKey: process.env.OPENAI_API_KEY }
});

// By default, recording is already turned on
// Doing this line just to demonstrate the API
c.record(true);

const response = await c.chat('What is a rickroll?');

// you can get the last message from the response
console.log(response.history.at(-1)?.text); // A rickroll is a prank...
// or, alternatively, you can access the response directly from the chat instance
console.log(c.history.at(-1)?.text); // A rickroll is a prank...

// continue the conversation
await c.chat('Where did it originate?');
console.log(c.history.at(-1)?.text); // The Rickroll meme originated in the...
await c.chat('What is the purpose?');
console.log(c.history.at(-1)?.text); // The purpose of a rickroll is to...