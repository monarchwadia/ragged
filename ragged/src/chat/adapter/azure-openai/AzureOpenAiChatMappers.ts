import { AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";

export class AzureOpenAiChatMappers {
    static mapToOpenAi(request: ChatAdapterRequest): AzureOpenAiChatCompletionResponseBody {
        throw new Error("Method not implemented.");
    }
    static mapFromOpenAi(response: AzureOpenAiChatCompletionResponseBody): Promise<ChatAdapterResponse> {
        throw new Error("Method not implemented.");
    }
}