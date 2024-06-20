import { RetryError } from "../../../../support/CustomErrors";
import { Logger } from "../../../../support/logger/Logger";
import { Message } from "../../../index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../../index.types";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaRun } from "../run/OaiaRunDaoTypes";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatMapper } from "./OaiaChatMapper";

export type OpenaiAssistantsChatAdapterConfig = {
    apiKey: string;
    /**
     * This is the assistant configuration that will be used to create the assistant.
     * It is a subset of the OpenAI Assistant configuration.
     */
    assistant: {
        /**
         * The name of the assistant
         */
        name: string;
        /**
         * The model to use for the assistant. For example, "gpt-3.5-turbo"
         */
        model: string;
        /**
         * The instructions for the assistant. For example, "Analyze my writing and give me some useful critique."
         */
        instructions: string;
        /**
         * The description of the assistant. For example, "This assistant will analyze your writing and give you some useful critique."
         */
        description: string;
    }
};

export type OaiaChatAdapterConstructorOpts = {
    config: OpenaiAssistantsChatAdapterConfig;
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
        OaiaChatAdapter.logger.debug("Creating assistant...");
        const assistant = await this.opts.assistantDao.createAssistant(this.opts.config.apiKey, {
            instructions: this.opts.config.assistant.instructions,
            model: this.opts.config.assistant.model,
            name: this.opts.config.assistant.name,
            description: this.opts.config.assistant.description,
            // TODO: support oaia assistant tools
            tools: []
        });

        OaiaChatAdapter.logger.debug("Creating thread...");
        const thread = await this.opts.threadDao.createThread(this.opts.config.apiKey);

        OaiaChatAdapter.logger.debug("Creating messages");
        for (const message of request.history) {
            await this.opts.messageDao.createMessage(this.opts.config.apiKey, {
                threadId: thread.id,
                body: {
                    content: message.text || "",
                    role: message.type === "user" ? "user" : "assistant"
                }
            });
        }

        OaiaChatAdapter.logger.debug("Running assistant...");
        const run = await this.opts.runDao.createRun(this.opts.config.apiKey, {
            threadId: thread.id,
            body: {
                assistant_id: assistant.id,
                instructions: this.opts.config.assistant.instructions
            },
        });

        const finishedRun = await this.pollRun(run.id, thread.id);

        if (!finishedRun) {
            throw new RetryError("Failed to get the run after polling for it.");
        }

        OaiaChatAdapter.logger.debug("Fetching messages...");
        const listMessageResponse = await this.opts.messageDao.listMessagesForThread(this.opts.config.apiKey, thread.id);

        // All new messages from OAI Assistants come back with a thread_id. But because the messages we
        // created did not originate inside a thread, i.e. they were created just a few lines ago for the first time,
        // they will not have a thread_id. So we need to filter out the messages that don't have a thread_id,
        // and only keep the ones that do have a thread_id.
        //
        // Known limitation: all conversations will have new threads created for them. This is not ideal, but
        // it is a limitation of the current implementation. We can improve this in the future.
        const newResponseMessages = listMessageResponse.data.filter((message) => !!message.run_id);

        const raggedMessages: Message[] = OaiaChatMapper.mapMessagesFromOaia(newResponseMessages);

        // TODO: Delete the assistants, threads, messages, and runs after we are done with them.

        return {
            history: raggedMessages
        }
    }

    /**
     * Polls the OpenAI API for the status of a run until it is finished.
     * @param run 
     * @param thread 
     * @returns 
     */
    private async pollRun(runId: string, threadId: string): Promise<OaiaRun | null> {
        // TODO: Loop until run is complete
        // TODO: when runStatus is "requires_action", we need to handle the tool calls there.

        let attempt = 0;
        const maxAttempts = 5;
        let nextDelay = 1000;
        let runIsFinished = false;
        let latestRun: OaiaRun | null = null;
        while (true) {
            try {
                OaiaChatAdapter.logger.debug("Fetching run...");

                latestRun = await this.opts.runDao.getRun(this.opts.config.apiKey, {
                    runId: runId,
                    threadId: threadId
                });

                // Check if the run is finished
                runIsFinished = latestRun && this.isRunFinished(latestRun.status)

                // If run is finished, return the run. Else, wait and try again.
            } catch (e) {
                OaiaChatAdapter.logger.error("Failed to get run due to an error. Attempting to retry...", e);
            }

            // return if run is finished
            if (runIsFinished) {
                return latestRun;
            }

            // otherwise, retry
            attempt++;
            if (attempt > maxAttempts) {
                OaiaChatAdapter.logger.error("Exceeded maximum attempts. Failed to get run after " + maxAttempts + " attempts.");
                return null;
            }
            nextDelay = nextDelay * 2;
            await new Promise((resolve) => setTimeout(resolve, nextDelay));

        }
    }

    /**
     * Determines if an OpenAI Assistant Run is finished based on the status of the run.
     * Known API statuses are taken from OpenAI Assistants documentation
     * See https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
     */
    private isRunFinished(runStatus: OaiaRun['status']): boolean {
        const knownStatuses: Record<string, { runIsFinished: boolean }> = {
            "queued": { runIsFinished: false },
            "in_progress": { runIsFinished: false },
            "cancelling": { runIsFinished: false },
            "requires_action": { runIsFinished: true },
            "expired": { runIsFinished: true },
            "completed": { runIsFinished: true },
            "failed": { runIsFinished: true },
            "incomplete": { runIsFinished: true },
            "cancelled": { runIsFinished: true }
        }

        const statusConfig = knownStatuses[runStatus];

        if (!statusConfig) {
            OaiaChatAdapter.logger.warn("Unknown Run status received from OpenAI while polling for the end of an OpenAI Assistant Run. Status was " + runStatus + ". This run status will be ignored and we will retry the run as if it was incomplete.");
            return false;
        }

        return statusConfig.runIsFinished;
    }
}