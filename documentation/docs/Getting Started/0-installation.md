# Installation

You can install Ragged directly from [npm](https://www.npmjs.com/package/ragged).

```sh
npm install --save openai rxjs ragged
```

## About the peer dependencies

Ragged has 2 peer dependencies:

* `openai`, which is the official JavaScript client for OpenAI, the only LLM we currently support.
* `rxjs`, which provides a reactive event-based interface that is used by Ragged for streaming support.

We soon plan to wrap the dependency on `rxjs` into Ragged itself, so that it is no longer a peer dependency. 

We have no immediate plans for removing `openai`. It's likely that, as we add more drivers, we will encounter more pressure from developers to remove `openai`. We will do so when the time is right.