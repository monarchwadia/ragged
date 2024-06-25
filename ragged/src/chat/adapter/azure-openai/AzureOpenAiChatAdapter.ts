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

    constructor(private driverApiClient: ApiClient, private config: AzureOpenAiChatAdapterConfig) {
    }

    async chat(request: ChatAdapterRequest) {
        const mappedRequest = AzureOpenAiChatMappers.mapToOpenAi(request);
        const response = await this.chatCompletion(mappedRequest);
        const mappedResponse = AzureOpenAiChatMappers.mapFromOpenAi(response);
        return mappedResponse;
    }

    private async chatCompletion(body: AzureOpenAiChatCompletionRequestBody): Promise<AzureOpenAiChatCompletionResponseBody> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'api-key': `${this.config.apiKey}`
        };

        return await this.driverApiClient.post(
            this.buildUrlFromConfig(),
            {
                headers,
                body
            }
        )
    }

    private buildUrlFromConfig() {
        const { resourceName, deploymentName, apiVersion } = this.config;
        const url = `https://${encodeURIComponent(resourceName)}.openai.azure.com/openai/deployments/${encodeURIComponent(deploymentName)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`
        // AzureOpenAiChatAdapter.logger.debug(`Built URL: ${url}`);
        return url;
    }
}