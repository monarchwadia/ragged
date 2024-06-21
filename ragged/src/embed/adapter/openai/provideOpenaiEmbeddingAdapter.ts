import { ApiClient } from "../../../support/ApiClient";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter";

export type OpenaiEmbeddingAdapterProviderParam = {
    apiClient?: ApiClient;
    apiKey?: string;
}

export const provideOpenaiEmbeddingAdapter = (params: OpenaiEmbeddingAdapterProviderParam): OpenaiEmbeddingAdapter => {
    const apiClient = params.apiClient || new ApiClient();

    const adapter = new OpenaiEmbeddingAdapter({
        apiClient,
        apiKey: params.apiKey || ""
    });

    return adapter;
}