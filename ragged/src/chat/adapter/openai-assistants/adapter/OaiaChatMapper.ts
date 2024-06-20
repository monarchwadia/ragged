import { Message } from "../../../index.types";
import { CreateMessageParams } from "../message/OaiaMessageDao";
import { OaiaMessageList } from "../message/OaiaMessageDaoTypes";

export class OaiaChatMapper {
    static mapMessageToOaia = (threadId: string, messages: Message): CreateMessageParams | null => {
        if (messages.type === "system" || messages.type === "error") {
            return null;
        };

        return {
            threadId: threadId,
            body: {
                content: messages.text || "",
                role: messages.type === "user" ? "user" : "assistant"
            }
        }
    }

    static mapMessagesToOaia = (threadId: string, messages: Message[]): CreateMessageParams[] => {
        return messages
            .map((message) => OaiaChatMapper.mapMessageToOaia(threadId, message))
            .filter((message): message is CreateMessageParams => message !== null);
    }

    static mapMessagesFromOaia = (response: OaiaMessageList): Message[] => {
        const messages: Message[] = [];

        for (let i = 0; i < response.data.length; i++) {
            const message = response.data[i];
            const content = message.content.at(0);
            if (!content) {
                continue;
            }

            messages.push({
                text: content.text.value,
                type: message.role === "assistant" ? "user" : "bot"
            });
        }

        return messages;
    }
}