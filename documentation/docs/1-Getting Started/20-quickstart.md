# Quickstart

This Quickstart should help new developers get started quickly with `ragged`, leveraging its features for efficient LLM integrations.

## Installation

You'll need to install `ragged` along with its peer dependencies, `openai` for LLM driver support (we only support openai right now) and `rxjs` for streaming. 

```sh
# npm
npm install --save --save-exact openai rxjs ragged

#pnpm
pnpm install --save --save-exact openai rxjs ragged

#yarn
yarn add -E openai rxjs ragged
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

## Explore the documentation

You're now all set to start building really cool LLM apps! Ragged features very easy and fluent APIs for streaming, tool use, and more. You can see [More Examples](https://monarchwadia.github.io/ragged/Getting%20Started/more-examples) here for inspiration!