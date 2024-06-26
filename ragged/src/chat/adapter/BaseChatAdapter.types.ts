import { Message } from "../Chat.types";
import { Tool } from "../../tools/Tools.types"

export type ChatAdapterRequest = {
    history: Message[];
    tools?: Tool[];
    model?: string;
}

export type ChatAdapterResponse = {
    history: Message[];
}

export interface BaseChatAdapter {
    chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse>;
}
