import { ApiClient } from "../../../../support/ApiClient";
import { Logger } from "../../../../support/logger/Logger";
import { BaseChatAdapter, ChatRequest } from "../../index.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "./OpenAiApiTypes";
import { mapFromOpenAi, mapToOpenAi } from "./mappers";


export type OpenAiChatAdapterConfig = {
    apiKey: string | undefined;
    rootUrl: string;
}

const buildDefaultConfig = (): OpenAiChatAdapterConfig => {
    return {
        apiKey: undefined,
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
        return await this.driverApiClient.post(
            this.config.rootUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body
            }
        )
    }
}