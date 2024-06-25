import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaCreateAssistantRequestBody, OaiaAssistant } from "./AzureOaiaAssistantDaoTypes"

export type AzureOaiaDaoConfig = {
    apiKey: string;
    resourceName: string;
    deploymentName: string;
    apiVersion: string;
}

export class AzureOaiaDao {
    private apiKey: string;
    private resourceName: string;
    private deploymentName: string;
    private apiVersion: string;

    constructor(private apiClient: ApiClient, config: AzureOaiaDaoConfig) {
        this.apiKey = config.apiKey;
        this.resourceName = config.resourceName;
        this.deploymentName = config.deploymentName;
        this.apiVersion = config.apiVersion;
    }

    createAssistant(body: AzureOaiaCreateAssistantRequestBody): Promise<OaiaAssistant> {
        const url = `https://${this.resourceName}.openai.azure.com/openai/assistants?api-version=${this.apiVersion}`;

        return this.apiClient.post("https://api.openai.com/v1/assistants", {
            body: body,
            headers: {
                "Content-Type": "application/json",
                "api-key": `Bearer ${this.apiKey}`
            }
        });
    }
}