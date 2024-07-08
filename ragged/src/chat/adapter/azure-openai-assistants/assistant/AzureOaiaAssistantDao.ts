import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaCreateAssistantRequestBody, OaiaAssistant } from "./AzureOaiaAssistantDaoTypes"
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

export class AzureOaiaDao {
    constructor(private config: AzureOaiaDaoCommonConfig) { }

    async createAssistant(apiClient: ApiClient, body: AzureOaiaCreateAssistantRequestBody): Promise<OaiaAssistant> {
        const url = `https://${encodeURIComponent(this.config.resourceName)}.openai.azure.com/openai/assistants?api-version=${encodeURIComponent(this.config.apiVersion)}`;

        const apiResponse = await apiClient.post(url, {
            body: body,
            headers: {
                "Content-Type": "application/json",
                "api-key": this.config.apiKey
            }
        });

        return apiResponse.json;
    }
}
