/*
 * A simple example with Cohere
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged"

const c = Chat.with({
    provider: "cohere",
    config: { apiKey: process.env.COHERE_API_KEY, model: 'command-light' }
});

const { history } = await c.chat('What is a rickroll?');

console.log(history.at(-1)?.text); // A rickroll is ...
