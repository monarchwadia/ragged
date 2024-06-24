import { AzureOpenAiChatCompletionRequestBody, AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";

const typeMap: Record<ChatAdapterRequest['history'][0]['type'], AzureOpenAiChatCompletionRequestBody['messages'][0]['role'] | null> = {
    user: "user",
    bot: "assistant",
    system: "system",
    error: null // will not get sent to OpenAI
}

export class AzureOpenAiChatMappers {
    static mapToOpenAi(request: ChatAdapterRequest): AzureOpenAiChatCompletionRequestBody {
        const messages: AzureOpenAiChatCompletionRequestBody['messages'] = [];
        for (let i = 0; i < request.history.length; i++) {
            const message = request.history[i];
            const role = typeMap[message.type];

            if (role === null) continue;

            messages.push({
                role,
                content: message.text || ""
            });
        }

        return { messages };
    }
    static mapFromOpenAi(response: AzureOpenAiChatCompletionResponseBody): Promise<ChatAdapterResponse> {
        throw new Error("Method not implemented.");
    }
}