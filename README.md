
# Ragged

![An image of an audio cable with a ragged blue denim insulation covering. The caption in the foreground reads "Ragged, the universal LLM client for JavaScript."](./ragged-social-card.jpeg)

## What is this?

Ragged is a 0-dependency, lightweight, universal LLM client for JavaScript and Typescript. It makes it easy to access LLMs via a simple, easy to understand, and uncomplicated API.

## Table of Contents 

- [Ragged](#ragged)
  - [What is this?](#what-is-this)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Simple chat](#simple-chat)
  - [Message History](#message-history)
    - [Accessing message history](#accessing-message-history)
    - [Setting message history](#setting-message-history)
  - [Freezing History](#freezing-history)
  - [Tool Calling](#tool-calling)
    - [Tool Props](#tool-props)
  - [Autonomous Agents](#autonomous-agents)
    - [What is an agent?](#what-is-an-agent)
    - [How agents work in Ragged](#how-agents-work-in-ragged)
    - [Incrementing Agent Example](#incrementing-agent-example)
    - [Multiple Agents Example](#multiple-agents-example)
  - [Official LLM Adapters](#official-llm-adapters)
    - [OpenAI](#openai)
    - [Cohere](#cohere)
    - [OpenAI Assistants](#openai-assistants)
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

That's it. You're ready to go!

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
const messages = await c.chat('What is a rickroll?');

// messages.at(-1) is a native JS array method for the last element
console.log(messages.at(-1)?.text); // A rickroll is a prank...
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

## Tool Calling

> [!TIP]
> You can see 3 examples of how to use the tool calling functionality in the examples folder. The [Simple Example](examples/nodejs/tool-calling-simple.ts) shows a very simple tool calling example that returns some mock data (although the LLM thinks it's coming from an actual website). The [Fetch BBC News RSS Feed Example](examples/nodejs/tool-calling-bbc-rss.ts) is a simple, single-tool example that shows how to give the LLM the ability to `fetch` the latest news from the BBC RSS feed. The [List Files](examples/nodejs/tool-calling-list-files.ts) example is a more complex example that shows how to use multiple tools in order to let the LLM read your local file system. These are fully working examples, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example tools.ts`.

Ragged allows you to further extend its functionality using tools. This gives you the power to integrate custom behavior or commands directly into your chat-based application.

Tools are very powerful! You can use tools to fetch data from external APIs, perform calculations, generate dynamic content, and much more. Tools can be used to extend the capabilities of the LLM and create more interactive and dynamic chat experiences.

To define a tool, first we import the Tool type from Ragged and then define a tool object.

```ts
import { ChatTypes } from "ragged";

const getHomepageTool: ChatTypes['Tool'] = {
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
const response = await c.chat("Get the contents of my homepage.", {
    // Pass the tool to the chat method.
    tools: [getHomepageTool],
    model: "gpt-3.5-turbo"
});

console.log(response.at(-1)?.text);
// RESPONSE: I retrieved the contents of your homepage. It says: "Hello! My name is John! I'm a student at a community college!"
```

Putting it all together, here's what it looks like:

```ts
import { Chat } from "ragged"
import { ChatTypes } from "ragged";

const getHomepageTool: ChatTypes['Tool'] = {
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

const response = await c.chat("Get the contents of my homepage.", {
    // Pass the tool to the chat method.
    tools: [getHomepageTool],
    model: "gpt-3.5-turbo"
});

console.log(response.at(-1)?.text);

// RESPONSE: I retrieved the contents of your homepage. It says: "Hello! My name is John! I'm a student at a community college!"
```

### Tool Props

The `Tool` object can also take an optional `props` object. This object allows the LLM to pass pass additional information to the tool handler. This can be useful if you want the LLM to pass configuration options, data, or other information to the tool handler.

Here is an example of how to use the `props` object:

```ts
import { ChatTypes } from "ragged";

const fetchTool: ChatTypes['Tool'] = {
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

// run the code
await main();
```

### Multiple Agents Example

Agents can get very complex, with multiple agents running at the same time. Here is an example of a simple chat application that uses multiple agents to generate a conversation: [examples/nodejs/agents-multiple.ts](examples/nodejs/agents-multiple.ts).

------

## Official LLM Adapters

Ragged supports multiple LLM providers out of the box. You can use these providers to interact with the LLMs and generate responses to your prompts.

### OpenAI

The OpenAI adapter allows you to interact with the OpenAI API.

```ts
const c = Chat.with({
    provider: 'openai',
    config: { apiKey: process.env.OPENAI_API_KEY }
});
await c.chat('What is a rickroll?', { model: 'gpt-4' });
```

### Cohere

> [!WARNING]
> Cohere is a new provider, and tool calling is not yet functional. The adapter is still in development and may not work as expected. Please use with caution.

The Cohere adapter allows you to interact with the Cohere API. You can use this adapter to chat with the CommandR and Command models.

```ts
const c = Chat.with({
    provider: 'cohere',
    config: { apiKey: process.env.COHERE_API_KEY }
});
await c.chat('What is a rickroll?', { model: 'command-nightly' });
```

### OpenAI Assistants

> [!WARNING]
> OpenAI Assistants is a new provider, and tool calling is not yet functional. The adapter is still in development and may not work as expected. Please use with caution.

The OpenAI Assistants adapter allows you to interact with the OpenAI Assistants API. You can use this adapter to chat with the GPT-4o, GPT-4T, GPT-4, and GPT-3.5 models.

```ts
const c = Chat.with({
    provider: 'openai-assistants',
    config: { apiKey: process.env.OPENAI_ASSISTANTS_API_KEY }
});
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
| Autonomous Agents                  | 🟢 100%     | ❌           |
| Message History                    | 🟢 100%     | ❌           |
| Helpful Errors                     | 🟢 100%     | ❌           |
| Streaming                          | 🔴 0%       | ❌           |
| Model Fine-Tuning                  | 🔴 0%       | ❌           |
| File Input                         | 🔴 0%       | ❌           |
| Multimodal Input                   | 🔴 0%       | ❌           |
| Multimodal Generation              | 🔴 0%       | ❌           |

\* By "API Frozen," we mean that these features will not change in a breaking way. We will add new features, but we will not change the existing interface in a way that breaks existing code.


### Built-in Providers and Models

The following table lists the providers and models that Ragged Comes with out of the box. If you want to use a different provider or model, you can create a custom adapter.

| Provider                | Models                  | Chat | Embeddings | Tool Calls |
| ----------------------- | ----------------------- | ---- | ---------- | ---------- |
| OpenAI                  | GPT: 4o, 4T, 4, 3.5     | ✅    | ✅          | ✅          |
| OpenAI Assistants       | GPT: 4o, 4T, 4, 3.5     | ✅    | ❌          | ❌          |
| Azure OpenAI            | GPT: 4, 4T, 3.5         | ✅    | ❌          | ❌          |
| Azure OpenAI Assistants | GPT: 4, 4T, 3.5         | ❌    | ❌          | ❌          |
| Together                | Several OSS Models      | ❌    | ❌          | ❌          |
| Cohere                  | CommandR, Command       | ✅    | ❌          | ❌          |
| Anthropic               | Claude 2, Claude 3      | ❌    | ❌          | ❌          |
| Mistral                 | 7B, 8x7B, S, M & L      | ❌    | ❌          | ❌          |
| Groq                    | Lama2-70B, Mixtral-8x7b | ❌    | ❌          | ❌          |
| DeepSeek                | Chat and Code           | ❌    | ❌          | ❌          |
| Ollama                  | All models              | ❌    | ❌          | ❌          |
| Google Gemini           | Gemini: Flash, Pro      | ❌    | ❌          | ❌          |
| Hugging Face            | OSS Model               | ❌    | ❌          | ❌          |


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
import type { ChatAdapterTypes } from "ragged"

const c = new Chat({
    chat: async (request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> => {
        // Make your API calls here, then return the mapped response.
        return { history: [] };
    }
});

console.log(c);
```

#### Object adapter

> [!TIP]
> You can see an example of how to use an object adapter in the examples folder. [Click here](examples/nodejs/custom-adapter-object.ts) to see the example. This is a fully working example, so if you [set up Ragged locally](#development-instructions), you can execute the example using `pnpm run:example custom-adapter-object.ts`.

You could also create a custom adapter as an object and pass it to the constructor. This is useful if you want to store the adapter in a separate variable or if you want to reuse the adapter in multiple places.

```ts
import { Chat } from "ragged"
import type { ChatAdapterTypes } from "ragged"

const adapter: ChatAdapterTypes['BaseChatAdapter'] = {
    chat: async (request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> => {
        // Make your API calls here, then return the mapped response.
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
import { Chat, ChatAdapterTypes } from "ragged"

type BaseChatAdapter = ChatAdapterTypes["BaseChatAdapter"];

class ExampleAdapter implements BaseChatAdapter {
    async chat(request: ChatAdapterTypes['ChatAdapterRequest']): Promise<ChatAdapterTypes['ChatAdapterResponse']> {
        // Make your API calls here, then return the mapped response.
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


