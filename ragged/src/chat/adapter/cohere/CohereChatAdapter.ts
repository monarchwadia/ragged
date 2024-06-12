import { ApiClient } from "../../../support/ApiClient";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../index.types";
import { CohereChatMapper } from "./CohereChatMapper";

export type CohereChatAdapterConfig = {
    apiKey?: string;
    model?: string;
}
export class CohereChatAdapter implements BaseChatAdapter {
    constructor(private apiClient: ApiClient, private config: CohereChatAdapterConfig) { }

    chat(request: ChatRequest): Promise<ChatResponse> {
        throw new Error("Method not implemented.");
        const cohereRequest = CohereChatMapper.mapChatRequestToCohereRequest(request);

        // const response = this.apiClient.post('https://api.cohere.ai/v1/complete', {
        //     body: 
        // });

    }
}