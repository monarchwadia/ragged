---
sidebar_position: 1
---

# What is ragged?

`ragged` is a set of streamlined functions aimed at simplifying the usage of Large Language Models (LLMs). It offers an easy-to-use interface supporting both promise-based and event-driven inference, allowing for quick integration into applications utilizing LLMs. Currently in development, `ragged` is designed to provide a unified facade for interacting with various LLM APIs, including OpenAI and Anthropic, supporting diverse interaction patterns like text-to-text, speech-to-text, text-to-speech, text-to-image, and image-to-text.

# Why ragged?

Developed from a need to address repetitive implementations across LLM APIs, `ragged` aims to simplify the use of streaming (and non-streaming) LLM APIs for developers in both frontend and backend environments. Its core philosophy is to eliminate the complexities commonly associated with managing and configuring multiple LLM services.

# Quickstart

This comprehensive guide should help new developers get started quickly with `ragged`, leveraging its features for efficient LLM integrations.

## Installation

You'll need to install `ragged` along with its peer dependencies, `openai` and `rxjs`.

```sh
npm install --save openai rxjs ragged
```

## Your First API Call

If you already have `OPENAI_API_KEY` in your environment, then you can simply do the following...

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
    openai: {
        apiKey: OPENAI_API_KEY
    }
});
r.predict("What is Toronto?")
  .then(console.log)
  .catch(console.error)
// Toronto is a city in Canada. It has a population of...
```

## Manually Configuring the OpenAI Object

The Ragged object's constructor allows for detailed configuration of each AI API.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
    openai: {
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true, // you need this if you're in a browser
    }
});

r.predict("What is Toronto?")
  .then(console.log)
  .catch(console.error);
// Toronto is a city in Canada. It has a population of...
```

## Streaming API

`ragged` also supports streaming responses, making real-time interaction feasible.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
  openai: { apiKey: OPENAI_API_KEY }
});

r.predictStream("What is Toronto?").subscribe((e) => {
  if (e.type === "started") {
    // no-op
  }

  if (e.type === "collected") {
    setPrediction(e.payload); // Outputs incrementally collected responses
  }

  if (e.type === "finished") {
    setPrediction(e.payload); // Outputs the complete response
  }
});
```

## Tool Integration Example

Integrating tools with ragged allows for the extension of its capabilities.

```ts
import { Ragged, RaggedTool } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  openai: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const adder = new RaggedTool()
    .title("adder")
    .example({
      description: "Add two numbers together",
      input: [1, 2],
      output: 3,
    })
    .example({
      description: "Empty array will return 0",
      input: [],
      output: 0,
    })
    .handler((input: number[]) => {
      const result = input.reduce((a, b) => a + b, 0);
      console.log(result);
      return result;
    });

  const r = await ragged.predict("Add 1124124 and 14151512", {
    model: "gpt-4",
    tools: [adder],
  });

  console.log(r); // 15275636
}

main().then(console.log).catch(console.error);
```

