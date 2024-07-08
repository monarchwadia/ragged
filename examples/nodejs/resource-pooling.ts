/**
 * Implements a simple round robin pool of adapters.
 */

import { config } from 'dotenv';
config();

import { Chat, ApiClient } from "ragged";
import { ChatAdapters, RaggedErrors } from "ragged";
import type { ChatAdapterTypes } from "ragged";

const provideCohereChatAdapter = ChatAdapters.Cohere.provideCohereChatAdapter;
const provideOpenAiChatAdapter = ChatAdapters.OpenAi.provideOpenAiChatAdapter;
const CohereChatAdapter = ChatAdapters.Cohere.CohereChatAdapter;
const OpenAiChatAdapter = ChatAdapters.OpenAi.OpenAiChatAdapter;
const { ParameterValidationError } = RaggedErrors;

type BaseChatAdapter = ChatAdapterTypes["BaseChatAdapter"];
/**
 * Adapter that wraps a pool of adapters and forwards requests to them in a round-robin fashion.
 */
export class PoolWrapperAdapter implements BaseChatAdapter {
    /**
     * Index of the next adapter to use.
     */
    private index: number = 0;

    constructor(private pool: BaseChatAdapter[]) {
        if (pool.length === 0) {
            throw new ParameterValidationError("Pool must have at least one adapter");
        }
    }

    /**
     * Forwards the request to the next adapter in the pool.
     * The response is returned to the Ragged `Chat` class.
     * All history is managed in `Chat` class; this class is
     * only responsible for forwarding and mapping the request.
     */
    async chat(request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> {
        const response = await this.pool[this.index].chat(request);
        this.index = (this.index + 1) % this.pool.length;
        return response;
    }
}

/**
 * If we wanted, we could implement our own ApiClient as well.
 * The API client is used to make HTTP requests to the AI services.
 * This would be a good place to implement rate limiting, throttling, etc.
 */
const apiClient = new ApiClient();

/**
 * We can use the `provideCohereChatAdapter` and `provideOpenAiChatAdapter` functions, too.
 * But we are using the constructors directly here for demonstration purposes.
 */
const cPooled = new Chat(new PoolWrapperAdapter([
    /**
     * An example with Cohere adapter
     */
    new CohereChatAdapter(apiClient, {
        apiKey: process.env.COHERE_API_KEY,
        model: 'command-r'
    }),
    /**
     * An example with OpenAI adapter. In the future, we could use Azure OpenAI as well.
     */
    new OpenAiChatAdapter(apiClient, {
        apiKey: process.env.OPENAI_API_KEY,
        /**
         * To use any openai-compatible API, such as over Ollama, we can set the rootUrl here.
         */
        rootUrl: 'https://api.openai.com/v1/chat/completions'
    })
]));

// This first call will be forwarded to the Cohere adapter.
const q = "Hello, what AI model are you using?";
console.log("USER: " + q)
const response1 = await cPooled.chat(q);
console.log("BOT: " + response1.history.at(-1)?.text);

// This second call will be forwarded to the OpenAI adapter.
console.log("USER: " + q)
const response2 = await cPooled.chat(q);
console.log("BOT: " + response2.history.at(-1)?.text);

// This third call will be forwarded to the Cohere adapter again.
console.log("USER: " + q)
const response3 = await cPooled.chat(q);
console.log("BOT: " + response3.history.at(-1)?.text);

