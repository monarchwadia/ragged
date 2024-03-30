---
sidebar_position: 1
---

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
import dotenv from "dotenv";
dotenv.config();

const r = new Ragged({
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
});

r.qPredict("What is Toronto?")
    .then(console.log)
    .catch(console.error)
```

## Streaming API

The above example had a promise-based interface that is easy to use, but does not support streaming. Luckily, `ragged` offers full support for streaming.

```ts
r.predict("What is toronto?").subscribe((e) => {
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
