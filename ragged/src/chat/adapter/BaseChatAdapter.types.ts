import type { Message } from "../Chat.types.js";
import type { Tool } from "../../tools/Tools.types.js"

export type ChatRequest = {
    history: Message[];
    tools?: Tool[];
    model?: string;
}

export type ChatResponse = {
    history: Message[];
}

export interface BaseChatAdapter {
    chat(request: ChatRequest): Promise<ChatResponse>;
}
