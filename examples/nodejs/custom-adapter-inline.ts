/*
 * This example demonstrates how to create a custom inline adapter and use it with the Chat class. 
 */

import { Chat } from "ragged"
import type { ChatAdapterTypes } from "ragged"

const echo = new Chat({
    chat: async (request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> => {
        return {
            history: request.history.map(message => ({ type: "bot", text: message.text })),
            raw: {
                request: null,
                response: null
            }
        };
    }
});

const { history } = await echo.chat("Hello, world!");
console.log(history.at(-1)?.text); // Hello, world!
