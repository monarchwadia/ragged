import { Chat } from "ragged/chat";
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"
import { CohereChatAdapter } from "../../ragged/src/chat/adapter/cohere/CohereChatAdapter";
import { provideCohereChatAdapter } from "../../ragged/src/chat/adapter/cohere/provideCohereChatAdapter";

/**
 * Implements a simple round robin pool of adapters.
 */
export class PoolWrapperAdapter implements BaseChatAdapter {
    private index: number = 0;
    constructor(private pool: BaseChatAdapter[]) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const response = await this.pool[this.index].chat(request);
        this.index = (this.index + 1) % this.pool.length;
        return response;
    }
}
