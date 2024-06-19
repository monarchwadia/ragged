import { Chat } from "ragged/chat";
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"

/**
 * Implements a simple round robin pool of adapters.
 */
class PoolWrapperAdapter implements BaseChatAdapter {
    private index: number = 0;
    constructor(private pool: BaseChatAdapter[]) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        const response = await this.pool[this.index].chat(request);
        this.index = (this.index + 1) % this.pool.length;
        return response;
    }
}

const c = new Chat(new PoolWrapperAdapter([

]));