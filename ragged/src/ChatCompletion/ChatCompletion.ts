import { Message } from "./ChatCompletion.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "./adapter/BaseChatAdapter.types";

export class ChatCompletion {
    constructor(private adapter: BaseChatAdapter) { }

    async chat(history: Message[]): Promise<Message[]> {
        const request: ChatRequest = {
            history
        }

        const response = await this.adapter.chat(request);
        return response.history;
    }
}