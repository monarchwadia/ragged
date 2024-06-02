import { MappingError } from "../../../support/CustomErrors";
import { MessageType } from "../../ChatCompletion.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody } from "../../driver/OpenAi/OpenAiApiTypes";
import { ChatRequest, ChatResponse } from "../BaseChatAdapter.types";

export const mapToOpenAi = (request: ChatRequest): OpenAiChatCompletionRequestBody => {
    try {
        return {
            model: "gpt-3.5-turbo",
            messages: request.history.map(message => {
                return {
                    role: message.type,
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
                return {
                    type: choice.message.role as MessageType,
                    text: choice.message.content
                }
            })
        }
    } catch (e) {
        throw new MappingError("Failed to map OpenAI response to ChatResponse", e);
    }
}