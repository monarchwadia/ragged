import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";
import { OaiaMessage, OaiaMessageList } from "./AzureOaiaMessageDaoTypes"

export type CreateMessageParams = {
    threadId: any;
    body: {
        role: string;
        content: string;
    };
}

export class AzureOaiaMessageDao {
    constructor(private apiClient: ApiClient, private config: AzureOaiaDaoCommonConfig) { }

    createMessage(params: CreateMessageParams): Promise<OaiaMessage> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/threads/${params.threadId}/messages?api-version=${this.config.apiVersion}`;

        return this.apiClient.post(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": this.config.apiKey
            },
            body: params.body
        });
    }

    listMessagesForThread(threadId: string): Promise<OaiaMessageList> {
        const url = `https://${this.config.resourceName}.openai.azure.com/openai/threads/${threadId}/messages?api-version=${this.config.apiVersion}`;

        return this.apiClient.get(url, {
            headers: {
                "Content-Type": "application/json",
                "api-key": this.config.apiKey
            }
        });
    }
}