/*
 * This example demonstrates how to freeze the history of messages in a Chat instance.
 * This allows creative prompting and response generation based on the history of messages.
 */

import { config } from 'dotenv';
config();

import { Chat } from "ragged"
const c = Chat.with({
    provider: "openai",
    config: { apiKey: process.env.OPENAI_API_KEY }
});

c.record(true);

const response = await c.chat('Write a 4-step framework that can be used to provide insights into a snippet of code.');
console.log(response.history.at(-1)?.text); // 1. Provide a summary. By providing....

// freeze the history
c.record(false);

// continue the conversation

const analysis1 = await c.chat('Analyze this code snippet using the framework: `const x = 5;`');
console.log(analysis1.history.at(-1)?.text); // 1. Summary: This code snippet declares a variable called...

const analysis2 = await c.chat('Analyze this code snippet using the framework: `for (let i = 0; i < 5; i++) { console.log(i); }`');
console.log(analysis2.history.at(-1)?.text); // 1. Summary: This code snippet is a for loop that iterates...

