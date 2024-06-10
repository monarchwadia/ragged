/*
 * A simple tool calling example
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged/chat"
import { Tool } from "ragged/tools";

// Defines a simple tool that fetches some mock homepage contents.
const getHomepageTool: Tool = {
    // The unique identifier for the tool. This is what the LLM uses to reference the tool.
    id: "get-homepage-contents",
    // A description of what the tool does. The LLM uses this to understand the tool.
    description: "Gets the contents of my homepage.",
    // The handler function processes any input props (not shown here) and returns the output.
    // The output must always be a string. The output will be read by the LLM and used in the conversation.
    handler: async () => {
        // This is where you would actually fetch the contents of your homepage.
        // You could also do other actions here, like querying a database or calling an API.
        // Right now, we're just returning a static string.
        return Promise.resolve("Hello! My name is John! I'm a student at a community college!")
    }
}

const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

const response = await c.chat("Get the contents of my homepage.", {
    // Pass the tool to the chat method.
    tools: [getHomepageTool],
    model: "gpt-3.5-turbo"
});

// Output the final text response.
console.log(response.at(-1)?.text);

