/*
 * This example demonstrates how to create a custom inline adapter and use it with the Chat class. 
 */

import { Chat } from "ragged/chat"
import type { ChatRequest, ChatResponse } from "ragged/chat/adapter"

const echo = new Chat({
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        return {
            history: request.history.map(message => ({ type: "bot", text: message.text }))
        };
    }
});

const echoResponse = await echo.chat("Hello, world!");
console.log(echoResponse.at(-1)?.text); // Hello, world!
