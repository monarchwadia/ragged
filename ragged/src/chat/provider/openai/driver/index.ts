import { Logger } from "../../../../support/logger/Logger";
import { ApiClient } from "../../../../support/ApiClient";
import { JsonParseError, FetchRequestFailedError } from "../../../../support/CustomErrors";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody as OpenAiChatCompletionResponseBody } from "./OpenAiApiTypes";
import { ApiJsonHandler } from "../../../../support/ApiJsonHandler";

// ============ types ============

export type OpenAiChatDriverConfig = {
    apiKey: string | undefined;
    rootUrl: string;
}

// ============ utils ============

const buildDefaultConfig = (): OpenAiChatDriverConfig => {
    return {
        apiKey: undefined,
        rootUrl: "https://api.openai.com/v1/chat/completions"
    }
}

/**
 * @private
 * This is a driver for the OpenAI Chat API. Most devs will never instantiate this class directly, and don't
 * need to know about it.
 */
export class OpenAiChatDriver {
    private logger: Logger = new Logger('OpenAiChatDriver');
    private config: OpenAiChatDriverConfig;

    constructor(private driverApiClient: ApiClient, config: Partial<OpenAiChatDriverConfig> = {}) {
        this.config = { ...buildDefaultConfig(), ...config };
    }

    async chatCompletion(requestBody: OpenAiChatCompletionRequestBody): Promise<OpenAiChatCompletionResponseBody> {
        const body = ApiJsonHandler.stringify(requestBody);

        const response = await this.driverApiClient.post(
            this.config.rootUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body
            }
        )

        return ApiJsonHandler.parseResponse(response);
    }
}