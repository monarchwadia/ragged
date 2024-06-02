import { BaseChatAdapter, ChatRequest, ChatResponse, MessageType } from "../BaseChatAdapter.types";
import { OpenAiChatCompletionRequestBody, OpenAiChatCompletionResponseBody, } from "../../driver/OpenAi/OpenAiApiTypes";
import { OpenAiChatDriver } from "../../driver/OpenAi/OpenAiChatDriver";

export class OpenAiChatAdapter implements BaseChatAdapter {
    constructor(private driver: OpenAiChatDriver) { }
    async chat(request: ChatRequest) {
        const mappedRequest = this.mapToOpenAi(request);
        const response = await this.driver.chatCompletion(mappedRequest);
        const mappedResponse = this.mapFromOpenAi(response);
        return mappedResponse;
    }

    public mapToOpenAi(request: ChatRequest): OpenAiChatCompletionRequestBody {
        return {
            model: "gpt-3.5-turbo",
            messages: request.content.map(message => {
                return {
                    role: message.type,
                    content: message.text
                }
            })
        }
    }

    public mapFromOpenAi(response: OpenAiChatCompletionResponseBody): ChatResponse {
        return {
            content: response.choices.map(choice => {
                return {
                    type: choice.message.role as MessageType,
                    text: choice.message.content
                }
            })
        }
    }
}