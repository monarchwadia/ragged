## firstText(): a simpler approach

The streaming API can be onerous for simpler use cases, where you might not want to take advantage of streaming.

For cases like this, you can simplify the API call by using utilties like `firstText()`.

`firstText()` turns the stream into a `Promise` that contains a string.

```ts
import { Ragged } from "ragged";

const OPENAI_API_KEY = "your api key";

const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
    // You need the following line if you're in a browser. See OpenAI client docs.
    dangerouslyAllowBrowser: true,
  },
});

r.chat("What is Toronto?").firstText().then(console.log); // Toronto is a city in Canada. It has a population of...
```