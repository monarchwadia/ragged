# Ragged

A simple library for easy LLM access.

See documentation at https://monarchwadia.github.io/ragged/

NPM is at https://www.npmjs.com/package/ragged

# Quickstart

`ragged` is quick and easy to get started with. Let's get right into it.

## Installation

First, you'll need `openai` and `rxjs`, which are peer dependencies.

```
npm install --save openai rxjs
```

Then, you can install `ragged`.

```
npm install --save ragged
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
  openai: { apiKey: OPENAI_API_KEY }
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
    // no-op
  }

  // WIP
  // doesn't get emitted yet, but will in the future
  // the "collected" event is emitted with the partially complete prediction as it streams down
  if (e.type === "collected") {
    setPrediction(e.payload);
    // Toronto
    // Toronto is
    // Toronto is a
    // Toronto is a city
    // Toronto is a city in
    // etc
  }

  // the "completed" event is emitted with the fully complete prediction
  if (e.type === "finished") {
    setPrediction(e.payload);
    // Toronto is a city in Canada.
  }
});
```

### Compatibility

* Node.js
* Recent versions of all major browsers
