import { ParameterValidationError } from "../support/RaggedErrors";
import { Logger } from "../support/logger/Logger";
import type { EmbedRequest, EmbedResponse } from "./Embed.types";
import type { BaseEmbeddingAdapter } from "./adapter/BaseEmbeddingAdapter.types";
import { provideOpenaiEmbeddingAdapter } from "./adapter/openai/provideOpenaiEmbeddingAdapter";

export type EmbedWithConfig = {
    provider: "openai";
    config: {
        apiKey: string;
        apiClient?: any;
    }
}

export class Embed {
    private static logger = new Logger('Embed');

    constructor(private adapter: BaseEmbeddingAdapter) { }

    static with({ provider, config }: EmbedWithConfig): Embed {
        let adapter: BaseEmbeddingAdapter;

        switch (provider) {
            case "openai":
                adapter = provideOpenaiEmbeddingAdapter({
                    apiKey: config.apiKey,
                    apiClient: config.apiClient
                });
                break;
            default:
                throw new ParameterValidationError("Invalid provider. Please check the documentation or your editor's code autocomplete for more information on how to use Embed.with().");
        }

        return new Embed(adapter);
    }

    async embed(text: string): Promise<EmbedResponse>;
    async embed(request: EmbedRequest): Promise<EmbedResponse>;
    async embed(...args: any[]): Promise<EmbedResponse> {
        const request = this.validatedRequest(args);
        return this.adapter.embed(request);
    }


    /**
     * Calculates how similar two sets of numbers (embeddings) are.
     * 
     * Cosine similarity is a way to measure how similar two sets of numbers are.
     * It's like checking the angle between two arrows pointing in a high-dimensional space.
     * A cosine similarity of 1 means the arrows point in the same direction, 0 means they are
     * completely different.
     * 
     * @param embedding1 - The first set of numbers and its details.
     * @param embedding2 - The second set of numbers and its details.
     * @returns A number between 0 and 1 indicating how similar the two sets of numbers are. If the
     * two sets of numbers are exactly the same, the cosine similarity will be 1. If they are completely
     * different, the cosine similarity will be 0. If one of the embeddings is all zeros, the cosine similarity
     * will be 0 -- this is because the cosine similarity is undefined when the norm of one of the embeddings is 0.
     * @throws ParameterValidationError if the sets of numbers are not the same length.
     */
    cosineSimilarity(embedding1: EmbedResponse, embedding2: EmbedResponse): number {
        if (embedding1.embedding.length !== embedding2.embedding.length) {
            throw new ParameterValidationError('Embeddings must be of the same length to calculate cosine similarity');
        }

        if (embedding1.model !== embedding2.model || embedding1.provider !== embedding2.provider) {
            // log a warnign if the embeddings are from different models or providers
            Embed.logger.warn('Calculating cosine similarity between embeddings from different models or providers may not be meaningful. We hope you know what you are doing.');
        }

        return Embed.cosinesim(embedding1.embedding, embedding2.embedding);
    }

    private static cosinesim(A: number[], B: number[]): number {
        let dotproduct = 0;
        let mA = 0;
        let mB = 0;

        for (let i = 0; i < A.length; i++) {
            dotproduct += A[i] * B[i];
            mA += A[i] * A[i];
            mB += B[i] * B[i];
        }

        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        const normProduct = mA * mB;

        /**
         * If the normProduct is 0, then the cosine similarity is 0.
         * This could happen if one of the embeddings is all zeros.
         */
        if (normProduct === 0) {
            return 0;
        }
        const similarity = dotproduct / normProduct;

        return similarity;
    }


    private validatedRequest(args: any[]): EmbedRequest {
        if (args.length !== 1) {
            throw new ParameterValidationError("Embed function requires exactly one argument. Instead, got " + args.length + " arguments.");
        }

        let request: EmbedRequest;
        if (typeof args[0] === "string") {
            request = { text: args[0] };
        } else {
            request = args[0];
        }

        return request;
    }
}