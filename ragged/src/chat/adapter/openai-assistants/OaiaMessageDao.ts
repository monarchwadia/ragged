import { ApiClient } from "../../../support/ApiClient";
import { CreateMessageResponseBody } from "./OaiaMessageDaoTypes"

export type CreateMessageParams = {
    threadId: any;
    body: {
        role: string;
        content: string;
    };
}

export class OaiaMessageDao {
    constructor(private apiClient: ApiClient) { }

    createMessage(apiKey: string, params: CreateMessageParams): Promise<CreateMessageResponseBody> {
        return this.apiClient.post(`https://api.openai.com/v1/threads/${params.threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: params.body
        });
    }
}