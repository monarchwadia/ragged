
export type OllamaChatAdapterConfig = {
    apiKey?: string;
    model: string;
    format?: string;
    options?: Record<string, any>;
    keep_alive?: string;
    endpoint?: string;
};
