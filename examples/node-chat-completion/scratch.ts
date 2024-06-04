import { config } from "dotenv";
import { describe } from "node:test";
config();

// Store the original fetch function
const originalFetch: typeof fetch = fetch;

// Create a logging fetch function
const loggingFetch: typeof fetch = async (url: any, options: any) => {
    console.log('Request URL:', url);
    console.log('Request Options:', options);

    const response = await originalFetch(url, options);

    console.log('Response Status:', response.status);
    // console.log('Response Headers:', response.headers.raw());

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);

    // Optionally, re-construct the response object if you need to process the body
    return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}

// Shim the global fetch function
global.fetch = loggingFetch;

// import { OpenAI } from "openai";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// })

const body = {
    model: "gpt-3.5-turbo",
    messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Call tool-1 with key1=123, key2=456' }
    ],
    tools: [
        {
            type: "function",
            function: {
                name: "tool-1",
                description: "A tool.",
                parameters: {
                    type: "object",
                    properties: {
                        key1: {
                            type: "string",
                            description: "A key."
                        },
                        key2: {
                            type: "number",
                            description: "Another key."
                        }
                    },
                    required: ["key1", "key2"]
                },
            }
        }
    ]
}

/*
const response = {
  "id": "chatcmpl-9WBIDbxhUUJZgTrE22uK3x0zr6j0t",
  "object": "chat.completion",
  "created": 1717456933,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_ciuJemr9w8lsTEj0vlr1Ci6q",
            "type": "function",
            "function": {
              "name": "tool-1",
              "arguments": "{\"key1\":\"123\",\"key2\":456}"
            }
          }
        ]
      },
      "logprobs": null,
      "finish_reason": "tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 77,
    "completion_tokens": 21,
    "total_tokens": 98
  },
  "system_fingerprint": null
}


*/

const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body)
});

console.log(await (JSON.stringify(await response.json(), null, 2)));