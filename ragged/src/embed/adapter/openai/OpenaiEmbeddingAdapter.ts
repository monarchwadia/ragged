import { ApiClient } from "../../../support/ApiClient";
import { Logger } from "../../../support/logger/Logger";
import type { EmbedRequest, EmbedResponse } from "../../Embed.types";
import type { BaseEmbeddingAdapter } from "../BaseEmbeddingAdapter.types";
import { OpenaiEmbeddingResponse } from "./OpenaiEmbeddingTypes";

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

    async embed(request: EmbedRequest): Promise<EmbedResponse> {
        const response = await this.params.apiClient.post('https://api.openai.com/v1/embeddings', {
            body: {
                input: request.text,
                model: request.model || "text-embedding-3-small"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.params.apiKey}`
            }
        });

        const json: OpenaiEmbeddingResponse = response.json;

        if (json.data.length > 1) {
            OpenaiEmbeddingAdapter.logger.warn('Recived more than one embedding from OpenAI. This is not currently supported. Returning only the first one.');
        }

        const responseObj: EmbedResponse = {
            model: json.model,
            provider: 'openai',
            embedding: json.data[0].embedding
        }


        return responseObj;
    }
}
