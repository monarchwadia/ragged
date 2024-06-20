import { NotImplementedError, RetryError } from "../../../../support/CustomErrors";
import { Logger } from "../../../../support/logger/Logger";
import { Message } from "../../../index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "../../index.types";
import { OaiaAssistantDao } from "../assistant/OaiaAssistantDao";
import { OaiaMessageDao } from "../message/OaiaMessageDao";
import { OaiaRunDao } from "../run/OaiaRunDao";
import { OaiaRun } from "../run/OaiaRunDaoTypes";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";
import { OaiaChatMapper } from "./OaiaChatMapper";

type AssistantConfig =
    | { assistantId: string; }
    | {
        name: string;
        model: string;
        instructions: string;
    };

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

        OaiaChatAdapter.logger.debug("Running assistant...");
        const run = await this.opts.runDao.createRun(this.opts.apiKey, {
            threadId: thread.id,
            body: {
                assistant_id: assistant.id,
                instructions: this.opts.assistantConfig.instructions
            },
        });

        const finishedRun = await this.pollRun(run.id, thread.id);

        if (!finishedRun) {
            throw new RetryError("Failed to get the run after polling for it.");
        }

        OaiaChatAdapter.logger.debug("Fetching messages...");
        const messageList = await this.opts.messageDao.listMessagesForThread(this.opts.apiKey, thread.id);

        const raggedMessages: Message[] = OaiaChatMapper.mapMessagesFromOaia(messageList);

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

                latestRun = await this.opts.runDao.getRun(this.opts.apiKey, {
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