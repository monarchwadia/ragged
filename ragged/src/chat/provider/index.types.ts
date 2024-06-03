import { Message } from "../index.types";
import { Tool } from "../../tools"

export type ChatRequest = {
    history: Message[];
    tools?: Tool[];
}

export type ChatResponse = {
    history: Message[];
}

export interface BaseChatAdapter {
    chat(request: ChatRequest): Promise<ChatResponse>;
}
