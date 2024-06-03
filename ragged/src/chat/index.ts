import { Message } from "./index.types";
import { BaseChatAdapter, ChatRequest } from "./provider/index.types";
import { provideOpenAiChatAdapter } from "./provider/openai";
import { OpenAiChatDriverConfig } from "./provider/openai/driver";

export class Chat {
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

        const response = await this.adapter.chat(request);

        let responseHistory: Message[] = [];
        if (this._isRecording) {
            responseHistory = request.history;
        }

        responseHistory.push(...response.history);

        return Chat.cloneMessages(responseHistory);
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