import { ApiClient } from "../../../../support/ApiClient.js";
import { OaiaThread } from "./OaiaThreadDaoTypes.js"

export class OaiaThreadDao {
    constructor(private apiClient: ApiClient) { }

    createThread(apiKey: string): Promise<OaiaThread> {
        return this.apiClient.post("https://api.openai.com/v1/threads", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });
    }
}