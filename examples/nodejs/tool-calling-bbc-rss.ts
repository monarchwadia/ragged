/*
 * A simple tool calling example
 */

import { config } from 'dotenv';
config();
import { Chat, ChatTypes } from "ragged"

type Tool = ChatTypes['Tool']

// Instantiate the Chat object with the OpenAI provider
const c = Chat.with({
    provider: "openai",
    config: { apiKey: process.env.OPENAI_API_KEY }
});

// Perform the query with the tool
const response = await c.chat("Fetch and display the contents of https://feeds.bbci.co.uk/news/world/rss.xml", {
    tools: [buildFetchTool()],
    model: "gpt-4"
});

// Output the final text response. We don't need to care about the intermediate messages, tool calling is handled automatically.
console.log(response.history.at(-1)?.text); // "Here are some of the latest news from around the world according to the BBC: ..."

// The tool definition
function buildFetchTool() {
    const fetchTool: Tool = {
        id: "fetch",
        description: "Do a simple GET call and retrieve the contents of a URL.",
        // The props object describes the expected input for the tool.
        props: {
            type: "object",
            props: {
                url: {
                    type: "string",
                    description: "The URL to fetch.",
                    required: true
                }
            }
        },
        // The handler function processes the input and returns the output.
        handler: async (props: any) => {
            try {
                const json = await JSON.parse(props);
                const url = json.url;
                const response = await fetch(url);
                const text = await response.text();
                return text;
            } catch (e: any) {
                console.error(e);
                if (e?.message) {
                    return `An error occurred: ${e.message}`;
                } else {
                    return `An unknown error occurred.`;
                }
            }
        }
    }

    return fetchTool
}
