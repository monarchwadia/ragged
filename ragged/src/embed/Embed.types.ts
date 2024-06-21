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
export type Embedding = {
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

/**
 * Creates an embedding for the given text using a specific provider.
 * 
 * This function takes some text and sends it to an API to get an embedding.
 * An embedding is like a special set of numbers that represents the text in a way
 * that computers can understand and work with. These numbers can be used for things
 * like finding similar texts, grouping texts, and more.
 * 
 * @param request - An object with the text you want to embed and optional information about the model to use.
 * @returns A promise that gives back an object with the model, provider, and the embedding data (the special numbers).
 * @throws Error if the API request fails.
 */
export interface BaseEmbeddingAdapter {
    embed(request: EmbeddingRequest): Promise<Embedding>;
}
