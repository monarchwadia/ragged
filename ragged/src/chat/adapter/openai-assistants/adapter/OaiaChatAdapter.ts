import { NotImplementedError } from "../../../../support/CustomErrors";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../../index.types";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";

type AssistantConfig =
    | { assistantId: string; }
    | {
        name: string;
        model: string;
        instructions: string;
    }

export type OaiaChatAdapterConstructorOpts = {
    apiKey: string;
    assistantConfig: AssistantConfig;
    assistantDao: OaiaAssistantDao;
    threadDao: OaiaThreadDao;
    messageDao: OaiaMessageDao;
    runDao: OaiaRunDao;
}

/**
 * Converts OpenAI Assistants into simple Chat api
 */
export class OaiaChatAdapter implements BaseChatAdapter {
    constructor(private opts: OaiaChatAdapterConstructorOpts) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        if ("assistantId" in this.opts.assistantConfig) {
            throw new NotImplementedError("Not implemented. Currently, Ragged does not support re-using assistantId in OpenAI Assistant requests.");
        }

        return {
            history: request.history
        }
    }

}