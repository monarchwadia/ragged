/*
 * A simple example with Cohere
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged/chat"

const c = Chat.with('cohere', { apiKey: process.env.COHERE_API_KEY, model: 'command-light' });

const messages = await c.chat('What is a rickroll?');

console.log(messages.at(-1)?.text); // A rickroll is ...
