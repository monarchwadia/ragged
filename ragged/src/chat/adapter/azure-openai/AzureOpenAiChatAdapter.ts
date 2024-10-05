import { ApiClient } from "../../../support/ApiClient";
import { Logger } from "../../../support/logger/Logger";
import { BaseChatAdapter, ChatAdapterRequest } from "../BaseChatAdapter.types";
import { AzureOpenAiChatCompletionRequestBody, AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { AzureOpenAiChatMappers } from "./AzureOpenAiChatMappers";


export type AzureOpenAiChatAdapterConfig = {
    apiKey: string;
    resourceName: string;
    deploymentName: string;
    apiVersion: string;
}

export class AzureOpenAiChatAdapter implements BaseChatAdapter {
    private static logger: Logger = new Logger('AzureOpenAiChatDriver');

    constructor(private config: AzureOpenAiChatAdapterConfig) {
    }

    async chat(request: ChatAdapterRequest) {
        const mappedRequest = AzureOpenAiChatMappers.mapToOpenAi(request.history);
        const apiResponse = await this.chatCompletion(request.context.apiClient, mappedRequest);
        const mappedResponse = AzureOpenAiChatMappers.mapFromOpenAi(apiResponse.json);
        return {
            history: mappedResponse,
            raw: apiResponse.raw
        };
    }

    private async chatCompletion(apiClient: ApiClient, body: AzureOpenAiChatCompletionRequestBody) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'api-key': `${this.config.apiKey}`
        };

        const apiResponse = await apiClient.post(
            this.buildUrlFromConfig(),
            {
                headers,
                body
            }
        )

        return apiResponse;
    }

    private buildUrlFromConfig() {
        const { resourceName, deploymentName, apiVersion } = this.config;
        const url = `https://${encodeURIComponent(resourceName)}.openai.azure.com/openai/deployments/${encodeURIComponent(deploymentName)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`
        // AzureOpenAiChatAdapter.logger.debug(`Built URL: ${url}`);
        return url;
    }
}