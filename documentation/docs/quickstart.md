---
sidebar_position: 1
---

# What is ragged?

`ragged` is a set of streamlined functions aimed at simplifying the usage of Large Language Models (LLMs). It offers an easy-to-use interface supporting both promise-based and event-driven inference, allowing for quick integration into applications utilizing LLMs. Currently in development, `ragged` is designed to provide a unified facade for interacting with various LLM APIs, including OpenAI and Anthropic, supporting diverse interaction patterns like text-to-text, speech-to-text, text-to-speech, text-to-image, and image-to-text.

# Why ragged?

Developed from a need to address repetitive implementations across LLM APIs, `ragged` aims to simplify the use of streaming (and non-streaming) LLM APIs for developers in both frontend and backend environments. Its core philosophy is to eliminate the complexities commonly associated with managing and configuring multiple LLM services.

# Quickstart

This Quickstart should help new developers get started quickly with `ragged`, leveraging its features for efficient LLM integrations.

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
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
  },
});

r.chat("What is Toronto?")
  .then(console.log)
  .catch(console.error)
// { ..., payload: 'Toronto is a city in Canada. It has a population of...'}
```

## Manually Configuring the OpenAI Object

The Ragged object's constructor allows for detailed configuration of each AI API.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // you need this if you're in a browser
  },
});

r.chat("What is Toronto?")
  .then(console.log)
  .catch(console.error);
// { ..., payload: 'Toronto is a city in Canada. It has a population of...'}
```

## Streaming API

`ragged` also supports streaming responses, making real-time interaction feasible.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  },
});

r.chatStream("What is Toronto?").subscribe((e) => {
  if (e.type === "stream.started") {
    // no-op
  }

  if (e.type === "text.joined") {
    setPrediction(e.payload); // Outputs incrementally collected responses
  }

  if (e.type === "stream.finished") {
    setPrediction(e.payload); // Outputs the complete response
  }
});
```

## Tool Integration Example

Integrating tools with ragged allows for the extension of its capabilities.

```ts
import { Ragged, t } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = "your api key"

async function main() {
  // first tool
  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a + input.b);

  // second tool
  const multiplier = t
    .tool()
    .title("multiplier")
    .description("Multiply two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a * input.b);

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: OPENAI_API_KEY,
    },
  });

  const prompt = "add 123 + 456";
  console.log("prompt:", prompt);
  const p$ = r.chatStream(prompt, {
    tools: [adder, multiplier],
    requestOverrides: {
      model: "gpt-4",
    },
  });

  p$.subscribe((event) => {
    if (event.type === "text.joined") {
      console.log(event.payload);
    }
  });
}

main().catch(console.error);

// prompt: add 123 + 456
// answer: 578
```

