import { ApiClient } from "../../../support/ApiClient";
import { BaseChatAdapter, ChatAdapterRequest } from "../BaseChatAdapter.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "./OpenAiApiTypes";
import { mapFromOpenAi, mapToOpenAi } from "./OpenAiChatMappers";


export type OpenAiChatAdapterConfig = {
    apiKey?: string | undefined;
    organizationId?: string | undefined;
    rootUrl?: string;
}

export class OpenAiChatAdapter implements BaseChatAdapter {
    private apiKey: string | undefined;
    private organizationId: string | undefined;
    private rootUrl: string = "https://api.openai.com/v1/chat/completions";

    constructor(config: OpenAiChatAdapterConfig = {}) {
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
        const apiResponse = await this.chatCompletion(request.context.apiClient, mappedRequest);
        const mappedResponse = mapFromOpenAi(apiResponse.json);
        return {
            history: mappedResponse,
            raw: apiResponse.raw

        };
    }


    private async chatCompletion(apiClient: ApiClient, body: OpenAiChatCompletionRequestBody) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        if (this.organizationId) {
            headers['OpenAI-Organization'] = this.organizationId;
        }

        return await apiClient.post(
            this.rootUrl,
            {
                headers,
                body
            }
        )
    }
}