/**
 * Implements a simple round robin pool of adapters.
 */

import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat";
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"
import { CohereChatAdapter } from "ragged/chat/adapter/cohere";
import { provideCohereChatAdapter } from "ragged/chat/adapter/cohere";
import { OpenAiChatAdapter } from "ragged/chat/adapter/openai";
import { provideOpenAiChatAdapter } from "ragged/chat/adapter/openai";
import { ApiClient } from "ragged/support/api-client";

export class PoolWrapperAdapter implements BaseChatAdapter {
    private index: number = 0;
    constructor(private pool: BaseChatAdapter[]) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const response = await this.pool[this.index].chat(request);
        this.index = (this.index + 1) % this.pool.length;
        return response;
    }
}

const apiClient = new ApiClient();

const cPooled = new Chat(new PoolWrapperAdapter([
    new CohereChatAdapter(apiClient, {
        apiKey: process.env.COHERE_API_KEY,
        model: 'command-r'
    }),
    new OpenAiChatAdapter(apiClient, {
        apiKey: process.env.OPENAI_API_KEY,
        rootUrl: 'https://api.openai.com/v1/chat/completions'
    })
]));

const q = "Hello, what AI model are you using?";
console.log("USER: " + q)
const response1 = await cPooled.chat(q);
console.log("BOT: " + response1.at(-1)?.text);

console.log("USER: " + q)
const response2 = await cPooled.chat(q);
console.log("BOT: " + response2.at(-1)?.text);

console.log("USER: " + q)
const response3 = await cPooled.chat(q);
console.log("BOT: " + response3.at(-1)?.text);

