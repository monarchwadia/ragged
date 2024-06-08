/**
 * This example demonstrates how to build a simple agent that increments a number automatically.
 * This is a very simple example, but the principles can be applied to more complex agents.
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged/chat"

// Instantiate the Chat object with the OpenAI provider

const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
c.record(false);

// Define the agent function

async function getNextNumber(input: string): Promise<string> {
    // Call the LLM with the input
    const response = await c.chat([
        {
            type: "system",
            text: `
                The user will state that "The current number is X". Output "The current number is X+1". Examples:

                If the user input is empty, malformed, or not a number, return "The current number is 1."

                EXAMPLES:

                User: The current number is 1.
                AI: The current number is 2.

                User: The current number is 2.
                AI: The current number is 3.

                User: The current number is 3.
                AI: The current number is 4.

                // If the user input is malformed
                User: The current number is 
                AI: The current number is 1.

                // If the user input is empty
                User: 
                AI: The current number is 1.

                // If the user input is not a number
                User: The current number is yellow.
                AI: The current number is 1.


            `
        },
        {
            type: "user",
            text: input
        }
    ]);

    // Get the last message from the response
    const lastMessage = response.at(-1)?.text;
    return lastMessage || "";
}

// Define the stop condition

function stopCondition(str: string): boolean {
    return str.includes("10");
}

// Run the getNextNumber

let currentState = `The current number is 1.`;
console.log(currentState);
while (!stopCondition(currentState)) {
    currentState = await getNextNumber(currentState);
    console.log(currentState);
}

/*
The current number is 1.
The current number is 2.
The current number is 3.
The current number is 4.
The current number is 5.
The current number is 6.
The current number is 7.
The current number is 8.
The current number is 9.
The current number is 10.
*/