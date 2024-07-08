import { ApiClient } from "../../../support/ApiClient";
import { NotImplementedError } from "../../../support/RaggedErrors";
import { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { CohereChatMapper } from "./CohereChatMapper";

export type CohereChatAdapterConfig = {
    apiKey?: string;
    model?: string;
}
export class CohereChatAdapter implements BaseChatAdapter {
    constructor(private apiClient: ApiClient, private config: CohereChatAdapterConfig) { }

    async chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse> {
        if (request.tools) {
            throw new NotImplementedError("Not implemented. Currently, Ragged does not support tools in Cohere requests.");
        }
        const cohereRequest = CohereChatMapper.mapChatRequestToCohereRequest(request.history);

        const apiResponse = await this.apiClient.post('https://api.cohere.com/v1/chat', {
            body: cohereRequest,
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'Authorization': `bearer ${this.config.apiKey}`
            }
        });

        const history = CohereChatMapper.mapCohereResponseToChatResponse(apiResponse.json);

        return {
            history,
            raw: apiResponse.raw
        }
    }
}