import { AzureOpenAiChatCompletionRequestBody, AzureOpenAiChatCompletionResponseBody } from "./AzureOpenAiChatTypes";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { Message } from "../../Chat.types";

const toMap: Record<ChatAdapterRequest['history'][0]['type'], AzureOpenAiChatCompletionRequestBody['messages'][0]['role'] | null> = {
    user: "user",
    bot: "assistant",
    system: "system",
    error: null // will not get sent to OpenAI
}

const fromMap: Record<AzureOpenAiChatCompletionResponseBody['choices'][0]['message']['role'], ChatAdapterResponse['history'][0]['type']> = {
    user: "user",
    assistant: "bot",
    system: "system"
}


export class AzureOpenAiChatMappers {
    static mapToOpenAi(request: ChatAdapterRequest): AzureOpenAiChatCompletionRequestBody {
        const messages: AzureOpenAiChatCompletionRequestBody['messages'] = [];
        for (let i = 0; i < request.history.length; i++) {
            const message = request.history[i];
            const role = toMap[message.type];

            if (role === null) continue;

            messages.push({
                role,
                content: message.text || ""
            });
        }

        return { messages };
    }
    static mapFromOpenAi(response: AzureOpenAiChatCompletionResponseBody): Message[] {
        const messages: ChatAdapterResponse['history'] = [];
        for (let i = 0; i < response.choices.length; i++) {
            const choice = response.choices[i];
            messages.push({
                text: choice.message.content,
                type: fromMap[choice.message.role],
            });
        }
        return messages;
    }
}