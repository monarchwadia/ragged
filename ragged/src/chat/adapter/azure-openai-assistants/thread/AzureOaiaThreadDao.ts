import { ApiClient } from "../../../../support/ApiClient";
import { Logger } from "../../../../support/logger/Logger";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";
import { OaiaThread } from "./AzureOaiaThreadDaoTypes"

export class OaiaThreadDao {
    private static logger = new Logger("OaiaThreadDao");
    
    constructor(private apiClient: ApiClient, private config: AzureOaiaDaoCommonConfig) { }

    createThread(): Promise<OaiaThread> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/threads?api-version=${this.config.apiVersion}`;
        return this.apiClient.post(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": `${this.config.apiKey}`
            }
        });
    }
}
