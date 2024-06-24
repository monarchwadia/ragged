import { ApiClient } from "../../../support/ApiClient";
import { Logger } from "../../../support/logger/Logger";
import { BaseChatAdapter, ChatAdapterRequest } from "../BaseChatAdapter.types";
import { AzureOpenAiChatCompletionRequestBody, AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { AzureOpenAiChatMappers } from "./AzureOpenAiChatMappers";


export type AzureOpenAiChatAdapterConfig = {
    apiKey: string;
    rootUrl: string;
}

const buildDefaultConfig = (): AzureOpenAiChatAdapterConfig => {
    return {
        apiKey: "",
        rootUrl: "https://api.openai.com/v1/chat/completions"
    }
}

export class AzureOpenAiChatAdapter implements BaseChatAdapter {
    private logger: Logger = new Logger('AzureOpenAiChatDriver');
    private config: AzureOpenAiChatAdapterConfig;

    constructor(private driverApiClient: ApiClient, config: Partial<AzureOpenAiChatAdapterConfig> = {}) {
        this.config = { ...buildDefaultConfig(), ...config };
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
            'Authorization': `Bearer ${this.config.apiKey}`
        };

        return await this.driverApiClient.post(
            this.config.rootUrl,
            {
                headers,
                body
            }
        )
    }
}