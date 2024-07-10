/*
 * This example demonstrates how to create a custom object adapter and use it with the Chat class. 
 */

import { Chat } from "ragged"
import type { BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "ragged";

const countingAdapter: BaseChatAdapter = {
    chat: async (request: ChatAdapterRequest): Promise<ChatAdapterResponse> => {
        let totalCharacters = 0;

        for (const message of request.history) {
            if (message.text) {
                totalCharacters += message.text.length;
            }
        }

        return {
            history: [
                { type: "bot", text: "Your request had a total of " + totalCharacters + " characters in it." }
            ],
            raw: {
                request: null,
                response: null
            }
        };
    }
}

const count = new Chat(countingAdapter);

const { history } = await count.chat("This is a test message.");
console.log(history.at(-1)?.text); // Your request had a total of 23 characters in it.
