import { MappingError } from "../../../../support/CustomErrors";
import { MessageType } from "../../../index.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "../driver/OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../../index.types";

export const mapToOpenAi = (request: ChatRequest): OpenAiChatCompletionRequestBody => {
    try {
        return {
            model: "gpt-3.5-turbo",
            messages: request.history
                .filter(message => message.type !== "error")
                .map(message => {
                    const role = message.type === "bot" ? "assistant" : message.type;

                    return {
                        role,
                        content: message.text
                    }
                })
        }
    } catch (e) {
        throw new MappingError("Failed to map ChatRequest to OpenAI request", e);
    }
}

export const mapFromOpenAi = (response: OpenAiChatCompletionResponseBody): ChatResponse => {
    try {
        return {
            history: response.choices.map(choice => {
                const type = choice.message.role === "assistant" ? "bot" : choice.message.role;
                return {
                    type: type as MessageType,
                    text: choice.message.content
                }
            })
        }
    } catch (e) {
        throw new MappingError("Failed to map OpenAI response to ChatResponse", e);
    }
}