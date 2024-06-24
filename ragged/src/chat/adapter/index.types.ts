import { Message } from "../index.types.js";
import { Tool } from "../../tools/index.js"

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
