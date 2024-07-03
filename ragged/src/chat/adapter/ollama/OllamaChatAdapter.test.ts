import { ApiClient } from "../../../support/ApiClient";
import { OllamaChatAdapter } from "./OllamaChatAdapter";
import { mockDeep } from "jest-mock-extended"

describe("OllamaChatAdapter", () => {
    it("uses the regular endpoint if no endpoint is provided in the config", () => {
        // Arrange
        const config = {
            model: "model"
        };
        const apiClient = mockDeep<ApiClient>();
        apiClient.post.mockResolvedValue({
            message: {
                content: "Hello"
            }
        });
        const adapter = new OllamaChatAdapter(apiClient, config);
        adapter.chat({
            history: [{
                type: "user",
                text: "Hello"
            }]
        });

        expect(apiClient.post).toHaveBeenCalledWith("http://localhost:11434/api/chat", expect.anything());
    });

    it("uses the endpoint from the config if provided", () => {
        // Arrange
        const endpoint = "https://example.com";
        const config = {
            model: "model",
            endpoint
        };
        const apiClient = mockDeep<ApiClient>();
        apiClient.post.mockResolvedValue({
            message: {
                content: "Hello"
            }
        });
        const adapter = new OllamaChatAdapter(apiClient, config);
        adapter.chat({
            history: [{
                type: "user",
                text: "Hello"
            }]
        });

        expect(apiClient.post).toHaveBeenCalledWith(endpoint, expect.anything());
    });
});