import { Message } from "../index.types";

export type ChatRequest = {
    history: Message[];
}

export type ChatResponse = {
    history: Message[];
}

export interface BaseChatAdapter {
    chat(request: ChatRequest): Promise<ChatResponse>;
}
