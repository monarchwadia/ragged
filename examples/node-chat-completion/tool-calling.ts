/*
 * This example demonstrates how to persist the history of messages in a Chat instance 
 * by turning on recording.
 */

import fs from 'fs';
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
import { Tool } from "ragged/tools";
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
c.record(true);


const lsTool: Tool = {
    id: "ls",
    description: "List the files in any given directory on the user's local machine.",
    props: {
        type: "object",
        props: {
            path: {
                type: "string",
                description: "The path to the directory to list files from.",
                required: true
            }
        }
    },
    handler: async (props) => {
        try {
            const json = await JSON.parse(props);
            const path = json.path;
            const files = fs.readdirSync(path);
            return `The files in the directory ${path} are: ${files.join("\n")}`;
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

const response = await c.chat(`What are the files in my root dir?`, [], [lsTool])

console.log(response.at(-1)?.text); // The files in the directory / are: bin

// const response = await c.chat('What is a rickroll?');

// // you can get the last message from the response
// console.log(response.at(-1)?.text); // A rickroll is a prank...
// // or, alternatively, you can access the response directly from the chat instance
// console.log(c.history.at(-1)?.text); // A rickroll is a prank...

// // continue the conversation
// await c.chat('Where did it originate?');
// console.log(c.history.at(-1)?.text); // The Rickroll meme originated in the...
// await c.chat('What is the purpose?');
// console.log(c.history.at(-1)?.text); // The purpose of a rickroll is to...
