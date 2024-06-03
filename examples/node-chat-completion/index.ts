import { config } from 'dotenv';
config();

import { Chat, Message } from "ragged/chat"

const c = Chat.with("openai", {
    apiKey: process.env.OPENAI_API_KEY
})

let history: Message[] = [];

history.push({
    type: "user",
    text: "Hello, how are you?"
})

history = await c.chat(history);

console.log(history);

// let history: Message[] = [];
// c.chat(history)