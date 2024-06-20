import { ApiClient } from "../../../support/ApiClient";
import { ThreadCreateResponseBody } from "./OaiaThreadDaoTypes"

export class OaiaThreadDao {
    constructor(private apiClient: ApiClient) { }

    createThread(apiKey: string): Promise<ThreadCreateResponseBody> {
        return this.apiClient.post("https://api.openai.com/v1/threads", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });
    }
}