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
            // Print the Content-Type header value, just to test the hook
            console.log("We will be sending the Content-Type header with value: ",
                request.headers.get('Content-Type'))
        },
        afterResponse: ({ response }) => {
            // Get the rate limit info from the response headers. This is very useful!
            console.log("Received rate limit info from OpenAI: ",
                Array.from(response.headers.entries())
                    .filter(([key]) => key.startsWith('x-ratelimit')))
        },
        afterResponseParsed: (response) => {
            // Finally, print the raw JSON response from OpenAI
            console.log("Raw OpenAI response JSON: ",
                response.json)
        }
    }
})

