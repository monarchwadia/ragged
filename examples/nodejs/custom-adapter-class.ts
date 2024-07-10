/*
 * This example demonstrates how to create a custom class-based adapter and use it with the Chat class. 
 */

import { Chat } from "ragged"
import type { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "ragged"

class AppendingAdapter implements BaseChatAdapter {
    constructor(private history: string = "") { }

    async chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse> {

        this.history += "\n" + request.history.map(message => message.text).join("n");

        return {
            history: [
                { type: "bot", text: this.history }
            ]
        };
    }
}

const appending = new Chat(new AppendingAdapter("This is the start of the file."));

const appendResponse = await appending.chat("Hello, world!");
console.log(appendResponse.history.at(-1)?.text); // This is the start of the file.\nHello, world!
const appendResponse2 = await appending.chat("This is a test message.");
console.log(appendResponse2.history.at(-1)?.text); // This is the start of the file.\nHello, world!\nThis is a test message.