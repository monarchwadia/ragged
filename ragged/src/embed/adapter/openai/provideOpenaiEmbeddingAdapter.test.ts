import { ApiClient } from "../../../support/ApiClient";
import { provideOpenaiEmbeddingAdapter } from "./provideOpenaiEmbeddingAdapter"

describe("provideOpenaiEmbeddingAdapter", () => {
    it("should provide an instance of OpenaiEmbeddingAdapter", () => {
        // Arrange
        const apiKey = "some-api";
        const apiClient = new ApiClient();
        const adapter = provideOpenaiEmbeddingAdapter({
            apiKey,
            apiClient
        });
        expect(adapter).toBeDefined();
    });
});