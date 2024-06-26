import { ApiClient } from "../../../support/ApiClient";
import { Logger } from "../../../support/logger/Logger";
import { BaseChatAdapter, ChatAdapterRequest } from "../BaseChatAdapter.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "./OpenAiApiTypes";
import { mapFromOpenAi, mapToOpenAi } from "./OpenAiChatMappers";


export type OpenAiChatAdapterConfig = {
    apiKey?: string | undefined;
    organizationId?: string | undefined;
    rootUrl?: string;
}

export class OpenAiChatAdapter implements BaseChatAdapter {
    private logger: Logger = new Logger('OpenAiChatDriver');
    private apiKey: string | undefined;
    private organizationId: string | undefined;
    private rootUrl: string = "https://api.openai.com/v1/chat/completions";

    constructor(private driverApiClient: ApiClient, config: OpenAiChatAdapterConfig = {}) {
        if (config.apiKey) {
            this.apiKey = config.apiKey;
        }

        if (config.organizationId) {
            this.organizationId = config.organizationId;
        }

        if (config.rootUrl) {
            this.rootUrl = config.rootUrl;
        }
    }

    async chat(request: ChatAdapterRequest) {
        const mappedRequest = mapToOpenAi(request);
        const response = await this.chatCompletion(mappedRequest);
        const mappedResponse = mapFromOpenAi(response);
        return mappedResponse;
    }


    private async chatCompletion(body: OpenAiChatCompletionRequestBody): Promise<OpenAiChatCompletionResponseBody> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        if (this.organizationId) {
            headers['OpenAI-Organization'] = this.organizationId;
        }

        return await this.driverApiClient.post(
            this.rootUrl,
            {
                headers,
                body
            }
        )
    }
}