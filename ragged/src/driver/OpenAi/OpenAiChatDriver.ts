import { Logger } from "../../logger/Logger";
import { DriverApiClient } from "../DriverApiClient";
import { JsonParseError, FetchRequestFailedError } from "../DriverErrors";

// ============ types ============

type OpenAiChatDriverConfig = {
    apiKey: string | undefined;
    rootUrl: string;
}

type ChatCompletionParams = {
    model: string;
    messages: {
        role: string;
        content: string;
    }[]
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

    constructor(private driverApiClient: DriverApiClient, config: Partial<OpenAiChatDriverConfig> = {}) {
        this.config = { ...buildDefaultConfig(), ...config };
    }

    async chatCompletion(params: ChatCompletionParams) {
        let body: string;

        try {
            body = JSON.stringify(params);
        } catch (e) {
            const message = "Failed to stringify request JSON for OpenAI API.";
            this.logger.error(message, e);
            throw new JsonParseError(message, e);
        }

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

        if (response.status < 200 || response.status >= 300) {
            const err = new FetchRequestFailedError(`Request to OpenAI failed with status code ${response.status}.`, response)
            this.logger.error(err);
            throw err;
        }

        let json: any;
        try {
            json = response.json();
        } catch (e) {
            const err = new JsonParseError("Failed to parse response JSON from OpenAI API.", e);
            this.logger.error(err);
            throw err;
        }

        return json;
    }
}