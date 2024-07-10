// =================== CHAT ===================
export { Chat } from './chat/Chat';
export { Embed } from './embed/Embed';

// =================== CHAT TYPES ===================
export type {
    BotMessage,
    SystemMessage,
    UserMessage,
    UserMessageAttachment,
    ErrorMessage,
    ChatConfig,
    Message,
    MessageType,
    ToolRequest,
    ToolResponse,
} from './chat/Chat.types';

export type {
    ArrayToolProp,
    BooleanToolProp,
    NumberToolProp,
    ObjectToolProp,
    StringToolProp,
    ToolProp,
    Tool,
    ToolInputValidator
} from './tools/Tools.types';

// =================== CHAT ADAPTER ===================

export { CohereChatAdapter } from "./chat/adapter/cohere/CohereChatAdapter"
export { provideCohereChatAdapter } from './chat/adapter/cohere/provideCohereChatAdapter';
export { OaiaChatAdapter } from './chat/adapter/openai-assistants/adapter/OaiaChatAdapter';
export { provideOpenaiAssistantsChatAdapter } from './chat/adapter/openai-assistants/provideOpenaiAssistantsChatAdapter';

export type { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from './chat/adapter/BaseChatAdapter.types';

export type { BaseEmbedAdapter, EmbedResponse, EmbedRequest } from './embed/Embed.types';

export { ApiClient } from "./support/ApiClient";
export { ApiJsonHandler } from "./support/ApiJsonHandler";
export { OpenAiChatAdapter } from './chat/adapter/openai/OpenAiChatAdapter';
export { provideOpenAiChatAdapter } from './chat/adapter/openai/provideOpenAiChatAdapter';
export { AzureOpenAiChatAdapter } from './chat/adapter/azure-openai/AzureOpenAiChatAdapter';
export { provideAzureOpenAiChatAdapter } from './chat/adapter/azure-openai/provideAzureOpenaiChatAdapter';
export { AzureOaiaChatAdapter } from './chat/adapter/azure-openai-assistants/adapter/AzureOaiaChatAdapter';
export { provideAzureOpenaiAssistantsChatAdapter } from './chat/adapter/azure-openai-assistants/provideAzureOpenaiAssistantsChatAdapter';
export { Logger } from './support/logger/Logger';
export { BaseRaggedError, FetchRequestFailedError, FetchResponseNotOkError, InstantiationError, JsonParseError, JsonStringifyError, MappingError, NotImplementedError, ParameterValidationError, RetryError, UnknownError } from "./support/RaggedErrors"
