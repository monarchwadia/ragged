# Tool Use

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