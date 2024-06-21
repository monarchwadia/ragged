/**
 * Request to get an embedding for a given text
 */
export type EmbeddingRequest = {
    /**
     * Text to get an embedding for
     */
    text: string;
    /**
     * Model to use for the embedding
     */
    model?: string;
}

/**
 * Response to get an embedding for a given text
 */
export type EmbeddingResponse = {
    /**
     * The provider of the embedding. For example, OpenAI or Cohere.
     */
    provider: string;
    /**
     * The model used to generate the embedding
     */
    model: string;
    /**
     * The embedding for the text. This is a multidimensional array of numbers.
     */
    embedding: number[];
}

export interface BaseEmbeddingAdapter {
    embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
}
