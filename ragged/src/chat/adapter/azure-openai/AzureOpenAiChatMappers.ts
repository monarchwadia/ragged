import { AzureOpenAiChatCompletionRequestBody, AzureOpenAiChatCompletionResponseBody, AzureOpenAiChatRequestMessageUser } from "./AzureOpenAiChatTypes";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { Message } from "../../Chat.types";
import { mapDataUriEntityToString } from "../../../support/data-uri/DataUriMapper";

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
    static mapToOpenAi(request: Message[]): AzureOpenAiChatCompletionRequestBody {
        const messages: AzureOpenAiChatCompletionRequestBody['messages'] = [];
        for (let i = 0; i < request.length; i++) {
            const message = request[i];
            const role = toMap[message.type];

            if (role === null) continue;

            switch (message.type) {
                case "user": {
                    // user message can have attachments
                    const userMessage: AzureOpenAiChatRequestMessageUser = {
                        role: "user",
                        content: []
                    };

                    if (message.text) {
                        userMessage.content.push({
                            type: "text",
                            text: message.text,
                        })
                    }

                    if (message.attachments && message.attachments.length > 0) {
                        for (const a of message.attachments) {
                            userMessage.content.push({
                                type: "image_url",
                                image_url: {
                                    url: mapDataUriEntityToString(a.payload),
                                },
                                detail: "auto"
                            })
                        }
                    }

                    messages.push(userMessage);

                    break
                };
                default: {

                    let mappedRole: AzureOpenAiChatCompletionRequestBody['messages'][0]['role'] | null;
                    switch (message.type) {
                        case "system":
                            mappedRole = "system";
                            break;
                        case "bot":
                            mappedRole = "assistant";
                            break;
                        case "error":
                        default:
                            mappedRole = null;
                            break;
                    }

                    // if null, we dont map this message type
                    if (mappedRole === null) continue;

                    messages.push({
                        role: mappedRole,
                        content: message.text || ""
                    });

                    break;
                }
            }
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