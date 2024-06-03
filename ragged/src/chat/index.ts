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
        let workingHistory = [...this.history, ...history];

        const userMessageObj: Message = {
            type: "user",
            text: userMessage
        }

        workingHistory.push(userMessageObj);

        const request: ChatRequest = { history: Chat.cloneMessages(workingHistory) };

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

        if (this.isRecording) {
            workingHistory = [...workingHistory, ...response.history]; // this.history setter will clone the messages
            this.logger.debug("Recorded Response: ", JSON.stringify(workingHistory));
            this.history = workingHistory;
            return this.history;
        } else {
            const returnable = Chat.cloneMessages([...workingHistory, ...response.history]);
            this.logger.debug("Response:", JSON.stringify(returnable));
            return returnable;
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