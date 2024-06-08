
# Ragged

![An image of an audio cable with a ragged blue denim insulation covering. The caption in the foreground reads "Ragged, the universal LLM client for JavaScript."](./ragged-social-card.jpeg)

## What is this?

Ragged is a 0-dependency, lightweight, universal LLM client for JavaScript and Typescript. It makes it easy to access LLMs via a simple, easy to understand, and uncomplicated API.

## Table of Contents 

- [Ragged](#ragged)
  - [What is this?](#what-is-this)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Feature Roadmap](#feature-roadmap)
    - [Providers and Models](#providers-and-models)
  - [Simple chat](#simple-chat)
  - [Automatic Message History](#automatic-message-history)
  - [Manually-managed Message history](#manually-managed-message-history)
    - [Accessing message history](#accessing-message-history)
    - [History is immutable](#history-is-immutable)
    - [Setting message history](#setting-message-history)
  - [Prompt freezing](#prompt-freezing)
  - [API](#api)
    - [`Chat.with(name, options)`](#chatwithname-options)
    - [`Chat.with('openai')`](#chatwithopenai)
    - [`new Chat(adapter)` and custom adapters](#new-chatadapter-and-custom-adapters)
      - [Inline adapter](#inline-adapter)
      - [Object adapter](#object-adapter)
      - [Class adapter](#class-adapter)
  - [Tool Calling](#tool-calling)
  - [Using Tools to fetch and display the contents of a URL](#using-tools-to-fetch-and-display-the-contents-of-a-url)
  - [Autonomous Agents](#autonomous-agents)
    - [What is an agent?](#what-is-an-agent)
    - [How do agents work?](#how-do-agents-work)
    - [Incrementing Agent Example](#incrementing-agent-example)
    - [Multiple Agents Example](#multiple-agents-example)

## Installation

Installing Ragged is very easy.

```bash
# either
npm install ragged
# or
pnpm install ragged
# or
yarn install ragged
```

That's it.

## Feature Roadmap

Ragged is currently in alpha. It is not yet ready for production use. We are actively working on it and will be releasing new features and improvements regularly.

🟡

| Feature                            | Is Working | API Frozen* | Notes                                                                                   |
| ---------------------------------- | ---------- | ----------- | --------------------------------------------------------------------------------------- |
| Chat Completion                    | 🟢 100%     | ❌           |                                                                                         |
| In-built Message History           | 🟢 100%     | ❌           |                                                                                         |
| Write your own custom LLM adapters | 🟢 100%     | ❌           |                                                                                         |
| Tool Calling                       | 🟢 100%     | ❌           |                                                                                         |
| Autonomous Agents                  | 🟢 100%     | ❌           |                                                                                         |
| Message History                    | 🟢 100%     | ❌           |                                                                                         |
| Helpful Errors                     | 🟡 30%      | ❌           |                                                                                         |
| Streaming                          | 🔴 0%       | ❌           |                                                                                         |
| Embeddings Generation              | 🔴 0%       | ❌           |                                                                                         |
| Image Input                        | 🔴 0%       | ❌           |                                                                                         |
| Video Input                        | 🔴 0%       | ❌           |                                                                                         |
| File Input                         | 🔴 0%       | ❌           | If your file is human-readable (XML, JSON, etc) then you can include it in your prompt. |
| Image Generation                   | 🔴 0%       | ❌           |                                                                                         |
| Video Generation                   | 🔴 0%       | ❌           |                                                                                         |
| Model Fine-Tuning                  | 🔴 0%       | ❌           |                                                                                         |

\* By "API Frozen," we mean that these features will not change in a breaking way. We will add new features, but we will not change the existing interface in a way that breaks existing code.

### Providers and Models

The following table lists the providers and models that Ragged supports.

| Provider      | Models                  | Is Working |
| ------------- | ----------------------- | ---------- |
| OpenAI        | GPT: 4o, 4T, 4, 3.5     | ✅          |
| Azure OpenAI  | GPT: 4, 4T, 3.5         | ❌          |
| Together      | Several OSS Models      | ❌          |
| Cohere        | CommandR, Command       | ❌          |
| Anthropic     | Claude 2, Claude 3      | ❌          |
| Mistral       | 7B, 8x7B, S, M & L      | ❌          |
| Groq          | Lama2-70B, Mixtral-8x7b | ❌          |
| DeepSeek      | Chat and Code           | ❌          |
| Ollama        | All models              | ❌          |
| Google Gemini | Gemini: Flash, Pro      | ❌          |
| Hugging Face  | OSS Model               | ❌          |


## Simple chat

Ragged is very easy to use. Here is a complete application that shows chat completion.

```ts
// configure dotenv to load environment variables from a .env file into process.env
import { config } from 'dotenv';
config();

// import the Chat class from the ragged/chat module
import { Chat } from "ragged/chat"

// create a new Chat instance with the OpenAI provider
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// chat with the model
const messages = await c.chat('What is a rickroll?');

// log the messages
const lastText = messages.at(-1)?.text; // this is just vanilla JavaScript to get the last message
console.log(lastText); // A rickroll is a prank...
```


## Automatic Message History

By default, each instance of the `Chat` object records the history of the conversation. 

This is useful when you want to keep track of the conversation history and use it later. You can turn recording on and off by passing a boolean to the `.record` method.

```ts
// Recording is on by default. Here is how you can turn it off.
c.record(false);
```

Here's a basic example of how to use the history functionality. You can access the history of the conversation using the `.history` property.

```ts
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// By default, recording is already turned on
// Doing this line just to demonstrate the API
c.record(true);

const response = await c.chat('What is a rickroll?');

// you can get the last message from the response
console.log(response.at(-1)?.text); // A rickroll is a prank...
// or, alternatively, you can access the response directly from the chat instance
console.log(c.history.at(-1)?.text); // A rickroll is a prank...

// continue the conversation
await c.chat('Where did it originate?');
console.log(c.history.at(-1)?.text); // The Rickroll meme originated in the...
await c.chat('What is the purpose?');
console.log(c.history.at(-1)?.text); // The purpose of a rickroll is to...
```

This will cause Ragged to record the conversation history. 

## Manually-managed Message history

Instead of using recorded message history, it is possible to manage message history manually. 

### Accessing message history

You can access the history using the `.history` property.

```ts
console.log(c.history); // [ { text: 'What is a rickroll?' ... ]
```

You can also access the last message in the history using the `.at` method.

```ts
console.log(c.history.at(-1)?.text); // A rickroll is a prank...
```

### History is immutable

Note that all message history is immutable. A new copy of the history array is created on write as well as on read. 

Don't try to modify the history directly. Instead, set the `.history` property to a new array.

### Setting message history

You can set the history by setting the `.history` property to an array of messages.

```ts
c.history = [
    { type: "user", text: "What is a rickroll?" },
    { type: "bot", text: "A rickroll is a prank..." }
];
```

You can clear the history by setting the `.history` property to an empty array.

```ts
c.history = [];
```

## Prompt freezing

Sometimes, you may want to freeze a conversation. This is useful when you want to create multiple responses to a single prompt. You can freeze the recording by passing a `false` to the `.record` method. Then, you can prompt the model multiple times. Each time, the model will respond as if it were the first time, and the history will not be updated with each call.

```ts
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

c.record(true);

const response = await c.chat('Write a 4-step framework that can be used to provide insights into a snippet of code.');
console.log(response.at(-1)?.text); // 1. Provide a summary. By providing....

// freeze the history
c.record(false);

// continue the conversation, always using the same prompt

const analysis1 = await c.chat('Analyze this code snippet using the framework: `const x = 5;`');
console.log(analysis1.at(-1)?.text); // 1. Summary: This code snippet declares a variable called...

const analysis2 = await c.chat('Analyze this code snippet using the framework: `for (let i = 0; i < 5; i++) { console.log(i); }`');
console.log(analysis2.at(-1)?.text); // 1. Summary: This code snippet is a for loop that iterates...
```

## API

### `Chat.with(name, options)`

The `Chat.with()` method is used to create a new instance of the `Chat` class with any one of several built-in adapters. (NOTE: right now, we only support openai). It takes two arguments: the provider name and the provider options. The provider name is a string that specifies the provider to use. The provider options is an object that contains the options for the provider.

Under the hood, the `Chat.with()` method creates a new instance of the `Chat` class and passes the adapter to the constructor. See the `new Chat(adapter)` section for more information.

```ts
// Create an instance of the Chat class with the OpenAI provider
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
```

### `Chat.with('openai')`

The `Chat.with('openai')` method is a shorthand for creating a new instance of the `Chat` class with the OpenAI provider. Its configuration allows you to pass the OpenAI API key as an environment variable.

Note that, unlike the official OpenAI client, `Chat` does not read the environment variable directly. You must pass the API key as an option. We consider this a feature, not a bug, because it reduces surprises and makes the code more predictable.

```ts
const c = Chat.with('openai', {
    // The API key is optional, but calls will fail without it
    apiKey: process.env.OPENAI_API_KEY,
    // The root URL is optional and defaults to the OpenAI API URL
    // You can set this to a different URL if you are using a proxy
    // This also comes in handy for Ollama, LM Studio and other OpenAI API-compatible services
    rootUrl: 'https://api.openai.com/v1',
});
```


### `new Chat(adapter)` and custom adapters

This is the constructor for the `Chat` class. It takes an adapter as an argument. The adapter is an object that contains the methods and properties that the `Chat` class uses to interact with the model.

Using this constructor directly allows you to use your own custom adapters with the `Chat` class. This is useful if you want to use a different model or if you want to use a different API that is not supported by the built-in adapters. It is also useful if you want to mock the adapter for testing purposes.

#### Inline adapter

```ts

import { Chat } from "ragged/chat"
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"

const countingAdapter: BaseChatAdapter = {
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        let totalCharacters = 0;

        for (const message of request.history) {
            totalCharacters += message.text.length;
        }

        return {
            history: [
                { type: "bot", text: "Your request had a total of " + totalCharacters + " characters in it." }
            ]
        };
    }
}

const count = new Chat(countingAdapter);

const countResponse = await count.chat("This is a test message.");
console.log(countResponse.at(-1)?.text); // Your request had a total of 23 characters in it.

```

#### Object adapter

You could also create a custom adapter as an object and pass it to the constructor. This is useful if you want to store the adapter in a separate variable or if you want to reuse the adapter in multiple places.

```ts
import { Chat } from "ragged/chat"

// You can also put your adapter in a separate variable, like so:

const countingAdapter: BaseChatAdapter = {
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        const totalCharacters = request.history.reduce((acc, message) => acc + message.text.length, 0);
        return {
            history: [
                { type: "bot", text: "Your request had a total of " + totalCharacters + " characters in it." }
            ]
        };
    }
}

const countResponse = await count.chat("This is a test message.");
console.log(countResponse.at(-1)?.text); // Your request had a total of 23 characters in it.
```

#### Class adapter

You could also create a custom adapter as a class and pass it to the constructor. This is useful if you want to use inheritance or if you want to use a constructor function, or store state.

```ts

import { Chat } from "ragged/chat"
import type { BaseChatAdapter, ChatRequest, ChatResponse } from "ragged/chat/adapter"

class AppendingAdapter implements BaseChatAdapter {
    constructor(private history: string = "") { }

    async chat(request: ChatRequest): Promise<ChatResponse> {

        this.history += "\n" + request.history.map(message => message.text).join("n");

        return {
            history: [
                { type: "bot", text: this.history }
            ]
        };
    }
}

const appending = new Chat(new AppendingAdapter("This is the start of the file."));

const appendResponse = await appending.chat("Hello, world!");
console.log(appendResponse.at(-1)?.text); // This is the start of the file.\nHello, world!
const appendResponse2 = await appending.chat("This is a test message.");
console.log(appendResponse2.at(-1)?.text); // This is the start of the file.\nHello, world!\nThis is a test message.
```

---

## Tool Calling

Ragged allows you to further extend its functionality using tools. This gives you the power to integrate custom behavior or commands directly into your chat-based application.

## Using Tools to fetch and display the contents of a URL

Here is an example of how to use a tool with Ragged's chat to fetch the contents of a URL and display it in the chat.

```ts
import { config } from 'dotenv';
config();
import { Chat } from "ragged/chat"
import { Tool } from "ragged/tools";

// Instantiate the Chat object with the OpenAI provider
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// Perform the query with the tool
const response = await c.chat("Fetch and display the contents of https://feeds.bbci.co.uk/news/world/rss.xml", {
    tools: [buildFetchTool()],
    model: "gpt-4"
});

// Output the final text response. We don't need to care about the intermediate messages, tool calling is handled automatically.
// "Here are some of the latest news from around the world according to the BBC: ..."
console.log(response.at(-1)?.text); 

// ===================  The tool definition ===================

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
```

In this example:

* Chat Initialization: We initialize a Chat instance using the OpenAI provider.
* Tool Query: We perform a chat query that uses a custom tool to fetch and display the contents of a specified URL.
* Tool Definition: The buildFetchTool function defines a tool that performs a simple GET request to retrieve the contents of a URL.

The fetchTool object includes:

* ID and Description: Basic metadata for the tool.
* Props: Describes the expected input, ensuring the tool receives the correct data structure.
* Handler: The function that processes the input and returns the output. It handles the URL fetching logic and manages errors gracefully.

With this setup, Ragged can seamlessly integrate external data fetching capabilities into its chat interactions, enabling more dynamic and interactive applications.

## Autonomous Agents

Ragged supports autonomous agents. These are tools that can be used to perform tasks without user input. They can be used to automate repetitive tasks, provide real-time information, or interact with external services.

### What is an agent?

An agent is an autonomous tool that can perform tasks without user input. It can be used to automate repetitive tasks, provide real-time information, or interact with external services.

### How do agents work?

In Ragged, agents are very simple to implement. They are just pieces of code that take input and return output in a recursive or repetive way. 

The simplest agent has the following main components:

* Some user input
* A recursive loop which calls an LLM to work on the input
* A stop condition which determines when the agent should stop

### Incrementing Agent Example

Here is an example of a simple agent that generates a conversation with an LLM:

```ts
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
```

### Multiple Agents Example

Agents can get very complex, with multiple agents running at the same time. Here is an example of a simple chat application that uses multiple agents to generate a conversation: [examples/nodejs/agents-multiple.ts](examples/nodejs/agents-multiple.ts).