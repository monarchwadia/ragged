import { MappingError } from "../../../support/CustomErrors";
import { BotMessage } from "../../index.types";
import { ChoiceToolCall, OaiTool, OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody, OpenAiMessage, OpenAiToolMessage } from "./OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../index.types";
import { Logger } from "../../../support/logger/Logger";
import { OpenAiToolMapper } from "./ToolMapper";

const logger: Logger = new Logger("openai.adapter.mappers");

export const mapToOpenAi = (request: ChatRequest): OpenAiChatCompletionRequestBody => {
    try {
        const messages: OpenAiChatCompletionRequestBody["messages"] = [];

        // map messages
        for (let i = 0; i < request.history.length; i++) {
            const message = request.history[i];

            switch (message.type) {
                case "user":
                    messages.push({
                        role: "user",
                        content: message.text
                    });
                    break
                case "bot": {

                    const asstMessage: OpenAiMessage = {
                        role: "assistant",
                        content: message.text,
                    }


                    let toolResponses: OpenAiToolMessage[] = [];
                    const tool_calls: ChoiceToolCall[] = [];

                    if (message.toolCalls?.length) {

                        TOOL_CALLS_LOOP: for (let j = 0; j < message.toolCalls.length; j++) {
                            const toolCall = message.toolCalls[j];

                            switch (toolCall.type) {
                                case "tool.request":
                                    if (!toolCall.meta?.toolRequestId) {
                                        logger.warn(`Tool request is missing a toolRequestId. No tool calls for this message will get sent to OpenAI. Here is the faulty tool request object: `, toolCall);
                                        delete asstMessage.tool_calls;
                                        break TOOL_CALLS_LOOP;
                                    }

                                    tool_calls.push({
                                        id: toolCall.meta.toolRequestId,
                                        type: "function",
                                        function: {
                                            name: toolCall.toolName,
                                            arguments: toolCall.props
                                        }
                                    });
                                    break;
                                case "tool.response":
                                    if (!toolCall.meta?.toolRequestId) {
                                        logger.warn(`Tool response is missing a toolRequestId. No tool calls for this message will get sent to OpenAI. Here is the faulty tool response object: `, toolCall);
                                        delete asstMessage.tool_calls;
                                        toolResponses = [];
                                        break TOOL_CALLS_LOOP;
                                    }

                                    toolResponses.push({
                                        tool_call_id: toolCall.meta.toolRequestId,
                                        role: "tool",
                                        name: toolCall.toolName,
                                        content: toolCall.data
                                    });
                                    break;
                                default:
                                    logger.warn(`Unknown and unhandled tool call type: ${(toolCall as any)?.type}. This will not get sent to OpenAI. Here is the full tool call: `, toolCall);
                                    break;
                            }
                        }
                    }

                    if (tool_calls.length) {
                        asstMessage.tool_calls = tool_calls;
                    }
                    messages.push(asstMessage);
                    for (const toolMessage of toolResponses) {
                        messages.push(toolMessage);
                    }
                    break
                }
                case "system":
                    messages.push({
                        role: "system",
                        content: message.text
                    });
                    break
                case "error":
                    // NO-OP
                    break;
                default:
                    logger.warn(`Unknown and unhandled message type: ${(message as any)?.type}. This will not get sent to OpenAI. Here is the full message: `, message);
                    break;
            }
        }

        // map tools
        let tools: OpenAiChatCompletionRequestBody["tools"] = undefined;

        if (request.tools) {
            tools = [] as OaiTool[];
            for (let i = 0; i < request.tools?.length; i++) {
                const tool = request.tools[i];

                tools.push(OpenAiToolMapper.mapToOpenAi(tool));
            }
        }

        return {
            model: request.model || "gpt-3.5-turbo",
            messages,
            tools
        }
    } catch (e) {
        throw new MappingError("Failed to map ChatRequest to OpenAI request", e);
    }
}

export const mapFromOpenAi = (response: OpenAiChatCompletionResponseBody): ChatResponse => {
    try {
        const history: ChatResponse['history'] = [];

        if (!response.choices) {
            return {
                history
            }
        }

        if (response.choices?.length && response.choices?.length > 1) {
            logger.warn(`Received more than one choice from OpenAI. This is not currently supported. Only the first choice will be included in history.`);
            console.log(response.choices)
        }

        for (let i = 0; i < response.choices.length; i++) {
            // TODO: support more choices that just the first one
            const choice = response.choices[0];

            switch (choice.message.role) {
                case "user":
                    history.push({
                        type: "user",
                        text: choice.message.content
                    });
                    break
                case "assistant": {
                    const botMessage: BotMessage = {
                        type: "bot",
                        text: choice.message.content
                    }

                    if (choice.message.tool_calls?.length) {
                        botMessage.toolCalls = [];

                        for (let j = 0; j < choice.message.tool_calls.length; j++) {
                            const toolCall = choice.message.tool_calls[j];

                            botMessage.toolCalls.push({
                                type: "tool.request",
                                toolName: toolCall.function.name,
                                props: toolCall.function.arguments,
                                meta: {
                                    toolRequestId: toolCall.id
                                }
                            });
                        }
                    }

                    history.push(botMessage);
                    break
                }
                case "system":
                    history.push({
                        type: "system",
                        text: choice.message.content
                    });
                    break
                default:
                    logger.warn(`Received unknown and unhandled message role from OpenAI: ${choice.message.role}. This will not be included in history.`);
                    break;
            }
        }

        return {
            history
        }
    } catch (e) {
        throw new MappingError("Failed to map OpenAI response to ChatResponse", e);
    }
}