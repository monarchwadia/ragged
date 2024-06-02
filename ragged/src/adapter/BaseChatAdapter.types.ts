export type MessageType = "user" | "bot" | "system";

export type Message = {
    type: MessageType;
    text: string;
}

export type ChatRequest = {
    content: Message[];
}

export type ChatResponse = {
    content: Message[];
}

export interface BaseChatAdapter {
    chat(request: ChatRequest): Promise<ChatResponse>;
}
