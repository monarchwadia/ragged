import { Message } from "./index.types";
import { BaseChatAdapter, ChatRequest } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

export class Chat {
    constructor(private adapter: BaseChatAdapter) { }

    async chat(history: Message[]): Promise<Message[]> {
        const request: ChatRequest = {
            history
        }

        const response = await this.adapter.chat(request);
        return response.history;
    }

    static with(provider: "openai", config: Partial<OpenAiChatDriverConfig> = {}) {
        const adapter = provideOpenAiChatAdapter({ config })
        return new Chat(adapter);
    }
}