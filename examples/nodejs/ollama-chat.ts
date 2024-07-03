/*
 * A simple example with Ollama
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged"

const c = Chat.with({
    provider: "ollama",
    config: {
        model: "llama3",
        // I'm running inside Virtualbox, so I need to use the host machine's IP
        endpoint: "http://10.0.2.2:11434/api/chat",
    }
});


const messages = await c.chat('What is a rickroll?');

console.log(messages.at(-1)?.text); // A rickroll is ...
