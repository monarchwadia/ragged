// =================== CHAT ===================
export { Chat } from './chat/Chat';

// =================== CHAT TYPES ===================
import {
    BotMessage,
    SystemMessage,
    UserMessage,
    ErrorMessage,
    ChatConfig,
    Message,
    MessageType,
    ToolRequest,
    ToolResponse,
} from './chat/Chat.types';

/**
 * Basic Ragged types for Chat.
 */
export type ChatTypes = {
    BotMessage: BotMessage,
    ChatConfig: ChatConfig,
    ErrorMessage: ErrorMessage,
    Message: Message,
    MessageType: MessageType,
    SystemMessage: SystemMessage,
    ToolRequest: ToolRequest,
    ToolResponse: ToolResponse,
    UserMessage: UserMessage,
    Tool: Tool,
    ToolProp: ToolProp,
    ToolInputValidator: ToolInputValidator
}

// =================== CHAT ADAPTER ===================

import { CohereChatAdapter } from "./chat/adapter/cohere/CohereChatAdapter"
import { provideCohereChatAdapter } from './chat/adapter/cohere/provideCohereChatAdapter';
import { OpenAiChatAdapter } from './chat/adapter/openai/OpenAiChatAdapter';
import { provideOpenAiChatAdapter } from './chat/adapter/openai/provideOpenAiChatAdapter';

export const ChatAdapters = {
    Cohere: {
        CohereChatAdapter,
        provideCohereChatAdapter
    },
    OpenAi: {
        OpenAiChatAdapter,
        provideOpenAiChatAdapter
    },
    OpenAiAssistants: {
        OpenAiChatAdapter,
        provideOpenAiChatAdapter
    }
}

// =================== CHAT ADAPTER TYPES ===================

import { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from './chat/adapter/BaseChatAdapter.types';

/**
 * Types for Chat Adapters, mainly used for implementing custom adapters.
 */
export type ChatAdapterTypes = {
    BaseChatAdapter: BaseChatAdapter,
    ChatAdapterRequest: ChatAdapterRequest,
    ChatAdapterResponse: ChatAdapterResponse,
}

// =================== EMBED ===================

export { Embed } from './embed/Embed';

// =================== EMBED TYPES ===================

import { BaseEmbedAdapter, EmbedResponse, EmbedRequest } from './embed/Embed.types';

export type EmbedTypes = {
    EmbedRequest: EmbedRequest,
    EmbedResponse: EmbedResponse,
}

// =================== EMBED ADAPTER ===================

export type EmbedAdapterTypes = {
    BaseEmbedAdapter: BaseEmbedAdapter
}

// =================== GENERAL ===================

import { ApiClient } from "./support/ApiClient";
import * as RaggedErrors from "./support/RaggedErrors"
import { ApiJsonHandler } from "./support/ApiJsonHandler";
import { Tool, ToolInputValidator, ToolProp } from './tools/Tools.types';

export { ApiClient, ApiJsonHandler, RaggedErrors }