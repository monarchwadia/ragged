# Quickstart

This Quickstart should help new developers get started quickly with `ragged`, leveraging its features for efficient LLM integrations.

## Installation

You'll need to install `ragged` along with its peer dependencies, `openai` for LLM driver support (we only support openai right now) and `rxjs` for streaming. 

```sh
npm install --save openai rxjs ragged
```


## Your first Ragged LLM call


```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key"

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
    // You need the following line if you're in a browser. See OpenAI client docs.
    dangerouslyAllowBrowser: true
  },
});

r.chat("What is Toronto?")
  .firstText() // convert to promise
  .then(console.log) // Toronto is a city in Canada. It has a population of...
```