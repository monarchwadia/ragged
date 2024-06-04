import { Logger } from "../support/logger/Logger";
import { Tool } from "../tools";
import { BotMessage, Message, ToolRequest, ToolResponse } from "./index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

export class Chat {
    public logger = new Logger("Chat");

    private _history: Message[] = [];
    private _isRecording: boolean = true;
    private _autoToolReply: boolean = true;

    constructor(private adapter: BaseChatAdapter) { }

    async chat(userMessage: string, history: Message[] = [], tools?: Tool[]): Promise<Message[]> {
        let workingHistory = [...this.history, ...history];

        const userMessageObj: Message = {
            type: "user",
            text: userMessage
        }

        workingHistory.push(userMessageObj);

        const request: ChatRequest = { history: Chat.cloneMessages(workingHistory) };
        if (tools && tools.length) {
            request.tools = [...tools];
        }

        this.logger.debug("Chat request: ", JSON.stringify(request));
        let response: ChatResponse = { history: [] }; // will be replaced soon
        try {
            response = await this.adapter.chat(request);
        } catch (e: unknown) {
            this.logger.error("Failed to chat", e);

            if (e instanceof Error) {
                response = { history: [{ type: "error", text: e.message }] };
            } else {
                response = { history: [{ type: "error", text: "An unknown error occurred" }] };
            }
        }

        workingHistory = Chat.cloneMessages([...workingHistory, ...response.history]);

        if (this.isRecording) {
            this.logger.debug("Recorded Response: ", JSON.stringify(workingHistory));
            this.history = workingHistory;
        }

        // Automatic tool calling
        if (request.tools?.length) {
            // we have to do all the tool calls now.
            // we log all the requests and responses to this map, whose key is the toolCall ID
            // then we do all the handling of the tool calls.
            const toolCallMap: Record<string, {
                message: BotMessage,
                request: ToolRequest | null,
                response: ToolResponse | null
            }> = {};

            for (let mi = 0; mi < workingHistory.length; mi++) {
                const message = workingHistory[mi];

                if (!message) {
                    this.logger.warn("Detected undefined message at history index: ", mi, "workingHistory looks like: ", JSON.stringify(workingHistory));
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
                        this.logger.warn("Detected undefined tool call at message index: ", mi);
                        continue;
                    }

                    // check if tool call respons with this matching id exists in array
                    // TODO: Move away from meta.id and use a more robust way to identify tool calls
                    this.logger.warn("Reminder: We are still using meta.toolRequestId to identify tool calls. We need to set unique IDs instead.");
                    if (!toolCall.meta.toolRequestId) {
                        this.logger.warn("Detected undefined meta.toolRequestId at message index: ", mi, "workingHistory: ", JSON.stringify(workingHistory));
                        continue;
                    }

                    const toolCallId = toolCall.meta.toolRequestId;
                    toolCallMap[toolCallId] = toolCallMap[toolCallId] || {
                        message: message,
                        request: null,
                        response: null
                    };
                    switch (toolCall.type) {
                        case "tool.request":
                            toolCallMap[toolCallId].request = toolCall;
                            break;
                        case "tool.response":
                            toolCallMap[toolCallId].response = toolCall;
                            break;
                        default:
                            this.logger.warn("Detected unknown tool call type at message index: ", mi);
                            break;
                    }
                }
            }

            // now we have all the tool calls in the toolCallMap
            // we can now handle them

            for (const toolCallId in toolCallMap) {
                const toolCall = toolCallMap[toolCallId];

                if (toolCall.response && !toolCall.request) {
                    this.logger.warn("Detected tool response without request. This should never happen. Tool call ID: ", toolCallId);
                }

                if (toolCall.request && toolCall.response) {
                    continue;
                }

                this.logger.debug("Detected unhandled tool call with ID: ", toolCallId, ", performing tool call now.");

                // find the tool that was called
                const tool = request.tools.find(tool => tool.id === toolCall.request?.toolName);

                if (!tool) {
                    this.logger.warn("Detected tool call for non-existent tool. Tool call ID: ", toolCallId);
                    continue;
                }

                // now we have the tool, we can call it
                try {
                    let toolResponse = tool.handler(toolCall.request?.props);
                    if (toolResponse instanceof Promise) {
                        // TODO: parallel calls
                        toolResponse = await toolResponse;
                    }
                    toolCallMap[toolCallId].response = {
                        type: "tool.response",
                        meta: { id: toolCallId },
                        data: toolResponse,
                        toolName: tool.id
                    };
                } catch (e) {
                    this.logger.error("An error occurred while calling the tool: ", e);
                    // TODO: configurable retries
                    toolCallMap[toolCallId].response = {
                        type: "tool.response",
                        meta: { id: toolCallId },
                        data: "An error occurred while calling the tool.",
                        toolName: tool.id
                    };
                }
            }

            // // now we add the tool response message to the history
            // workingHistory.push(toolResponseMessage);
            for (const toolCallId in toolCallMap) {
                const { message, response, request } = toolCallMap[toolCallId];

                if (!message.toolCalls) {
                    this.logger.error("Detected tool response without tool call in message. This should never happen. Undefined behaviour may occur. Tool call ID: ", toolCallId);
                    continue;
                }

                if (request && response) {
                    message.toolCalls.push(response);
                }
            }

        }

        // TODO: auto tool calling
        if (this.isRecording) {
            this.logger.debug("Recorded Response: ", JSON.stringify(workingHistory));
            this.history = workingHistory;
        }

        return Chat.cloneMessages(workingHistory);
    }

    public record(record: boolean) {
        this._isRecording = record;
    }

    get isRecording() {
        return this._isRecording;
    }

    set history(history: Message[]) {
        this._history = Chat.cloneMessages(history);
    }

    get history() {
        return Chat.cloneMessages(this._history)
    }

    static with(provider: "openai", config: Partial<OpenAiChatDriverConfig> = {}) {
        // TODO: Add more providers
        const adapter = provideOpenAiChatAdapter({ config })
        return new Chat(adapter);
    }

    private static cloneMessages(messages: Message[]): Message[] {
        return messages.map(Chat.cloneMessage);
    }

    private static cloneMessage(message: Message): Message {
        return { ...message };
    }
}