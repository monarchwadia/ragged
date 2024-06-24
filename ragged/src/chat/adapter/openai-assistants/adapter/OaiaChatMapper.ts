import { Message } from "../../../index.types.js";
import { CreateMessageParams } from "../message/OaiaMessageDao.js";
import { OaiaMessageList } from "../message/OaiaMessageDaoTypes.js";

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

    static mapMessagesFromOaia = (messageListData: OaiaMessageList['data']): Message[] => {
        const messages: Message[] = [];

        for (let i = 0; i < messageListData.length; i++) {
            const message = messageListData[i];
            const content = message.content.at(0);
            if (!content) {
                continue;
            }

            messages.push({
                text: content.text.value,
                type: message.role === "assistant" ? "bot" : "user"
            });
        }

        return messages;
    }
}