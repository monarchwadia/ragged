
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
- [Development Instructions](#development-instructions)
  - [Prerequisites](#prerequisites)
  - [Understanding the folder structure](#understanding-the-folder-structure)
    - [Main folder](#main-folder)
    - [Supporting folders](#supporting-folders)
  - [Development Instructions](#development-instructions-1)
  - [Manual Testing](#manual-testing)
  - [PollyJS recordings](#pollyjs-recordings)
    - [How to refresh PollyJS Recordings](#how-to-refresh-pollyjs-recordings)

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

* A starting state
* A loop which calls an LLM to mutate the state recursively
* A stop condition which determines when the agent should stop

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
import { Chat } from "ragged/chat"

// Define the main function
async function main() {
    const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
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

# Development Instructions

These instructions will get you a copy of Ragged up and running on your local machine for development and testing purposes. If you are not working on Ragged's own source code, you can skip all documentation past this point.

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

You will need to have Node.js installed on your machine. You can download it from the [official website](https://nodejs.org/), but we recommend using a version manager like `nvm` or `nodenv` to manage your Node.js installations.

You will also need pnpm. Please see the [official website](https://pnpm.io/) for installation instructions.

## Understanding the folder structure

Ragged has a simple folder structure. Here is a brief overview of the folders and their contents.

### Main folder

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

### Supporting folders

- `.github` contains GitHub Actions workflows that are used to automate the testing and deployment process. I.e. this is the CI/CD pipeline for deploying Ragged to `npm` and for deploying the documentation to GitHub Pages.
- `.vscode` contains Visual Studio Code settings that are used to configure the editor for Ragged development. You can ignore this folder if you are not using Visual Studio Code.
- `documentation` contains a Docusaurus project that is used to generate the documentation for Ragged. Currently, this is out of date and not deployed. We may delete this folder in the future, or we may update it and deploy it.
- `examples` contains example code that demonstrates how to use Ragged. This is useful for testing and learning how to use Ragged. Please refer to the README in each examples folder for more information on how to run the examples.
- `scratch` contains scratch files that are used for testing and debugging. These files are not part of the main codebase. They are used for quick testing and prototyping. You can ignore this folder if you are not familiar with it.

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

If you want to refresh a specific PollyJS recording, then you'll have to pass `{ refresh: true }` to `startPollyRecordings` in the test file. This will cause the test to make a real API call and record the response, overwriting the existing recording.

If you want to refresh ALL PollyJS recordings, you can set the `REFRESH_POLY_RECORDINGS` environment variable to `true` before running the tests. This will cause the tests to make real API calls and record the responses, overwriting any existing recordings.

```bash
REFRESH_POLY_RECORDINGS=true pnpm test
```

