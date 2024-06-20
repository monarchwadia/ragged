import { ApiClient } from "../../../../support/ApiClient";
import { OaiaRun } from "./OaiaRunDaoTypes"

export type CreateRunParams = {
    threadId: string;
    body: {
        assistant_id: string;
        instructions: string;
    };
}

export class OaiaRunDao {
    constructor(private apiClient: ApiClient) { }

    createRun(apiKey: string, params: CreateRunParams): Promise<OaiaRun> {
        return this.apiClient.post(`https://api.openai.com/v1/threads/${params.threadId}/runs`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: params.body
        });
    }
}