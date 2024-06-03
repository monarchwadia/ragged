import { Logger } from "../support/logger/Logger";
import { Message } from "./index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

export class Chat {
    public logger = new Logger("Chat");
    private _history: Message[] = [];

    private _isRecording: boolean = false;
    constructor(private adapter: BaseChatAdapter) { }

    async chat(userMessage: string, history: Message[] = []): Promise<Message[]> {
        if (this._isRecording) {
            this.logger.debug("Recording is on. Using the internal history.");

            if (history.length > 0) {
                this.logger.warn("Received a history object in params, but ignoring it because recording is on.");
            }

            history = Chat.cloneMessages(this._history);
            history.push({
                type: "user",
                text: userMessage
            });
        } else {
            this.logger.debug("Recording is off. Using the history object passed in.");
            history = Chat.cloneMessages(history);
            history.push({
                type: "user",
                text: userMessage
            });
        }

        const request: ChatRequest = { history };
        this.logger.debug("Chat request: ", JSON.stringify(request));
        let response: ChatResponse = { history: [] }; // will be replaced soon
        try {
            response = await this.adapter.chat(request);
        } catch (e: unknown) {
            this.logger.error("Failed to chat", e);

            if (e instanceof Error) {
                response = { history: [{ type: "error", text: e.message }] };
            } else {
                response = { history: [{ type: "error", text: "An unknown error occurred" }] };
            }
        }

        if (this._isRecording) {
            this._history = Chat.cloneMessages([...request.history, ...response.history]);
            this.logger.debug("Recorded Response: ", JSON.stringify(this._history));
            return this._history;
        } else {
            this.logger.debug("Response:", JSON.stringify(response.history));
            return Chat.cloneMessages(response.history);
        }
    }

    public record(record: boolean) {
        this._isRecording = record;
    }

    get isRecording() {
        return this._isRecording;
    }

    set history(history: Message[]) {
        this._history = Chat.cloneMessages(history);
    }

    get history() {
        return Chat.cloneMessages(this._history)
    }

    static with(provider: "openai", config: Partial<OpenAiChatDriverConfig> = {}) {
        const adapter = provideOpenAiChatAdapter({ config })
        return new Chat(adapter);
    }

    private static cloneMessages(messages: Message[]): Message[] {
        return messages.map(Chat.cloneMessage);
    }

    private static cloneMessage(message: Message): Message {
        return { ...message };
    }
}