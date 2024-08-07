/*
 * A simple example with Ollama
 */

import { config } from 'dotenv';
config();
import { Chat, Logger } from "ragged"

Logger.setLogLevel("debug");

const c = Chat.with({
    provider: "ollama",
    config: {
        model: "llama3",
        // I'm running inside Virtualbox, so I need to use the host machine's IP
        endpoint: "http://10.0.2.2:11434/api/chat",
    }
});


const response = await c.chat('What is a rickroll?');

console.log(response.history.at(-1)?.text); // A rickroll is ...
