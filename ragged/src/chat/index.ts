import { UnknownError } from "../support/CustomErrors";
import { Logger } from "../support/logger/Logger";
import { Tool } from "../tools";
import { BotMessage, Message, ToolRequest, ToolResponse } from "./index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

type ToolCallMap = Record<string, {
    message: BotMessage,
    request: ToolRequest | null,
    response: ToolResponse | null
}>;

export class Chat {
    private static logger = new Logger("Chat");

    private _history: Message[] = [];
    private _isRecording: boolean = true;
    private _autoToolReply: boolean = true;

    /**
     * Maximum number of iterations to run the chat loop. This only applies in the case of tool calls.
     * The chat loop will run until all tool calls are resolved or this limit is reached.
     * Default: 3
     */
    public maxIterations = 3;

    constructor(private adapter: BaseChatAdapter) { }

    // TODO: Need to put tools, model inside options object.. consider also doing cascading options overrides
    async chat(userMessage: string, history: Message[] = [], tools?: Tool[], model?: string): Promise<Message[]> {
        let workingHistory = [...this.history, ...history];

        const userMessageObj: Message = {
            type: "user",
            text: userMessage
        }

        workingHistory.push(userMessageObj);

        // ======= start of loop =======

        let numIterations = 0;
        let shouldIterate = true;
        WORK_LOOP: while (shouldIterate && numIterations < this.maxIterations) {
            numIterations++;
            shouldIterate = false;

            Chat.logger.debug("Iteration: ", numIterations);

            let toolCallsWereResolved = false;

            const request: ChatRequest = { history: Chat.cloneMessages(workingHistory) };
            if (tools && tools.length) {
                request.tools = [...tools];
            }
            if (model) {
                request.model = model;
            }

            Chat.logger.debug("Chat request: ", JSON.stringify(request));
            let response: ChatResponse = { history: [] }; // will be replaced soon
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

            workingHistory = Chat.cloneMessages([...workingHistory, ...response.history]);

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

    private async processToolCallMap(toolCallMap: ToolCallMap, request: ChatRequest): Promise<{ toolCallsWereResolved: boolean }> {
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
}