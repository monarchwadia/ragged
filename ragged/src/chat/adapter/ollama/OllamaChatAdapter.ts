import { ApiClient } from "../../../support/ApiClient";
import { NotImplementedError } from "../../../support/RaggedErrors";
import { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { OllamaChatAdapterConfig } from "./OllamaChatAdapterTypes";
import { OllamaChatMapper } from "./OllamaChatMapper";

export class OllamaChatAdapter implements BaseChatAdapter {
  constructor(private apiClient: ApiClient, private config: OllamaChatAdapterConfig) { }

  async chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse> {
    if (request.tools) {
      throw new NotImplementedError("Not implemented. Currently, Ragged does not support tools in Ollama requests.");
    }
    const ollamaRequest = OllamaChatMapper.mapChatRequestToOllamaRequest(request, this.config);
    const response = await this.apiClient.post(this.config.endpoint ?? 'http://localhost:11434/api/chat', {
      body: ollamaRequest,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });
    return OllamaChatMapper.mapOllamaResponseToChatResponse(response);
  }
}
