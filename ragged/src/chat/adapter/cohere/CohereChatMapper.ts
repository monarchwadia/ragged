
import { MappingError } from "../../../support/RaggedErrors";
import { Logger } from "../../../support/logger/Logger";
import { Message } from "../../Chat.types";
import { ChatAdapterRequest, ChatAdapterResponse } from "../BaseChatAdapter.types";
import { CohereChatItem, CohereChatRequestRoot } from "./CohereApiRequestTypes";
import { CohereChatResponseRoot } from "./CohereApiResponseTypes";

const roleMapCohereRagged: Record<CohereChatItem['role'], Message['type']> = {
    "CHATBOT": "bot",
    "SYSTEM": "system",
    "USER": "user"
}

const roleMapRaggedCohere: Record<Message['type'], CohereChatItem['role']> = {
    "bot": "CHATBOT",
    "system": "SYSTEM",
    "user": "USER",
    'error': "CHATBOT" // we actually just skip this
}



export class CohereChatMapper {
    static logger: Logger = new Logger("CohereChatMapper");
    static mapChatRequestToCohereRequest(request: Message[]): CohereChatRequestRoot {
        const root: CohereChatRequestRoot = {
            message: undefined
        }

        // ===== map history =====

        const chat_history: CohereChatRequestRoot['chat_history'] = [];
        request.forEach((item) => {
            const mappedRole = roleMapRaggedCohere[item.type];
            chat_history.push({
                role: mappedRole,
                message: item.text || ""
            })
        });

        if (chat_history.length > 0) {
            root.chat_history = chat_history;
        }

        // Ragged does not have a concept of a "current message" so we need to find the last user message.
        // If the last user message is followed by any bot or system messages, then no message has been provided.
        // In such a case, throw an error, as there should always be a user message provided in Cohere.
        // It's OK if the last user message is followed by tool messages. In this case, just pass undefined as the message.

        if (request.length === 0) {
            throw new MappingError("No history provided in request. Cohere needs at least one message to start a conversation.");
        }

        const previousMessage = request[request.length - 1];

        if (previousMessage.type === "user") {
            if (previousMessage.text === null) {
                throw new MappingError("The last message in the history is of type 'user' but has a null text. Please provide a message.");
            }
            if (!previousMessage.text) {
                throw new MappingError("The last message in the history is of type 'user' but has no text. Please provide a message.");
            }

            // remove the last message from the history, as per Cohere's spec this should just be in the "message" field
            root.chat_history?.pop();

            // set the message to the last user message
            root.message = previousMessage.text;
        } else {
            if (previousMessage.type === "bot" && previousMessage.toolCalls?.length) {
                // This is fine. The last message was a bot message with tool calls.
                root.message = undefined;
            } else {
                throw new MappingError("The Cohere adapter requires the last Ragged Message to be of type 'user.'" +
                    "The only exception is if the last message was of type 'bot' and there were tool calls in this " +
                    "previous message. Please ensure that this is the case and try again.");
            }
        }

        return root;
    }
    static mapCohereResponseToChatResponse(response: CohereChatResponseRoot): Message[] {
        if (!response.text) {
            CohereChatMapper.logger.warn("No 'text' field was received in response from Cohere. This is unexpected, and may indicate an error in Ragged's logic.");
        }

        return [
            {
                type: "bot",
                text: response.text
            }
        ]
    }
}