/*
 * This example demonstrates how to create a custom object adapter and use it with the Chat class. 
 */

import { Chat } from "ragged"
// import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"

import type { ChatAdapterTypes } from "ragged";

type BaseChatAdapter = ChatAdapterTypes["BaseChatAdapter"];

const countingAdapter: BaseChatAdapter = {
    chat: async (request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> => {
        let totalCharacters = 0;

        for (const message of request.history) {
            if (message.text) {
                totalCharacters += message.text.length;
            }
        }

        return {
            history: [
                { type: "bot", text: "Your request had a total of " + totalCharacters + " characters in it." }
            ]
        };
    }
}

const count = new Chat(countingAdapter);

const countResponse = await count.chat("This is a test message.");
console.log(countResponse.at(-1)?.text); // Your request had a total of 23 characters in it.
