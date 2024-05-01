# More Examples

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

## A simpler approach: firstText()

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

## Manually Configuring the OpenAI Object

The Ragged object's constructor allows for detailed configuration of each AI API.

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

## Tool Integration Example

Integrating tools with ragged allows for the extension of its capabilities.

```ts
import { Ragged, t } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = "your api key";

async function main() {
  // ====================== Tool Definitions ======================

  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a + input.b);

  const multiplier = t
    .tool()
    .title("multiplier")
    .description("Multiply two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a * input.b);

  // ====================== Set up Ragged ======================

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: OPENAI_API_KEY,
      // You need the following line if you're in a browser. See OpenAI client docs.
      dangerouslyAllowBrowser: true,
    },
  });

  // ====================== Prompt the LLM ======================

  const prompt = "add 123 + 456";
  console.log("prompt:", prompt);
  const p$ = r.chat(prompt, {
    tools: [adder, multiplier],
    requestOverrides: {
      model: "gpt-4",
    },
  });

  // ====================== Read the results ======================

  p$.subscribe((event) => {
    if (s.type === "tool.finished") {
      console.log(`${s.data.name} result ${s.data.result}`); // adder result 579
    }
  });
}

main().catch(console.error);
```

## Simpler tool integration: firstToolResult()

Similar to `firstText()`, you can use `firstToolResult()`

```ts
// ...
// Code continues from the previous example.

// firstToolResult() is super useful.
// Before, we did `const p$ = r.chat(...)` and then `p$.subscribe(...)`
// Now, instead of all that work, we just use `await` to get the result.
// We lose streaming, but we gain simplicity and ease.
const toolResponse = await r
  .chat("add 123 + 456", {
    tools: [adder, multiplier],
    requestOverrides: { model: "gpt-4" },
  })
  .firstToolResult();

console.log(toolResponse.result);
```
