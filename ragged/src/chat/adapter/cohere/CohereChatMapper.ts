import { ChatRequest, ChatResponse } from "../../../public/chat/adapter";
import { CohereChatRequestRoot } from "./CohereChatRequestTypes";
import { CohereChatResponseRoot } from "./CohereChatResponseTypes";

export class CohereChatMapper {
    static mapChatRequestToApiRequest(request: ChatRequest): CohereChatRequestRoot {
        throw new Error("Method not implemented.");
    }
    static mapApiResponseToChatResponse(response: CohereChatResponseRoot): ChatResponse {
        throw new Error("Method not implemented.");
    }
}