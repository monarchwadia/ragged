
# Ragged

![An image of an audio cable with a ragged blue denim insulation covering. The caption in the foreground reads "Ragged, the universal LLM client for JavaScript."](./ragged-social-card.jpeg)

## What is this?

Ragged is a 0-dependency, lightweight, universal LLM client for JavaScript and Typescript. It makes it easy to access LLMs via a simple, easy to understand, and uncomplicated API.

The heart of Ragged is a simple abstraction that allows you to interact with LLMs in a consistent way, regardless of the provider or model you are using. This abstraction makes it easy to switch between different LLMs without having to change your code.

Ragged is designed to be simple, easy to use, and flexible. It is built with modern JavaScript and TypeScript features, and it is designed to be extensible and customizable. Ragged is a powerful tool for building chat-based applications, bots, and conversational interfaces as well as for use in RAG pipelines and other NLP tasks.

## Installation

Installing Ragged is very easy.

```bash
# either
npm install --save-exact ragged
# or
pnpm add --save-exact ragged
# or
yarn add --exact ragged
```

That's it. You're ready to go!

## Ragged's Chat Completion Abstraction

Ragged's core Chat Completion abstraction is an easy-to-use `Message` interface.

```ts
import type { Message } from "ragged";

const history: Message[] = [
    { type: "user", text: "What is a rickroll?" },
    { type: "bot", text: "A rickroll is a prank..." }
]
```

Because this interface is standard, a lot of operations become very easy to perform. For example, you can access the last message in the history using the `.at` method.

```ts
console.log(history.at(-1)?.text); // A rickroll is a prank...
```

Or, you can simply modify history by pushing new messages to the array.

```ts
history.push({ type: "bot", text: "I'm a bot!" });
```

About 90% of Ragged is built around this simple interface. (The other 10% is for Embeddings, which has its own analog to the `Message` type). This standard interface is the same across all LLM providers, making it easy to switch between providers without changing your code.

In the following sections, we will show you how to use Ragged to perform many complex operations with ease, including chat completion, tool calling, multimodal input, agent creation, and more.

## Table of Contents 

