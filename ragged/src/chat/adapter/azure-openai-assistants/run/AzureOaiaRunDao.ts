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
    constructor(private apiClient: ApiClient, private config: AzureOaiaDaoCommonConfig) { }

    createRun(params: CreateRunParams): Promise<OaiaRun> {
        const url = `https://${encodeURIComponent(this.config.resourceName)}.openai.azure.com/openai/threads/${encodeURIComponent(params.threadId)}/runs?api-version=${encodeURIComponent(this.config.apiVersion)}`;
        return this.apiClient.post(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": this.config.apiKey
            },
            body: {
                assistant_id: params.assistant_id
            }
        });
    }

    getRun(apiKey: string, params: GetRunParams): Promise<OaiaRun> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/threads/${params.threadId}/runs/${params.runId}?api-version=${this.config.apiVersion}`
        return this.apiClient.get(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            }
        });
    }
}