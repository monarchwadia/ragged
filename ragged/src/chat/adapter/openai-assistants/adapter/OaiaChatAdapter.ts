import { NotImplementedError } from "../../../../support/CustomErrors";
import { Logger } from "../../../../support/logger/Logger";
import { Message } from "../../../index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../../index.types";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { CreateMessageParams, OaiaMessageDao } from "../message/OaiaMessageDao";
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
    private static logger: Logger = new Logger("OaiaChatAdapter");
    constructor(private opts: OaiaChatAdapterConstructorOpts) { }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        if ("assistantId" in this.opts.assistantConfig) {
            throw new NotImplementedError("Not implemented. Currently, Ragged does not support re-using assistantId in OpenAI Assistant requests.");
        }

        OaiaChatAdapter.logger.debug("Creating assistant...");
        const assistant = await this.opts.assistantDao.createAssistant(this.opts.apiKey, {
            instructions: this.opts.assistantConfig.instructions,
            model: this.opts.assistantConfig.model,
            name: this.opts.assistantConfig.name,
            description: this.opts.assistantConfig.instructions,
            // TODO: support oaia assistant tools
            tools: []
        });

        OaiaChatAdapter.logger.debug("Creating thread...");
        const thread = await this.opts.threadDao.createThread(this.opts.apiKey);

        OaiaChatAdapter.logger.debug("Creating messages");
        for (const message of request.history) {
            await this.opts.messageDao.createMessage(this.opts.apiKey, {
                threadId: thread.id,
                body: {
                    content: message.text || "",
                    role: message.type === "user" ? "user" : "assistant"
                }
            });
        }

        return {
            history: request.history
        }
    }
}