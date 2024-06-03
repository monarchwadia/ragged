
# Ragged

![An image of an audio cable with a ragged blue denim insulation covering. The caption in the foreground reads "Ragged, the universal LLM client for JavaScript."](./ragged-social-card.jpeg)

## What is this?

Ragged is a 0-dependency, lightweight, universal LLM client for JavaScript and Typescript. It makes it easy to access LLMs via a simple, easy to understand, and uncomplicated API.

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

## Examples

### Simple chat

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
console.log(messages.at(-1)?.text); // A rickroll is a prank...
```

### Recording chat history (a.k.a. memory)

The simplest way to work with history is to use the `.record` functionality. This will cause Ragged to retain a history of the conversation thus far. You can turn recording on and off by passing a boolean to the `.record` method.

```ts
c.record(true);
```

This will cause Ragged to record the conversation history. 

#### Accessing chat history

You can access the history using the `.history` property.

```ts
console.log(c.history); // [ { text: 'What is a rickroll?' ... ]
```

You can also access the last message in the history using the `.at` method.

```ts
console.log(c.history.at(-1)?.text); // A rickroll is a prank...
```

You can clear the history by setting the `.history` property to an empty array.

```ts
c.history = [];
```

Note that all chat history is immutable at a shallow level. Don't try to modify the history directly. Instead, set the `.history` property to a new array.

#### Recording chat history

Here's a basic example of how to use the `.record` functionality. You can access the history of the conversation using the `.history` property.

```ts
import { config } from 'dotenv';
config();

import { Chat } from "ragged/chat"
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });

// Turn recording on
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

### Advanced techniques

#### Prompt freezing

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

### API

#### `Chat.with(name, options)`

The `Chat.with()` method is used to create a new instance of the `Chat` class with any one of several built-in adapters. (NOTE: right now, we only support openai). It takes two arguments: the provider name and the provider options. The provider name is a string that specifies the provider to use. The provider options is an object that contains the options for the provider.

Under the hood, the `Chat.with()` method creates a new instance of the `Chat` class and passes the adapter to the constructor. See the `new Chat(adapter)` section for more information.

```ts
// Create an instance of the Chat class with the OpenAI provider
const c = Chat.with('openai', { apiKey: process.env.OPENAI_API_KEY });
```

##### `Chat.with('openai')`

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


#### `new Chat(adapter)` and custom adapters

This is the constructor for the `Chat` class. It takes an adapter as an argument. The adapter is an object that contains the methods and properties that the `Chat` class uses to interact with the model.

Using this constructor directly allows you to use your own custom adapters with the `Chat` class. This is useful if you want to use a different model or if you want to use a different API that is not supported by the built-in adapters. It is also useful if you want to mock the adapter for testing purposes.

##### Inline adapter

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

##### Object adapter

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

##### Class adapter

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