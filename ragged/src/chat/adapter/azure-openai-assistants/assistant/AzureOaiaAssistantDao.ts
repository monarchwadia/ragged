import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaCreateAssistantRequestBody, OaiaAssistant } from "./AzureOaiaAssistantDaoTypes"
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

export class AzureOaiaDao {
    constructor(private apiClient: ApiClient, private config: AzureOaiaDaoCommonConfig) { }

    createAssistant(body: AzureOaiaCreateAssistantRequestBody): Promise<OaiaAssistant> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/assistants?api-version=${this.config.apiVersion}`;

        return this.apiClient.post("https://api.openai.com/v1/assistants", {
            body: body,
            headers: {
                "Content-Type": "application/json",
                "api-key": `Bearer ${this.config.apiKey}`
            }
        });
    }
}
