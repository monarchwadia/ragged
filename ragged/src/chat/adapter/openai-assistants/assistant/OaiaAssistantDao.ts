import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantCreateRequestBody, OaiaAssistant } from "./OaiaAssistantDaoTypes"

export class OaiaAssistantDao {
    constructor() { }

    async createAssistant(apiClient: ApiClient, apiKey: string, body: OaiaAssistantCreateRequestBody): Promise<OaiaAssistant> {
        const apiResponse = await apiClient.post("https://api.openai.com/v1/assistants", {
            body: body,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });

        return apiResponse.json;
    }
}