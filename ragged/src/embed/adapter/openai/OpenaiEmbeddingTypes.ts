export type OpenaiEmbeddingObject = {
    object: string;
    index: number;
    embedding: number[];
};

export type OpenaiEmbeddingResponse = {
    object: string;
    data: OpenaiEmbeddingObject[];
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
};
