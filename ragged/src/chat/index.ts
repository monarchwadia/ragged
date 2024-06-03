import { Logger } from "../support/logger/Logger";
import { Message } from "./index.types";
import { BaseChatAdapter, ChatRequest, ChatResponse } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

export class Chat {
    private logger = new Logger("Chat");
    private _history: Message[] = [];

    private _isRecording: boolean = false;
    constructor(private adapter: BaseChatAdapter) { }

    async chat(userMessage: string, history: Message[] = []): Promise<Message[]> {

        // prepare the request

        let requestHistory = [];
        if (this._isRecording) {
            // if recording, we ignore the history passed in and use the internal history
            requestHistory = Chat.cloneMessages(this._history);
        } else {
            requestHistory = Chat.cloneMessages(history);
        }

        requestHistory.push({
            type: "user",
            text: userMessage
        });

        // execute the request

        const request: ChatRequest = {
            history: requestHistory
        }

        // handle response

        let response: ChatResponse = { history: [] };
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

        let historyToReturn: Message[] = [];
        if (this._isRecording) {
            historyToReturn = request.history;
        }

        historyToReturn.push(...response.history);

        return Chat.cloneMessages(historyToReturn);
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