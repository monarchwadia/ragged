import { ParameterValidationError, UnknownError } from "../support/RaggedErrors";
import { Logger } from "../support/logger/Logger";
import { BotMessage, ChatConfig, Message, ToolRequest, ToolResponse } from "./Chat.types";
import { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "./adapter/BaseChatAdapter.types";
import { provideOpenAiChatAdapter } from "./adapter/openai/provideOpenAiChatAdapter";
import { provideCohereChatAdapter } from "./adapter/cohere/provideCohereChatAdapter";
import { CohereChatAdapterConfig } from "./adapter/cohere/CohereChatAdapter";
import { OpenAiChatAdapterConfig } from "./adapter/openai/OpenAiChatAdapter";
import { OpenaiAssistantsChatAdapterConfig } from "./adapter/openai-assistants/adapter/OaiaChatAdapter";
import { provideOpenaiAssistantsChatAdapter } from "./adapter/openai-assistants/provideOpenaiAssistantsChatAdapter";
import { AzureOpenAiChatAdapterConfig } from "./adapter/azure-openai/AzureOpenAiChatAdapter";
import { provideAzureOpenAiChatAdapter } from "./adapter/azure-openai/provideAzureOpenaiChatAdapter";
import { provideAzureOpenaiAssistantsChatAdapter } from "./adapter/azure-openai-assistants/provideAzureOpenaiAssistantsChatAdapter";
import { AzureOaiaDaoCommonConfig } from "./adapter/azure-openai-assistants/Dao.types";

type ToolCallMap = Record<string, {
    message: BotMessage,
    request: ToolRequest | null,
    response: ToolResponse | null
}>;

export class Chat {
    private static logger = new Logger("Chat");

    public history: Message[] = [];
    private _isRecording: boolean = true;
    private _autoToolReply: boolean = true;

    /**
     * Maximum number of iterations to run the chat loop. This only applies in the case of tool calls.
     * The chat loop will run until all tool calls are resolved or this limit is reached.
     * Default: 3
     */
    public maxIterations = 3;

    /**
     * Whether to save the chat history or not.
     * 
     * @param record 
     */
    public record(record: boolean) {
        this._isRecording = record;
    }

    /**
     * Whether it is recording or not.
     */
    get isRecording() {
        return this._isRecording;
    }

    static with(provider: "openai-assistants", config: OpenaiAssistantsChatAdapterConfig): Chat;
    static with(provider: "openai", config: OpenAiChatAdapterConfig): Chat;
    static with(provider: "cohere", config: CohereChatAdapterConfig): Chat;
    static with(provider: "azure-openai", config: AzureOpenAiChatAdapterConfig): Chat;
    static with(provider: "azure-openai-assistants", config: AzureOaiaDaoCommonConfig): Chat;
    static with(provider: string, config: any = {}) {
        let adapter: BaseChatAdapter;

        switch (provider) {
            case "openai":
                adapter = provideOpenAiChatAdapter({ config });
                break;
            case "cohere":
                adapter = provideCohereChatAdapter({ config });
                break;
            case "openai-assistants":
                adapter = provideOpenaiAssistantsChatAdapter({ config });
                break;
            case "azure-openai":
                adapter = provideAzureOpenAiChatAdapter({ config });
                break;
            case "azure-openai-assistants":
                adapter = provideAzureOpenaiAssistantsChatAdapter({ config });
                break;
            default:
                throw new ParameterValidationError("Invalid provider. Please check the documentation or your editor's code autocomplete for more information on how to use Chat.with().");
        }

        return new Chat(adapter);
    }

    constructor(private adapter: BaseChatAdapter) { }

    // TODO: Need to put tools, model inside options object.. consider also doing cascading options overrides
    async chat(): Promise<Message[]>;
    async chat(config: ChatConfig): Promise<Message[]>;
    async chat(userMessage: string): Promise<Message[]>;
    async chat(userMessage: string, config: ChatConfig): Promise<Message[]>;
    async chat(messages: Message[]): Promise<Message[]>;
    async chat(messages: Message[], config: ChatConfig): Promise<Message[]>;
    async chat(...args: any[]): Promise<Message[]> {
        const initializedChatState = this.validatedChatParams(...args);
        let { workingHistory } = initializedChatState;
        const { config } = initializedChatState;
        const { tools, model } = config;

        // ======= start of loop =======

        let numIterations = 0;
        let shouldIterate = true;
        WORK_LOOP: while (shouldIterate && numIterations < this.maxIterations) {
            numIterations++;
            shouldIterate = false;

            Chat.logger.debug("Iteration: ", numIterations);

            let toolCallsWereResolved = false;

            const request: ChatAdapterRequest = { history: workingHistory };
            if (tools && tools.length) {
                request.tools = [...tools];
            }

            if (model) {
                request.model = model;
            }

            const response: ChatAdapterResponse = await this.performChatRequest(request);

            workingHistory = [...workingHistory, ...response.history];

            if (this.isRecording) {
                Chat.logger.debug("Recorded Response: ", JSON.stringify(workingHistory));
                this.history = workingHistory;
            }

            if (request.tools?.length) {
                const toolCallMap = Chat.getToolCallMap(workingHistory);

                // now we have all the tool calls in the toolCallMap
                // we can now handle them

                try {
                    const { toolCallsWereResolved: wereResolved } = await this.processToolCallMap(toolCallMap, request);
                    toolCallsWereResolved = wereResolved;
                } catch (e) {
                    throw new UnknownError("An error occurred while processing tool calls.", e);
                }
            }

            // TODO: auto tool calling
            if (this.isRecording) {
                Chat.logger.debug("Recorded Response: ", JSON.stringify(workingHistory));
                this.history = workingHistory;
            }

            if (this._autoToolReply && toolCallsWereResolved) {
                shouldIterate = true;
                continue WORK_LOOP;
            }
        }

        return workingHistory;
    }

    private async performChatRequest(request: ChatAdapterRequest) {
        Chat.logger.debug("Chat request: ", JSON.stringify(request));
        let response: ChatAdapterResponse = { history: [] }; // will be replaced soon
        try {
            response = await this.adapter.chat(request);
        } catch (e: unknown) {
            Chat.logger.error("Failed to chat", e);

            if (e instanceof Error) {
                response = { history: [{ type: "error", text: e.message }] };
            } else {
                response = { history: [{ type: "error", text: "An unknown error occurred" }] };
            }
        }
        return response;
    }

    private static getToolCallMap(workingHistory: Message[]): ToolCallMap {

        // we have to do all the tool calls now.
        // we log all the requests and responses to this map, whose key is the toolCall ID
        // then we do all the handling of the tool calls.
        const toolCallMap: ToolCallMap = {};

        for (let mi = 0; mi < workingHistory.length; mi++) {
            const message = workingHistory[mi];

            if (!message) {
                Chat.logger.warn("Detected undefined message at history index: ", mi, "workingHistory looks like: ", JSON.stringify(workingHistory));
                continue;
            }

            if (message.type !== "bot") {
                continue;
            }

            if (!message.toolCalls) {
                continue;
            }

            // iterate over all toolCalls in message and check if they have been responded to
            for (let ti = 0; ti < message.toolCalls.length; ti++) {
                const toolCall: (ToolResponse | ToolRequest) = message.toolCalls[ti];

                if (!toolCall) {
                    Chat.logger.warn("Detected undefined tool call at message index: ", mi);
                    continue;
                }

                // check if tool call respons with this matching id exists in array
                // TODO: Move away from meta.id and use a more robust way to identify tool calls
                Chat.logger.debug("Reminder: We are still using meta.toolRequestId to identify tool calls. We need to set unique IDs instead.");
                if (!toolCall.meta.toolRequestId) {
                    Chat.logger.warn("Detected undefined meta.toolRequestId at message index: ", mi, "workingHistory: ", JSON.stringify(workingHistory));
                    continue;
                }

                const toolRequestId = toolCall.meta.toolRequestId;
                toolCallMap[toolRequestId] = toolCallMap[toolRequestId] || {
                    message: message,
                    request: null,
                    response: null
                };
                switch (toolCall.type) {
                    case "tool.request":
                        toolCallMap[toolRequestId].request = toolCall;
                        break;
                    case "tool.response":
                        toolCallMap[toolRequestId].response = toolCall;
                        break;
                    default:
                        Chat.logger.warn("Detected unknown tool call type at message index: ", mi);
                        break;
                }
            }
        }

        return toolCallMap
    }

    private async processToolCallMap(toolCallMap: ToolCallMap, request: ChatAdapterRequest): Promise<{ toolCallsWereResolved: boolean }> {
        let toolCallsWereResolved = false;

        if (!request.tools) {
            Chat.logger.warn("Detected tool calls without tools in request. This should never happen. Request: ", JSON.stringify(request));
            return { toolCallsWereResolved };
        }

        for (const toolRequestId in toolCallMap) {
            const {
                request: mapRequest,
                response: mapResponse
            } = toolCallMap[toolRequestId];

            if (mapResponse && !mapRequest) {
                Chat.logger.warn("Detected tool response without request. This should never happen. Tool call ID: ", toolRequestId);
            }

            if (mapRequest && mapResponse) {
                continue;
            }

            // if we are here, it means that the tool call exists and was not responded to

            Chat.logger.debug("Detected unhandled tool call with ID: ", toolRequestId, ", performing tool call now.");

            // find the tool that was called
            const tool = request.tools.find(tool => tool.id === mapRequest?.toolName);

            if (!tool) {
                Chat.logger.warn("Detected tool call for non-existent tool. Tool call ID: ", toolRequestId);
                const toolName = mapRequest?.toolName;
                toolCallMap[toolRequestId].message.toolCalls?.push({
                    type: "tool.response",
                    meta: { toolRequestId },
                    data: toolName
                        ? "Tool with name " + toolName + " does not exist."
                        : "Tool name not provided.",
                    toolName: toolName || "unknown"
                });
                toolCallsWereResolved = true;
                continue;
            }

            // now we have the tool, we can call it
            try {
                let toolResponse = tool.handler(mapRequest?.props);
                if (toolResponse instanceof Promise) {
                    // TODO: parallel calls
                    toolResponse = await toolResponse;
                }
                toolCallMap[toolRequestId].message.toolCalls?.push({
                    type: "tool.response",
                    meta: { toolRequestId },
                    data: toolResponse,
                    toolName: tool.id
                });
                toolCallsWereResolved = true;
            } catch (e) {
                Chat.logger.error("An error occurred while calling the tool: ", e);
                // TODO: configurable retries
                toolCallMap[toolRequestId].message.toolCalls?.push({
                    type: "tool.response",
                    meta: { toolRequestId },
                    data: "An error occurred while calling the tool.",
                    toolName: tool.id
                });
                toolCallsWereResolved = true;
            }
        }

        // for (const toolRequestId in toolCallMap) {
        //     const { message: mapMessage, response: mapResponse, request: mapRequest } = toolCallMap[toolRequestId];

        //     if (!mapMessage.toolCalls) {
        //         Chat.logger.error("Detected tool response without tool call in message. This should never happen. Undefined behaviour may occur. Tool call ID: ", toolRequestId);
        //         continue;
        //     }


        // }

        return { toolCallsWereResolved };
    }


    private validatedChatParams(...args: any[]): { workingHistory: Message[], config: ChatConfig } {
        let config: ChatConfig = {
            tools: [],
            // TODO: Make this configurable 
            model: undefined
        };

        let incomingMessages: Message[] = [];
        if (args.length === 0) {
            // async chat(): Promise<Message[]>;
            // Note: No-op, this is an experimental feature for continuing agentic chat
        } else if (!Array.isArray(args[0]) && typeof args[0] === "object") {
            // async chat(config: ChatConfig): Promise<Message[]>;
            config = { ...config, ...args[0] };
        } else if (typeof args[0] === "string") {
            // async chat(userMessage: string): Promise<Message[]>;
            // OR
            // async chat(userMessage: string, config: ChatConfig): Promise<Message[]>;
            incomingMessages.push({ type: "user", text: args[0] });
            config = { ...(config || {}), ...args[1] };
        } else if (Array.isArray(args[0])) {
            // async chat(messages: Message[]): Promise<Message[]>;
            // OR
            // async chat(messages: Message[], config: ChatConfig): Promise<Message[]>;
            incomingMessages = args[0];
            config = config = { ...(config || {}), ...args[1] };
        } else {
            throw new ParameterValidationError("Invalid arguments passed to Ragged.chat(). Please check the documentation or your editor's code autocomplete for more information on how to use Ragged.chat().");
        }

        const workingHistory = [...this.history, ...incomingMessages];

        return {
            workingHistory,
            config
        }
    }
}