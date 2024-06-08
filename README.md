Given the recent addition of parameter validation to the `chat()` method, the following sections of the README need to be updated:

1. **Simple Chat**
   - Mention that the `chat()` method includes parameter validation.
   - Update the code examples to ensure they demonstrate valid parameter usage.

2. **API**
   - Update the description of the `chat()` method to include details about parameter validation.
   - Provide examples of valid and invalid parameter usages.
   - Highlight that invalid parameters will throw a `ParameterValidationError`.

### Updated Sections:

#### Simple Chat

Ragged is very easy to use. Here is a complete application that shows chat completion with valid parameters.

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

#### API

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

### `chat(message, options)`

The `chat()` method is used to send a message to the model and receive a response. It includes parameter validation to ensure that the inputs are valid. 

- `message`: Can be a string, an array of message objects, or an options object. If it's an array or string, it represents the conversation history. If it's an object, it represents options.
- `options`: An optional configuration object that may include `tools`, `model`, and other settings.

#### Valid Usages

```ts
await c.chat("Something");
await c.chat([{ type: "user", text: "Something" }]);
await c.chat([{ type: "user", text: "Something" }], { tools: [], model: "gpt-3" });
await c.chat({ tools: [], model: "gpt-3" });
```

#### Invalid Usages

The method will throw a `ParameterValidationError` for invalid parameters.

```ts
await expect(() => c.chat(123)).rejects.toThrow(ParameterValidationError);
await expect(() => c.chat(class X {})).rejects.toThrow(ParameterValidationError);
await expect(() => c.chat(() => {})).rejects.toThrow(ParameterValidationError);
await expect(() => c.chat(undefined, {})).rejects.toThrow(ParameterValidationError);
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

## Using Tools with the Chat API

Ragged allows you to further extend its functionality using tools. This gives you the power to integrate custom behavior or commands directly into your chat-based application.

Here is an example of how to use a tool with Ragged's chat:

```ts
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
import { Tool } from "ragged/tools";
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

c.record(true);

// Tool calling will always dial back to the LLM with the results of the tool.
// Here, we are allowing the tool to run for a maximum of 10 iterations.
// This is useful for agentic tools that may need to call the LLM multiple times.
c.maxIterations = 10;


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
    handler: async (props: any) => {
        try {
            const json = await JSON.parse(props);
            const providedPath = json.path;
            const files = fs.readdirSync(providedPath);
            return `The files in the directory ${providedPath} are: ${files.join("\n")}`;
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

const pwdTool: Tool = {
    id: "pwd",
    description: "Print the current working directory of the user's local machine.",
    props: {
        type: "object",
        props: {}
    },
    handler: async () => {
        return `The current working directory is: ${__dirname}`;
    }
}

const catTool: Tool = {
    id: "cat",
    description: "Print the contents of a file on the user's local machine.",
    props: {
        type: "object",
        props: {
            path: {
                type: "string",
                description: "The path to the file to read.",
                required: true
            }
        }
    },
    handler: async (props: any) => {
        try {
            const json = await JSON.parse(props);
            const path = json.path;
            const contents = fs.readFileSync(path, 'utf8');
            return `The contents of the file ${path} are as follows: \n\n: ${contents}`;
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

// Execute the call.
// I'll be honest, this signature needs to be cleaned up.
const response = await c.chat(`
List the files in the current directory, then read all of them. Finally, give me a report on what they all do.
`, [], [lsTool, pwdTool, catTool], "gpt-4")

// Log the messages
console.log(response.at(-1)?.text);
```

The `Chat.chat()` method accepts an array of tools as the third argument, which can be used to extend the functionality of the chat command.

***Note:*** *The tools are executed in the order they are listed in the array, and the execution halts once a tool has handled the command.*

---

## Creating Custom Tools

A tool in Ragged is an object that implements the `Tool` interface. It consists of an `id`, `description`, and `props` for defining the data schema, and a `handler` function that implements the tool's functionality. The `handler` function takes the user's command, processes it, and returns a response.

Here's an example tool that echoes back the user's command:

```ts
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
import { Tool } from "ragged/tools";
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// Define your tool
const echoTool: Tool = {
    id: "echo",
    description: "Echos back the text.",
    props: {
        type: "object",
        props: {
            text: {
                type: "string",
                description: "The text to echo back.",
                required: true
            }
        }
    },
    handler: async (props: any) => {
        return `Echo: ${props.text}`;
    }
}; 

// Chat with the model using the tool
const response = await c.chat('Echo this please.', [], [echoTool]);

// Log the messages
console.log(response.at(-1)?.text);
```

In the example above, the `echoTool` simply repeats back the text that it's given. The `props` field in the tool definition specifies that this tool requires one string argument, `text`, which is used in the `handler` function.