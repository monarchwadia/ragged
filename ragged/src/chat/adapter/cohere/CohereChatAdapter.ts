import { ApiClient } from "../../../support/ApiClient";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../index.types";
import { CohereChatMapper } from "./CohereChatMapper";

export type CohereChatAdapterConfig = {
    apiKey?: string;
    model?: string;
}
export class CohereChatAdapter implements BaseChatAdapter {
    constructor(private apiClient: ApiClient, private config: CohereChatAdapterConfig) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        if (request.tools) {
            throw new Error("Not implemented. Currently, Ragged does not support tools in Cohere requests.");
        }
        const cohereRequest = CohereChatMapper.mapChatRequestToCohereRequest(request);

        const response = await this.apiClient.post('https://api.cohere.com/v1/chat', {
            body: cohereRequest,
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'Authorization': `bearer ${this.config.apiKey}`
            }
        });

        return CohereChatMapper.mapCohereResponseToChatResponse(response);
    }
}