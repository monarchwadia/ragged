import { ApiClient } from "../../../../support/ApiClient";
import { OaiaMessage, OaiaMessageList } from "./OaiaMessageDaoTypes"

export type CreateMessageParams = {
    threadId: any;
    body: {
        role: string;
        content: string;
    };
}

export class OaiaMessageDao {
    constructor() { }

    async createMessage(apiClient: ApiClient, apiKey: string, params: CreateMessageParams): Promise<OaiaMessage> {
        const apiResponse = await apiClient.post(`https://api.openai.com/v1/threads/${params.threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: params.body
        });

        return apiResponse.json;
    }

    async listMessagesForThread(apiClient: ApiClient, apiKey: string, threadId: string): Promise<OaiaMessageList> {
        const apiResponse = await apiClient.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });

        return apiResponse.json;
    }
}