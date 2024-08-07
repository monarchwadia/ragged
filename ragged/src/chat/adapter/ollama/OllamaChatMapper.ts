import { MappingError } from "../../../support/RaggedErrors";
import { Logger } from "../../../support/logger/Logger";
import { Message } from "../../Chat.types";
import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { OllamaChatItem, OllamaChatRequestRoot } from "./OllamaApiRequestTypes";
import { OllamaChatResponseRoot } from "./OllamaApiResponseTypes";
import { OllamaChatAdapterConfig } from "./OllamaChatAdapterTypes";

const roleMapOllamaRagged: Record<OllamaChatItem['role'], Message['type']> = {
  "assistant": "bot",
  "system": "system",
  "user": "user"
}

const roleMapRaggedOllama: Record<Message['type'], OllamaChatItem['role']> = {
  "bot": "assistant",
  "system": "system",
  "user": "user",
  'error': "assistant"
}

export class OllamaChatMapper {
  static logger: Logger = new Logger("OllamaChatMapper");

  static mapChatRequestToOllamaRequest(request: ChatAdapterRequest, config: OllamaChatAdapterConfig): OllamaChatRequestRoot {
    if (!config.model) {
      throw new MappingError("Model name is required for Ollama requests.");
    }

    const messages: OllamaChatItem[] = request.history.map(item => ({
      role: roleMapRaggedOllama[item.type],
      content: item.text || ""
    }));

    if (messages.length === 0) {
      throw new MappingError("No messages provided in request. Ollama needs at least one message to start a conversation.");
    }

    return {
      model: config.model,
      messages,
      stream: false,
      format: config.format,
      options: config.options,
      keep_alive: config.keep_alive
    };
  }

  static mapOllamaResponseToChatResponse(response: OllamaChatResponseRoot): Message[] {
    if (!response.message.content) {
      OllamaChatMapper.logger.warn("No 'content' field was received in response from Ollama. This is unexpected, and may indicate an error in Ragged's logic.");
    }

    return [
      {
        type: roleMapOllamaRagged[response.message.role],
        text: response.message.content
      }
    ]
  }
}
