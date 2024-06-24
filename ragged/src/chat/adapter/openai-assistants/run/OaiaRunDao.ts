import { ApiClient } from "../../../../support/ApiClient.js";
import type { OaiaRun } from "./OaiaRunDaoTypes.js"

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

    getRun(apiKey: string, params: GetRunParams): Promise<OaiaRun> {
        // get https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}
        return this.apiClient.get(`https://api.openai.com/v1/threads/${params.threadId}/runs/${params.runId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });
    }
}