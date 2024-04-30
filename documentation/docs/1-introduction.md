
# Introduction

`ragged` simplifies the usage of Large Language Models (LLMs). It offers an easy-to-use interface that supports both promise-based and event-driven inference.

## Why ragged?

LLMs currently offer non-standard APIs. `ragged` simplifies APIs for the frontend and backend by exposing a common interface that will eventually work across all LLMs.

## Roadmap

Currently in development, `ragged` is designed to provide a unified facade for interacting with various LLM APIs, including OpenAI, Cohere, and Anthropic, supporting diverse interaction patterns like text-to-text, speech-to-text, text-to-speech, text-to-image, and image-to-text.

## Expect breaking API changes

Ragged is in its early stages. Expect breaking API changes frequently at this point.

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
  .firstText()
  .then(console.log) // Toronto is a city in Canada. It has a population of...
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
  .firstText()
  .then(console.log) // Toronto is a city in Canada. It has a population of...
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

r.chat("What is Toronto?").subscribe((e) => {
  if (e.type === "ragged.started") {
    console.log("started!");
  }

  if (e.type === "text.joined") {
    console.log(e.data); // outputs the streaming response as it comes in
    // Toronto
    // Toronto is
    // Toronto is a ci
    // Toronto is a city in No
    // Toronto is a city in North America.
    // ...
  }

  if (e.type === "ragged.finished") {
    console.log("finished!");
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
  const p$ = r.chat(prompt, {
    tools: [adder, multiplier],
    requestOverrides: {
      model: "gpt-4",
    },
  });

  p$.subscribe((event) => {
				if (s.type === 'tool.finished') {
          console.log(`${s.data.name} result ${s.data.result}`); // adder result 579
				}
  });
}

main().catch(console.error);
```

