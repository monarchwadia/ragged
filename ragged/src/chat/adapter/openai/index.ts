import { ApiClient } from "../../../support/ApiClient.js";
import { Logger } from "../../../support/logger/Logger.js";
import { BaseChatAdapter, ChatRequest } from "../index.types.js";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "./OpenAiApiTypes.js";
import { mapFromOpenAi, mapToOpenAi } from "./mappers.js";


export type OpenAiChatAdapterConfig = {
    apiKey: string | undefined;
    organizationId: string | undefined;
    rootUrl: string;
}

const buildDefaultConfig = (): OpenAiChatAdapterConfig => {
    return {
        apiKey: undefined,
        organizationId: undefined,
        rootUrl: "https://api.openai.com/v1/chat/completions"
    }
}

export class OpenAiChatAdapter implements BaseChatAdapter {
    private logger: Logger = new Logger('OpenAiChatDriver');
    private config: OpenAiChatAdapterConfig;

    constructor(private driverApiClient: ApiClient, config: Partial<OpenAiChatAdapterConfig> = {}) {
        this.config = { ...buildDefaultConfig(), ...config };
    }

    async chat(request: ChatRequest) {
        const mappedRequest = mapToOpenAi(request);
        const response = await this.chatCompletion(mappedRequest);
        const mappedResponse = mapFromOpenAi(response);
        return mappedResponse;
    }


    private async chatCompletion(body: OpenAiChatCompletionRequestBody): Promise<OpenAiChatCompletionResponseBody> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };

        if (this.config.organizationId) {
            headers['OpenAI-Organization'] = this.config.organizationId;
        }

        return await this.driverApiClient.post(
            this.config.rootUrl,
            {
                headers,
                body
            }
        )
    }
}