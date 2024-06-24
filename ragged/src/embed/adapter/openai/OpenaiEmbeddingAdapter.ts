import { ApiClient } from "../../../support/ApiClient.js";
import { Logger } from "../../../support/logger/Logger.js";
import type { EmbeddingRequest, Embedding } from "../../Embed.types.js";
import type { BaseEmbeddingAdapter } from "../../adapter/index.types.js";
import { OpenaiEmbeddingResponse } from "./OpenaiEmbeddingTypes.js";

export type OpenaiEmbeddingAdapterConstructorParams = {
    apiKey: string;
    apiClient: ApiClient;
}

/**
 * Adapter to get embeddings from OpenAI.
 */
export class OpenaiEmbeddingAdapter implements BaseEmbeddingAdapter {
    private static logger: Logger = new Logger('OpenaiEmbeddingAdapter');
    constructor(private params: OpenaiEmbeddingAdapterConstructorParams) { }

    async embed(request: EmbeddingRequest): Promise<Embedding> {
        const response: OpenaiEmbeddingResponse = await this.params.apiClient.post('https://api.openai.com/v1/embeddings', {
            body: {
                input: request.text,
                model: request.model || "text-embedding-3-small"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.params.apiKey}`
            }
        });

        if (response.data.length > 1) {
            OpenaiEmbeddingAdapter.logger.warn('Recived more than one embedding from OpenAI. This is not currently supported. Returning only the first one.');
        }

        const responseObj: Embedding = {
            model: response.model,
            provider: 'openai',
            embedding: response.data[0].embedding
        }


        return responseObj;
    }
}
