import { Message } from "../../../index.types";
import { CreateMessageParams } from "../message/OaiaMessageDao";

export class OaiaChatMapper {
    static mapMessage = (threadId: string, messages: Message): CreateMessageParams | null => {
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

    static mapMessages = (threadId: string, messages: Message[]): CreateMessageParams[] => {
        return messages
            .map((message) => OaiaChatMapper.mapMessage(threadId, message))
            .filter((message): message is CreateMessageParams => message !== null);
    }
}