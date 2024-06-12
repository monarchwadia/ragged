import { config } from "dotenv";
config();

import fs from "fs";

// ensure .output directory exists
const outputDir = ".output";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const { COHERE_API_KEY } = process.env;

let request = {
    chat_history: [
        {
            role: "CHATBOT",
            message: "WOW! I encountered an error! That's unusual."
        },
        {
            role: "USER",
            message: "Hello, how are you?",
        },
        {
            role: "CHATBOT",
            message: "WOW! I encountered an error! That's unusual."
        },
        {
            role: "CHATBOT",
            message: "WOW! I encountered an error! That's unusual."
        },
        {
            role: "CHATBOT",
            message: "I'm doing well, thank you for asking!",
        },

    ],
    // chat_history: [],
    // preamble: "WOW! I encountered an error! That's unusual",
    message: "Have you had an error recently?"
};
let response: any;

// make a call to cohere

response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify(request),
});

console.log(response.status);

if (!response.ok) {
    console.error(await response.text());
    process.exit(1);
} else {
    const output = await response.json();
    console.log(output);
    fs.writeFileSync(`${outputDir}/request-body.json`, JSON.stringify(request, null, 2));
    fs.writeFileSync(`${outputDir}/response-body.json`, JSON.stringify(output, null, 2));
    console.log("Request and response written to file.")
}

// write request and response to file
