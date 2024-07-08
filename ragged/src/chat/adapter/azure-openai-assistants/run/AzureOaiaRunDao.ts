import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";
import { OaiaRun } from "./AzureOaiaRunDaoTypes"

export type CreateRunParams = {
    threadId: string;
    assistant_id: string;
}

export type GetRunParams = {
    threadId: string;
    runId: string;
}

export class AzureOaiaRunDao {
    constructor(private config: AzureOaiaDaoCommonConfig) { }

    async createRun(apiClient: ApiClient, params: CreateRunParams): Promise<OaiaRun> {
        const url = `https://${encodeURIComponent(this.config.resourceName)}.openai.azure.com/openai/threads/${encodeURIComponent(params.threadId)}/runs?api-version=${encodeURIComponent(this.config.apiVersion)}`;
        const apiResponse = await apiClient.post(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": this.config.apiKey
            },
            body: {
                assistant_id: params.assistant_id
            }
        });
        return apiResponse.json;
    }

    async getRun(apiClient: ApiClient, apiKey: string, params: GetRunParams): Promise<OaiaRun> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/threads/${params.threadId}/runs/${params.runId}?api-version=${this.config.apiVersion}`
        const apiResponse = await apiClient.get(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            }
        });
        return apiResponse.json;
    }
}