import { config } from "dotenv";
config();
import { Chat } from "ragged";

const c = Chat.with({
    provider: 'openai',
    config: {
        apiKey: process.env.OPENAI_API_KEY
    }
});

c.chat(`say hello world`, {
    hooks: {
        beforeRequest: ({ request }) => {
            console.log("We will be sending the Content-Type header with value: ", request.headers.get('Content-Type'))
        },
        afterResponse: ({ response }) => {
            console.log("Received rate limit info from OpenAI: ", Array.from(response.headers.entries()).filter(([key]) => key.startsWith('x-ratelimit')))
        },
        afterResponseParsed: (response) => {
            console.log("Raw OpenAI response JSON: ", response.json)
        }
    }
})