- [Ragged](#ragged)
  - [What is this?](#what-is-this)
  - [Installation](#installation)
  - [Ragged's Chat Completion Abstraction](#raggeds-chat-completion-abstraction)
  - [Table of Contents](#table-of-contents)
  - [Simple chat](#simple-chat)
  - [Message History](#message-history)
    - [Accessing message history](#accessing-message-history)
    - [Setting message history](#setting-message-history)
  - [Freezing History](#freezing-history)
  - [Image Input, a.k.a. Multimodal](#image-input-aka-multimodal)
  - [Tool Calling](#tool-calling)
    - [Tool Props](#tool-props)
    - [Raw request and response objects](#raw-request-and-response-objects)
  - [Autonomous Agents](#autonomous-agents)
    - [What is an agent?](#what-is-an-agent)
    - [How agents work in Ragged](#how-agents-work-in-ragged)
    - [Incrementing Agent Example](#incrementing-agent-example)
    - [Multiple Agents Example](#multiple-agents-example)
  - [Logging](#logging)
  - [Official LLM Adapters](#official-llm-adapters)
    - [OpenAI](#openai)
    - [Cohere](#cohere)
    - [OpenAI Assistants](#openai-assistants)
    - [Azure OpenAI](#azure-openai)
    - [Azure OpenAI Assistants](#azure-openai-assistants)
    - [Ollama](#ollama)
  - [Feature Roadmap](#feature-roadmap)
    - [Built-in Providers and Models](#built-in-providers-and-models)
  - [Custom LLM Adapters](#custom-llm-adapters)
    - [Rules for custom adapters](#rules-for-custom-adapters)
    - [Examples of custom adapters](#examples-of-custom-adapters)
      - [Inline adapter](#inline-adapter)
      - [Object adapter](#object-adapter)
      - [Class adapter](#class-adapter)
    - [Resource Pooling, or, how to use multiple LLMs in the same chat history](#resource-pooling-or-how-to-use-multiple-llms-in-the-same-chat-history)
- [Development Instructions](#development-instructions)
  - [Prerequisites](#prerequisites)
  - [Development Instructions](#development-instructions-1)
  - [Manual Testing](#manual-testing)
  - [PollyJS recordings](#pollyjs-recordings)
    - [How to refresh PollyJS Recordings](#how-to-refresh-pollyjs-recordings)
    - [Understanding the folder structure](#understanding-the-folder-structure)
      - [Main folder](#main-folder)
      - [Supporting folders](#supporting-folders)

## Simple chat

Ragged is very easy to use. Here is a complete application that shows chat completion.

```ts
import { Chat } from "ragged"

// create a new Chat instance with the OpenAI provider
const c = Chat.with({
    provider: 'openai',
    config: { apiKey: process.env.OPENAI_API_KEY }
});

// chat with the model
const {history} = await c.chat('What is a rickroll?');

// {history}.at(-1) is a native JS array method for the last element
console.log(history.at(-1)?.text); // A rickroll is a prank...
```

Nothing to it!


## Message History

> [!TIP]
> You can see an example of how to use the history functionality in the examples folder. [Click here](examples/nodejs/history.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example history.ts`.

By default, each instance of the `Chat` object records the history of the conversation. You can access the history of the conversation using the `.history` property.

```ts
console.log(c.history);
```

This array gets updated with each call to the `chat` method.

You can also set the history of the conversation by setting the `.history` property to an array of messages. This way, you can control the history of the conversation.

```ts
const history = c.history;
```

### Accessing message history

You can access the history using the `.history` property.

```ts
console.log(c.history); // [ { text: 'What is a rickroll?' ... ]
```

You can also access the last message in the history using the `.at` method.

```ts
console.log(c.history.at(-1)?.text); // A rickroll is a prank...
```

> [!TIP]
> The `.at` method is a native JavaScript array method that allows you to access elements in an array using negative indices. This is useful for accessing the last element in an array. The `.at()` method has been available in JavaScript since ES2022. [See MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at).

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

> [!WARNING]
> Never modify elements inside the history object directly. Always set the `.history` property to a new array. This prevents unexpected behavior and makes the code more predictable.

## Freezing History

> [!TIP]
> You can see an example of how to use the freezing functionality in the examples folder. [Click here](examples/nodejs/frozen.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example frozen.ts`.

You can turn recording on and off by passing a boolean to the `.record` method. To turn recording off, pass `false`. We call this "freezing" the conversation. When the conversation is frozen, the history will not be updated with each call.

```ts
// Recording is on by default. Here is how you can turn it off.
c.record(false);
```

This is useful when you want to create multiple responses to a single prompt. Then, you can prompt the model multiple times. Each time, the model will respond as if it were the first time, and the history will not be updated with each call.

```ts
// Turn off history
c.record(false);

// Chat with the model
const response1 = await c.chat('Remember that my name is "John."'); 
// Response: Okay! I will remember that your name is "John."

const response2 = await c.chat('What is my name?');
// Response: I do not know your name. Please tell me.
```

## Image Input, a.k.a. Multimodal

Ragged supports multimodal input. This means that you can pass images to the LLM along with text. This is useful for creating more interactive and engaging chat experiences.

Currently we only support base64 encoded images, but will expand this support in the future.

```ts
// chat with the model
const { history } = await c.chat([
    {
        type: "user",
        text: "What do these images contain? Describe them.",
        attachments: [
            {
                type: "image",
                payload: {
                    data: "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
                    encoding: "base64_data_url",
                    mimeType: "image/png",
                },
            },
            {
                type: "image",
                payload: {
                    encoding: "base64_data_url",
                    data: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC",
                    mimeType: "image/png",
                },
            },
        ],
    },
], {
    model: "gpt-4o"
});

// log the messages
console.log(history.at(-1)?.text);

// Output:
// The first image is an emoji of a face with heart-shaped eyes, typically used to express love, adoration, or strong liking for something or someone.
// The second image is a gradient background that transitions from dark to light colors. The colors include black, brown, orange at the top, and transition through white and blue towards the bottom.

```

## Tool Calling

> [!TIP]
> You can see 3 examples of how to use the tool calling functionality in the examples folder. The [Simple Example](examples/nodejs/tool-calling-simple.ts) shows a very simple tool calling example that returns some mock data (although the LLM thinks it's coming from an actual website). The [Fetch BBC News RSS Feed Example](examples/nodejs/tool-calling-bbc-rss.ts) is a simple, single-tool example that shows how to give the LLM the ability to `fetch` the latest news from the BBC RSS feed. The [List Files](examples/nodejs/tool-calling-list-files.ts) example is a more complex example that shows how to use multiple tools in order to let the LLM read your local file system. These are fully working examples, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example tools.ts`.

Ragged allows you to further extend its functionality using tools. This gives you the power to integrate custom behavior or commands directly into your chat-based application.

Tools are very powerful! You can use tools to fetch data from external APIs, perform calculations, generate dynamic content, and much more. Tools can be used to extend the capabilities of the LLM and create more interactive and dynamic chat experiences.

To define a tool, first we import the Tool type from Ragged and then define a tool object.

```ts
import type { Tool } from "ragged";

const getHomepageTool: Tool = {
    id: "get-homepage-contents",
    description: "Gets the contents of my homepage.",
    handler: async () => {
        return Promise.resolve("Hello! My name is John! I'm a student at a community college!")
    }
}
```

In this example, we define a tool called `getHomepageTool`. This tool has the following properties:

- `id`: A unique identifier for the tool. This identifier is how the LLM references the tool in the chat. The LLM will be aware of the tool's existence and will be able to use it in the chat.
- `description`: A brief description of what the tool does. This description is used to help the LLM understand the purpose of the tool.
- `handler` is a function that processes the input and returns the output. It handles the logic of the tool and manages errors gracefully.

Once you have defined a tool, you can use it in a chat interaction by passing it to the `chat` method.

```ts
const { history } = await c.chat("Get the contents of my homepage.", {
    // Pass the tool to the chat method.
    tools: [getHomepageTool],
    model: "gpt-3.5-turbo"
});

console.log(history.at(-1)?.text);
// RESPONSE: I retrieved the contents of your homepage. It says: "Hello! My name is John! I'm a student at a community college!"
```

Putting it all together, here's what it looks like:

```ts
import { Chat } from "ragged"
import type { Tool } from "ragged";

const getHomepageTool: Tool = {
    id: "get-homepage-contents",
    description: "Gets the contents of my homepage.",
    props: {
        type: "object",
        description: "The properties of the tool.",
        props: {}
    },
    handler: async () => {
        return Promise.resolve("Hello! My name is John! I'm a student at a community college!")
    }
}

const c = Chat.with({
    provider: 'openai',
    config: {
        apiKey: process.env.OPENAI_API_KEY 
        // You can also pass the organization ID here.
        organizationId: process.env.OPENAI_ORGANIZATION_ID
    }
});

const { history } = await c.chat("Get the contents of my homepage.", {
    // Pass the tool to the chat method.
    tools: [getHomepageTool],
    model: "gpt-3.5-turbo"
});

console.log(history.at(-1)?.text);

// RESPONSE: I retrieved the contents of your homepage. It says: "Hello! My name is John! I'm a student at a community college!"
```

### Tool Props

The `Tool` object can also take an optional `props` object. This object allows the LLM to pass pass additional information to the tool handler. This can be useful if you want the LLM to pass configuration options, data, or other information to the tool handler.

Here is an example of how to use the `props` object:

```ts
import type { Tool } from "ragged";

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
    handler: async (props: string) => {
        // Props are passed to the handler function as a string.
        // This string needs to be parsed into an object before it can be used.
        // Several examples can be seen in the `/examples` folder.
    }
}
```

Here, we define a tool called `fetchTool`. This tool has a `props` object that describes the expected input for the tool. The `props` object contains a `url` property that is required and must be a string. The `handler` function processes the input and returns the output.

> [!WARNING]
> It's important to note that the LLM can hallucinate the props object. This means that the LLM can pass props which are not defined in the props object. This is dangerous, as it can lead to unexpected behavior. To prevent this, you should always validate the props object before using it in your tool handler.

### Raw request and response objects

You can get the raw request and response objects from the tool handler by using the `raw` property. This property contains the raw vanillla `Request` and `Response` objects that were sent to and received from the tool handler.

```ts
const { history, raw } = await c.chat("What is a rickroll?");
console.log(history.at(-1)?.text); // A rickroll is a prank...
console.log(raw?.requests); // All API requests done during the chat (there can be more than 1 if you are doing tool calling)
console.log(raw?.responses); // All API responses done during the chat (there can be more than 1 if you are doing tool calling)
```

## Autonomous Agents

> [!TIP]
> You can see 2 examples of how to use the agent functionality in the examples folder. The [Simple Example](examples/nodejs/agents-simple.ts) shows a very simple agent that increments a number automatically. The [Multiple Agents Example](examples/nodejs/agents-multiple.ts) uses multiple agents to generate tweets. These are fully working examples, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example agents-simple.ts` or `pnpm run:example agents-multiple.ts`.

### What is an agent?

Many LLM frameworks support autonomous agents. These are tools that can be used to perform tasks without user input. They can be used to automate repetitive tasks, provide real-time information, or interact with external services.

### How agents work in Ragged

In many LLM frameworks, agents are complex and require a lot of setup. But in Ragged, agents are very simple to implement using normal, easy-to-understand code. Agents are just pieces of code that take input and return output in a recursive or repetive way.

The simplest agent has the following main components:

* A starting state
* A loop which calls an LLM to mutate the state recursively
* A stop condition which determines when the agent should stop

Using these components, you can create agents that perform a wide variety of tasks. 

### Incrementing Agent Example

Here is an example of a simple agent that generates a conversation with an LLM. You can also access it here: [examples/nodejs/agents-simple.ts](examples/nodejs/agents-simple.ts). If you run this code, you will see the agent incrementing a number automatically.

```ts
/**
 * This example demonstrates how to build a simple agent that increments a number automatically.
 * This is a very simple example, but the principles can be applied to more complex agents.
 * 
 * EXPECTED OUTPUT: 
 * The current number is 1.
 * The current number is 2.
 * The current number is 3.
 * The current number is 4.
 * The current number is 5.
 * The current number is 6.
 * The current number is 7.
 * The current number is 8.
 * The current number is 9.
 * The current number is 10.
 * The agent has reached the stop condition.
 */

import { config } from 'dotenv';
config();
import { Chat } from "ragged"

// Define the main function
async function main() {
    const c = Chat.with({
        provider: 'openai',
        config: { apiKey: process.env.OPENAI_API_KEY }
    });
    c.record(false);

    // Start with the initial state
    let currentState = `The current number is 1.`;

    // Define the stop condition
    const stopCondition = () => currentState.includes("10");

    // Start iterating
    console.log(currentState);
    while (!stopCondition()) {
        currentState = await getNextNumber(c, currentState);
        console.log(currentState);
    }

    // Print the stop condition
    console.log("The agent has reached the stop condition.");
}

// Define the agent function

async function getNextNumber(c: Chat, input: string): Promise<string> {
    // Call the LLM with the input
    const { history } = await c.chat([
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
    const lastMessage = history.at(-1)?.text;
    return lastMessage || "";
}

// run the code
await main();
```

### Multiple Agents Example

Agents can get very complex, with multiple agents running at the same time. Here is an example of a simple chat application that uses multiple agents to generate a conversation: [examples/nodejs/agents-multiple.ts](examples/nodejs/agents-multiple.ts).

## Logging

Ragged has a built-in logging system that allows you to log messages to the console. This is useful for debugging and troubleshooting your code. You can use the `Logger` class to control the logging level and format of the log messages.

```ts
import { Logger } from "ragged";
Logger.setLogLevel('debug'); // make it verbose
Logger.setLogLevel('info'); // default
Logger.setLogLevel('warn'); // only log warnings
Logger.setLogLevel('error'); // only log errors
Logger.setLogLevel('none'); // turn off logging altogether
```
------

## Official LLM Adapters

Ragged supports multiple LLM providers out of the box. You can use these providers to interact with the LLMs and generate responses to your prompts.

### OpenAI

```ts
const c = Chat.with({
    provider: 'openai',
    config: { apiKey: process.env.OPENAI_API_KEY }
});
await c.chat('What is a rickroll?', { model: 'gpt-4' });
```

### Cohere

> [!WARNING]
> This is a new provider, and tool calling is not yet functional.

```ts
const c = Chat.with({
    provider: 'cohere',
    config: { apiKey: process.env.COHERE_API_KEY }
});
await c.chat('What is a rickroll?', { model: 'command-nightly' });
```

### OpenAI Assistants

> [!WARNING]
> This is a new provider, and tool calling is not yet functional.

The OpenAI Assistants adapter allows you to interact with the OpenAI Assistants API. The adapter creates assistants, threads, messages, and runs under the hood for you. As a result, you get a relatively streamlined experience.

```ts
const c = Chat.with({
    provider: 'openai-assistants',
    config: {
    apiKey: '123',
    assistant: {
        model: 'model',
        description: 'description',
        instructions: 'instructions',
        name: 'name',
    }
    }
});
await c.chat('What is a rickroll?', { model: 'gpt-4o' });
```

### Azure OpenAI

> [!WARNING]
> This is a new provider, and tool calling is not yet functional.

```ts
const c = Chat.with({
    provider: 'azure-openai',
    config: {
    apiKey: '123',
    apiVersion: 'v1',
    resourceName: 'resource',
    deploymentName: 'deployment'
    }
});
await c.chat('What is a rickroll?', { model: 'gpt-4o' });
```

### Azure OpenAI Assistants

> [!WARNING]
> This is a new provider, and tool calling is not yet functional.

The Azure OpenAI Assistants adapter allows you to interact with the OpenAI Assistants API. The adapter creates assistants, threads, messages, and runs under the hood for you. As a result, you get a relatively streamlined experience.

```ts
const c = Chat.with({
provider: 'azure-openai-assistants',
config: {
    apiKey: '123',
    apiVersion: 'v1',
    resourceName: 'resource',
    deploymentName: 'deployment',
    modelName: 'model'
}
});
await c.chat('What is a rickroll?', { model: 'gpt-4o' });
```

### Ollama

> [!WARNING]
> This is a new provider, and tool calling is not yet functional.

```ts
const c = Chat.with({
    provider: 'ollama',
    config: {}
})
await c.chat('What is a rickroll?', { model: 'gpt-4o' });
```

## Feature Roadmap

| Feature                            | Is Working | API Frozen* |
| ---------------------------------- | ---------- | ----------- |
| Chat Completion                    | 🟢 100%     | ❌           |
| Embeddings Generation              | 🟢 100%     | ❌           |
| In-built Message History           | 🟢 100%     | ❌           |
| Write your own custom LLM adapters | 🟢 100%     | ❌           |
| Tool Calling                       | 🟡 30%      | ❌           |
| Multimodal Input                   | 🟡 30%      | ❌           |
| Autonomous Agents                  | 🟢 100%     | ❌           |
| Message History                    | 🟢 100%     | ❌           |
| Helpful Errors                     | 🟢 100%     | ❌           |
| Rate Limits                        | 🟡 30%      | ❌           |
| Streaming                          | 🔴 0%       | ❌           |
| Model Fine-Tuning                  | 🔴 0%       | ❌           |
| Multimodal Generation              | 🔴 0%       | ❌           |

\* By "API Frozen," we mean that these features will not change in a breaking way. We will add new features, but we will not change the existing interface in a way that breaks existing code.


### Built-in Providers and Models

The following table lists the providers and models that Ragged Comes with out of the box. If you want to use a different provider or model, you can create a custom adapter.

| Provider                | Models                  | Chat | Embeddings | Tool Calls | Multimodal |
| ----------------------- | ----------------------- | ---- | ---------- | ---------- | ---------- |
| OpenAI                  | GPT: 4o, 4T, 4, 3.5     | ✅    | ✅          | ✅          | ✅          |
| OpenAI Assistants       | GPT: 4o, 4T, 4, 3.5     | ✅    | ❌          | ❌          | ❌          |
| Azure OpenAI            | GPT: 4, 4T, 3.5         | ✅    | ❌          | ❌          | ❌          |
| Azure OpenAI Assistants | GPT: 4, 4T, 3.5         | ✅    | ❌          | ❌          | ❌          |
| Together                | Several OSS Models      | ❌    | ❌          | ❌          | ❌          |
| Cohere                  | CommandR, Command       | ✅    | ❌          | ❌          | ❌          |
| Anthropic               | Claude 2, Claude 3      | ❌    | ❌          | ❌          | ❌          |
| Mistral                 | 7B, 8x7B, S, M & L      | ❌    | ❌          | ❌          | ❌          |
| Groq                    | Lama2-70B, Mixtral-8x7b | ❌    | ❌          | ❌          | ❌          |
| DeepSeek                | Chat and Code           | ❌    | ❌          | ❌          | ❌          |
| Ollama                  | All models              | ✅    | ❌          | ❌          | ❌          |
| Google Gemini           | Gemini: Flash, Pro      | ❌    | ❌          | ❌          | ❌          |
| Hugging Face            | OSS Model               | ❌    | ❌          | ❌          | ❌          |


## Custom LLM Adapters

Usually, we would use `Chat.with` to create a new instance of the `Chat` class. This is the easiest way to create a new instance of the `Chat` class, as it automatically selects the correct adapter based on the provider name.

However, you can also create a new instance of the `Chat` class using the constructor directly. This allows you to use your own custom adapters with the `Chat` class. This is useful if you want to use a different model or if you want to use a different API that is not supported by the built-in adapters. It is also useful if you want to mock the adapter for testing purposes.

### Rules for custom adapters

Custom adapters must implement the `BaseChatAdapter` interface. This interface defines the `chat` method, which is used to interact with the LLM provider. 

The `chat` method takes a `ChatRequest` object as input and returns a `ChatResponse` object as output.

You do not need to manage history or state in your custom adapter. The `Chat` class will handle that for you. You just need to return the latest messages from the LLM in the return object of the `chat` method.

### Examples of custom adapters

Here are some examples of how to create a new instance of the `Chat` class using the constructor and custom adapters.

#### Inline adapter

> [!TIP]
> You can see an example of how to use an inline adapter in the examples folder. [Click here](examples/nodejs/custom-adapter-inline.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example custom-adapter-inline.ts`.

An inline adapter is a simple way to create a custom adapter. You can define the adapter inline when you create a new instance of the `Chat` class.

```ts
import { Chat } from "ragged"
import type { ChatAdapterRequest ,ChatAdapterResponse } from "ragged"

const c = new Chat({
    chat: async (request: ChatAdapterRequest): Promise<ChatAdapterResponse> => {
        // Make your API calls here, then return the mapped response.
        // request.context.apiClient.post('https://some-llm.com', { text: request.text })
        return { history: [] };
    }
});
```

#### Object adapter

> [!TIP]
> You can see an example of how to use an object adapter in the examples folder. [Click here](examples/nodejs/custom-adapter-object.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example custom-adapter-object.ts`.

You could also create a custom adapter as an object and pass it to the constructor. This is useful if you want to store the adapter in a separate variable or if you want to reuse the adapter in multiple places.

```ts
import { Chat } from "ragged"
import type { BaseChatAdapter } from "ragged"

const adapter: BaseChatAdapter = {
    chat: async (request: ChatAdapterRequest): Promise<ChatAdapterResponse> => {
        // Make your API calls here, then return the mapped response.
        // request.context.apiClient.post('https://some-llm.com', { text: request.text })
        return { history: [] };
    }
}

const c = new Chat(adapter);
```

#### Class adapter

> [!TIP]
> You can see an example of how to use an object adapter in the examples folder. [Click here](examples/nodejs/custom-adapter-class.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example custom-adapter-class.ts`.

You could also create a custom adapter as a class and pass it to the constructor. This is useful if you want to use inheritance or if you want to use a constructor function, or store state.

```ts
import { Chat, BaseChatAdapter, ChatAdapterRequest, ChatAdapterResponse } from "ragged"

class ExampleAdapter implements BaseChatAdapter {
    async chat(request: ChatAdapterRequest): Promise<ChatAdapterResponse> {
        // Make your API calls here, then return the mapped response.
        // request.context.apiClient.post('https://some-llm.com', { text: request.text })
        return { history: [] };
    }
}

const c = new Chat(new ExampleAdapter());
```

### Resource Pooling, or, how to use multiple LLMs in the same chat history

Resource pooling is a technique used to manage resources efficiently. It allows you to use multiple LLMs with different API keys in the same chat history. This is useful if you want to use different models or different providers in the same chat session.

Since every app will have some level of custom resource pooling, Ragged does not provide a built-in resource pooling mechanism. Instead, you can use the `Chat` class and its adapters mechanism to manage resource pooling in your app.

See the [Resource Pooling](examples/nodejs/resource-pooling.ts) example in the examples folder for a working example of how to use resource pooling in Ragged.

# Development Instructions

These instructions will get you a copy of Ragged up and running on your local machine for development and testing purposes. If you are not working on Ragged's own source code, you can skip all documentation past this point.

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

You will need to have Node.js installed on your machine. You can download it from the [official website](https://nodejs.org/), but we recommend using a version manager like `nvm` or `nodenv` to manage your Node.js installations.

You will also need pnpm. Please see the [official website](https://pnpm.io/) for installation instructions.

## Development Instructions

Development is easy. First, clone the repository to your local machine.

You will then have to clone the repository to your local machine.

```bash
# This will create a new directory called "ragged" in your current directory, and clone the repository into it.
git clone git@github.com:monarchwadia/ragged.git
```

Then, change into the `ragged` directory.

```bash
cd ragged
```

Then, install all dependencies for all projects. In `pnpm` this is easy.


```bash
# -r is short for --recursive, which means the command is run in all projects.
# Projects are defined in the `pnpm-workspace.yaml` file.
pnpm -r install
```

Now that you have `pnpm` installed, you are mostly ready to go. You can enter TDD mode using the following command (or by setting it up on your IDE). 

```bash
# make sure youre in the /ragged subfolder
cd ragged
pnpm tdd
```

This will run the tests in watch mode. You can now make changes to the code and see the tests run automatically.

If you want to run the tests once, you can use the following command.

```bash
# make sure youre in the /ragged subfolder
cd ragged
pnpm test
```

## Manual Testing

To manually test your local build of Ragged without publishing it to `npm`, you can use the following command.

```bash
# make sure youre in the /ragged subfolder
cd ragged
pnpm build
pnpm link --global
```

> [!IMPORTANT]  
> It's absolutely necessary to rebuild the project after every code change that you want to test. This is because the `pnpm link --global` command creates a symlink to the build output, not to the source code. Thankfully it is not necessary to run `pnpm link --global` after every build. Usually this is not a problem because using Test-Driven Development, i.e. the `pnpm tdd` command, we know the outcome of our changes without building them. Therefore, we can build only when we want to test the changes manually.

This will create a global symlink to your local build of Ragged. You can then use this build in other projects by running the following command in a project that uses Ragged:

```bash
pnpm link --global ragged
```

This will link the global Ragged build to your project. You can now use your local build of Ragged in your project.

## PollyJS recordings

PollyJS is a tool that we use to record and replay API interactions. This is useful for testing and development, as it allows us to test our code against real API responses without making actual API calls, and without having to worry about rate limits or other issues. It also removes the need to manually mock API responses, which can be time-consuming and error-prone.

PollyJS recordings are stored in the `recordings` folder. Each recording is a JSON file that contains the request and response data for a single API interaction. The recordings are used by the unit tests to simulate API interactions. When the tests run, they check the recordings to see if there is a matching response for the request. If there is, the response is used. If there isn't, then the test makes a real API call and records the response.

### How to refresh PollyJS Recordings

First, make sure you have the `.env` file set up with the necessary API keys. You can copy the `.env.sample` file to `.env` and fill in the necessary API keys.

If you want to refresh a specific PollyJS recording, then you'll have to pass `{ refresh: true }` to `startPollyRecording` in the test file. This will cause the test to make a real API call and record the response, overwriting the existing recording.

```bash
    const polly = startPollyRecording("name of the test", { refresh: true });
```

If you want to refresh ALL PollyJS recordings, you can set the `REFRESH_POLY_RECORDINGS` environment variable to `true` before running the tests. This will cause the tests to make real API calls and record the responses, overwriting any existing recordings.

```bash
REFRESH_POLY_RECORDINGS=true pnpm test
```

### Understanding the folder structure

Ragged has a simple folder structure. Here is a brief overview of the folders and their contents.

#### Main folder

- `ragged` contains the main codebase for Ragged. This is where you will find the source code for the library itself.

Within the `ragged` folder, you will find the following files and folders:

- `buildConfig` contains the configuration for the build process. We use esbuild to build the library. This folder contains the configuration for esbuild.
- `recordings` contain Pollyjs recordings of various API calls. These recordings are used for testing and development. Do not modify these files directly. Instead, work with Pollyjs to record new interactions.
- `src` contains the source code for Ragged. This is where you will find the main codebase for the library.
- `src/chat` contains the code for the `Chat` class.
- `src/chat/adapter` contains the code for the built-in adapters for the `Chat` class. These adapters are used to interact with the various LLM providers. You can add new adapters here if you want to support a new provider.
- `src/public` is a folder that dynamically defines the public API for the ragged `npm` module (i.e. what you can import using `import * from "ragged/....."` ). The folder structure in `src/public` is mapped to `package.json`'s `exports` field, and is also mapped to `esbuild`'s `entryPoints` field. This is kind of neat and I don't know if this is a common pattern, but it works well for us.
- `src/support` contains support code that is used by the main codebase. This includes the API client, custom errors, JSON parsing, logging, and other shared code.
- `src/tools` contains the code for the `Tool` class, which enables tool calls in Ragged.
- `/test` contains test utilities, used in `*.test.ts` files.
- `.env.sample` is a sample `.env` file that you can use to set environment variables. Right now it only contains placeholders for various LLM API keys, and is mainly used in the unit tests to generate PollyJS recordings.

#### Supporting folders

- `.github` contains GitHub Actions workflows that are used to automate the testing and deployment process. I.e. this is the CI/CD pipeline for deploying Ragged to `npm` and for deploying the documentation to GitHub Pages.
- `.vscode` contains Visual Studio Code settings that are used to configure the editor for Ragged development. You can ignore this folder if you are not using Visual Studio Code.
- `documentation` contains a Docusaurus project that is used to generate the documentation for Ragged. Currently, this is out of date and not deployed. We may delete this folder in the future, or we may update it and deploy it.
- `examples` contains example code that demonstrates how to use Ragged. This is useful for testing and learning how to use Ragged. Please refer to the README in each examples folder for more information on how to run the examples.
- `scratch` contains scratch files that are used for testing and debugging. These files are not part of the main codebase. They are used for quick testing and prototyping. You can ignore this folder if you are not familiar with it.


