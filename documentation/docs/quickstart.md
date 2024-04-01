---
sidebar_position: 1
---

# What is ragged?

`ragged` is a simple set of functions designed to make LLMs easy and uncomplicated to use. It exposes a simple interface for promise-based inference as well as event-driven inference, which means you can quickly and easily implement your LLM-powered application with a minimum of fuss.

`ragged` is currently a work in progress, but the plan is to add the following features:

1. An unified facade that allows calling multiple LLM APIs.
2. Support for text-to-text, speech-to-text, text-to-speech, text-to-image, image-to-text, and other similar usage patterns.
3. Support for OpenAI, Anthropic, and other LLM APIs.

This is an early version of `ragged`, so you can definitely expect issues. Thank you for trying it out.

# Why ragged?

`ragged` was born out of frustration with the current state of LLM APIs. I kept finding myself re-implementing streaming chat completion again and again. The goal of `ragged` is to scratch my own itch: make streaming (and non-streaming) LLM APIs simple and easy to use, whether on the frontend or on the backend. That's it.

# Quickstart

`ragged` is quick and easy to get started with. Let's get right into it.

## Installation

You'll need to install `ragged` along with its peer dependencies, `openai` and `rxjs`.

```
npm install --save openai rxjs ragged
```

## Your first API call

If you already have OPENAI_API_KEY in your environment, then you can simply do the following...

```ts
import { Ragged } from "ragged";

// IMPORTANT: Make sure process.env has your openai api key

const r = new Ragged();
r.predict("What is Toronto?")
  .then(console.log)
  .catch(console.error)
// Toronto is a city in Canada. It has a population of...
```

## Manually configuring the API key

If you need to manually configure the OpenAI API key, you can do the following.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        // if you are in a browser envioronment, you can uncomment the following line to try out ragged.
        // a better solution for browsers will be presented in the near future.
        // dangerouslyAllowBrowser: true,
    }
});

r.predict("What is Toronto?")
  .then(console.log)
  .catch(console.error);
// Toronto is a city in Canada. It has a population of...
```

## Streaming API

The above example had a promise-based interface that is easy to use, but does not support streaming. Luckily, `ragged` offers full support for streaming.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
  openai: { apiKey: OPENAI_API_KEY }
});

r.predictStream("What is toronto?").subscribe((e) => {
  // the "started" event is emitted when the prediction starts
  if (e.type === "started") {
    // the "started" event is emitted when the prediction starts
    // no-op
  }

  if (e.type === "collected") {
    // the "collected" event is emitted with the partially complete prediction as it streams down
    // Output is delivered in the string as collected so far.
    // Toronto
    // Toronto is
    // Toronto is a
    // ...
    setPrediction(e.payload);
  }

  if (e.type === "finished") {
    // the "finished" event is emitted with the fully complete prediction
    // Toronto is a city in Canada...
    setPrediction(e.payload); 
  }
});
```

### Compatibility

* Node.js
* Recent versions of all major browsers
