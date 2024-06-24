import { ApiClient } from "../../../support/ApiClient.js";
import { NotImplementedError } from "../../../support/CustomErrors.js";
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "../BaseChatAdapter.types.js";
import { CohereChatMapper } from "./CohereChatMapper.js";

export type CohereChatAdapterConfig = {
    apiKey?: string;
    model?: string;
}
export class CohereChatAdapter implements BaseChatAdapter {
    constructor(private apiClient: ApiClient, private config: CohereChatAdapterConfig) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        if (request.tools) {
            throw new NotImplementedError("Not implemented. Currently, Ragged does not support tools in Cohere requests.");
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