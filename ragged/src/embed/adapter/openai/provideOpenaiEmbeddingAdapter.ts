import { ApiClient } from "../../../support/ApiClient";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter";

export type OpenaiEmbeddingAdapterProviderParam = {
    apiKey?: string;
}

export const provideOpenaiEmbeddingAdapter = (params: OpenaiEmbeddingAdapterProviderParam): OpenaiEmbeddingAdapter => {
    const adapter = new OpenaiEmbeddingAdapter({
        apiKey: params.apiKey || ""
    });

    return adapter;
}