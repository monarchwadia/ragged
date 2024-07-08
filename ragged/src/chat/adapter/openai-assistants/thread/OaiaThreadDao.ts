import { ApiClient } from "../../../../support/ApiClient";
import { OaiaThread } from "./OaiaThreadDaoTypes"

export class OaiaThreadDao {
    constructor() { }

    async createThread(apiClient: ApiClient, apiKey: string): Promise<OaiaThread> {
        const apiResponse = await apiClient.post("https://api.openai.com/v1/threads", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });

        return apiResponse.json;
    }
}