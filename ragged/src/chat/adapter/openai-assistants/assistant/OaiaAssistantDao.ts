import { ApiClient } from "../../../../support/ApiClient.js";
import type { OaiaAssistantCreateRequestBody, OaiaAssistant } from "./OaiaAssistantDaoTypes.js"

export class OaiaAssistantDao {
    constructor(private apiClient: ApiClient) { }

    createAssistant(apiKey: string, body: OaiaAssistantCreateRequestBody): Promise<OaiaAssistant> {
        return this.apiClient.post("https://api.openai.com/v1/assistants", {
            body: body,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });
    }
}