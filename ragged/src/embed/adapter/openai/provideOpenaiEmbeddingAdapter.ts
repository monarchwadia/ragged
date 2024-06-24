import { ApiClient } from "../../../support/ApiClient.js";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter.js";

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