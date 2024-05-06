
## Streaming API Calls

`ragged` supports streaming responses, making real-time interaction feasible.

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