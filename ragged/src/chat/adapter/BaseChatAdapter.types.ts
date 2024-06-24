import { Message } from "../Chat.types";
import { Tool } from "../../tools/Tools.types"

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
