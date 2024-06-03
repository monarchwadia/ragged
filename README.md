
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

#### Simple example with memory

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

### Freezing recording for productive conversations

Sometimes, you may want to freeze the recording of a conversation. This is useful when you want to create multiple responses to a single prompt. You can freeze the recording by passing a `false` to the `.record` method. Then, you can prompt the model multiple times. Each time, the model will respond as if it were the first time, and the history will not be updated with each call.

```ts