import { MappingError } from "../../../../support/CustomErrors";
import { MessageType } from "../../../index.types";
import { OaiTool, OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "../driver/OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../../index.types";
import { Logger } from "../../../../support/logger/Logger";
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
                case "bot":
                    messages.push({
                        role: "assistant",
                        content: message.text
                    });
                    break
                case "system":
                    messages.push({
                        role: "system",
                        content: message.text
                    });
                    break
                case "tool.request":
                    // TODO: see if this is actually a nested property of a bot message
                    messages.push({
                        role: "tool",
                        content: "TODO"
                    });
                    break
                case "tool.response":
                    // TODO: see if this is actually a nested property of a bot message
                    messages.push({
                        role: "tool",
                        content: "TODO"
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
            for (let i = 0; i < request.tools.length; i++) {
                const tool = request.tools[i];

                tools.push(OpenAiToolMapper.mapToOpenAi(tool));
            }
        }

        return {
            model: "gpt-3.5-turbo",
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

        if (response.choices.length > 1) {
            logger.warn(`Received more than one choice from OpenAI. This is not currently supported. Only the first choice will be included in history.`);
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
                case "assistant":
                    history.push({
                        type: "bot",
                        text: choice.message.content
                    });
                    break
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