import { ApiClient } from "../../../../support/ApiClient";
import { OaiaAssistantCreateRequestBody, OaiaAssistant } from "./AzureOaiaAssistantDaoTypes"

export class AzureOaiaAssistantDao {
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