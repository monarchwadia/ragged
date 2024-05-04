# Using Chat History in Ragged

One of the key features of Ragged is low-level control over conversation history. This tutorial will guide you through the process of using the `history` feature in Ragged to create a persistent conversation history.

## Prerequisites

Before getting started, make sure you have the following:

- Node.js installed on your machine
- Ragged library installed in your project
- API credentials for the desired LLM provider (e.g., OpenAI)

## Step 1: Initialize Ragged

To begin, import the necessary modules from the Ragged library and create a new instance of the `Ragged` class with your desired provider and configuration.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

// highlight-start
const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});
// highlight-end
```

## Step 2: Initialize History Array

Create an empty array called `history` to store the conversation history. This array will be used to accumulate the responses from each chat interaction.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

// highlight-start
let history: RaggedHistoryItem[] = [];
// highlight-end
```

## Step 3: Send Initial Prompt

Define your initial prompt and send it to the LLM using the `r.chat()` method. Use the `asHistory()` method to obtain the response as a `RaggedHistoryItem` array.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

let history: RaggedHistoryItem[] = [];

// highlight-start
const PROMPT_1 = "say 'Hello World!'";
const firstResponseHistory = await r.chat(PROMPT_1).asHistory();
// highlight-end
```

## Step 4: Update History Array

Update the `history` array by concatenating the response history from the previous step.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

let history: RaggedHistoryItem[] = [];

const PROMPT_1 = "say 'Hello World!'";
const firstResponseHistory = await r.chat(PROMPT_1).asHistory();

// highlight-start
history = [...history, ...firstResponseHistory];
// highlight-end
```

## Step 5: Send Subsequent Prompts

Define your next prompt and send it to the LLM along with the updated `history` array. This allows the LLM to have context from the previous interactions.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

let history: RaggedHistoryItem[] = [];

const PROMPT_1 = "say 'Hello World!'";
const firstResponseHistory = await r.chat(PROMPT_1).asHistory();

history = [...history, ...firstResponseHistory];

// highlight-start
const PROMPT_2 = "say 'Hello World!' again";
const secondHistoryResponse = await r
  .chat([
    ...history,
    {
      type: "history.text",
      role: "human",
      data: {
        text: PROMPT_2,
      },
    },
  ])
  .asHistory();
// highlight-end
```

## Step 6: Repeat Steps 4-5

Repeat steps 4-5 for each subsequent prompt, updating the `history` array and sending the next prompt along with the updated history.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

let history: RaggedHistoryItem[] = [];

const PROMPT_1 = "say 'Hello World!'";
const firstResponseHistory = await r.chat(PROMPT_1).asHistory();

history = [...history, ...firstResponseHistory];

const PROMPT_2 = "say 'Hello World!' again";
const secondHistoryResponse = await r
  .chat([
    ...history,
    {
      type: "history.text",
      role: "human",
      data: {
        text: PROMPT_2,
      },
    },
  ])
  .asHistory();

// highlight-start
history = [...history, ...secondHistoryResponse];
// highlight-end
```

## Step 7: Access Complete History

After all the chat interactions are complete, you can access the complete conversation history by using the `history` array for further processing.

```typescript
import { Ragged } from "ragged";
import type { RaggedHistoryItem } from "ragged";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

let history: RaggedHistoryItem[] = [];

const PROMPT_1 = "say 'Hello World!'";
const firstResponseHistory = await r.chat(PROMPT_1).asHistory();

history = [...history, ...firstResponseHistory];

const PROMPT_2 = "say 'Hello World!' again";
const secondHistoryResponse = await r
  .chat([
    ...history,
    {
      type: "history.text",
      role: "human",
      data: {
        text: PROMPT_2,
      },
    },
  ])
  .asHistory();

history = [...history, ...secondHistoryResponse];

// highlight-start
// Access and process the complete conversation history
console.log(history);
// highlight-end
```

## Conclusion

By following this tutorial, you have learned how to use the `history` feature in Ragged to maintain a persistent conversation history across multiple chat interactions. This allows the LLM to provide more contextually relevant responses based on the previous interactions.

Remember to update the `history` array accordingly after each chat interaction. You can also customize the behavior by handling different item types in the response history.

With the power of Ragged and the `history` feature, you can build sophisticated conversational AI applications that maintain context and provide engaging user experiences.
