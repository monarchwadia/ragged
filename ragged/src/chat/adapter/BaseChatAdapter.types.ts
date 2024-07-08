import { Message } from "../Chat.types";
import { Tool } from "../../tools/Tools.types"
import { ApiClient } from "../../support/ApiClient";

export type ChatAdapterRequest = {
    history: Message[];
    tools?: Tool[];
    model?: string;
    context: {
        apiClient: ApiClient;
    }
}

export type ChatAdapterResponse = {
    history: Message[];
    raw: {
        request: Request | null;
        response: Response | null;
    }
}

export interface BaseChatAdapter {
    chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse>;
}
