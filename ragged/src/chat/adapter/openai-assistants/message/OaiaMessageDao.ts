import { ApiClient } from "../../../../support/ApiClient.js";
import type { OaiaMessage, OaiaMessageList } from "./OaiaMessageDaoTypes.js"

export type CreateMessageParams = {
    threadId: any;
    body: {
        role: string;
        content: string;
    };
}

export class OaiaMessageDao {
    constructor(private apiClient: ApiClient) { }

    createMessage(apiKey: string, params: CreateMessageParams): Promise<OaiaMessage> {
        return this.apiClient.post(`https://api.openai.com/v1/threads/${params.threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: params.body
        });
    }

    listMessagesForThread(apiKey: string, threadId: string): Promise<OaiaMessageList> {
        return this.apiClient.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });
    }
}