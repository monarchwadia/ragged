import { ApiClient } from "../../../../support/ApiClient";
import { OaiaRun } from "./OaiaRunDaoTypes"

export type CreateRunParams = {
    threadId: string;
    body: {
        assistant_id: string;
        instructions: string;
    };
}

export type GetRunParams = {
    threadId: string;
    runId: string;
}

export class OaiaRunDao {
    constructor(private apiClient: ApiClient) { }

    async createRun(apiKey: string, params: CreateRunParams): Promise<OaiaRun> {
        const apiResponse = await this.apiClient.post(`https://api.openai.com/v1/threads/${params.threadId}/runs`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: params.body
        });
        return apiResponse.json;
    }

    async getRun(apiKey: string, params: GetRunParams): Promise<OaiaRun> {
        // get https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}
        const apiResponse = await this.apiClient.get(`https://api.openai.com/v1/threads/${params.threadId}/runs/${params.runId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });

        return apiResponse.json
    }
}