import { Ragged, t } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_CREDS = process.env.OPENAI_CREDS;

async function main() {
  // first tool
  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a + input.b);

  // second tool
  const multiplier = t
    .tool()
    .title("multiplier")
    .description("Multiply two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a * input.b);

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: OPENAI_CREDS,
    },
  });

  const prompt = "add 123 + 456";
  console.log("prompt:", prompt);
  const p$ = r.predictStream(prompt, {
    tools: [adder, multiplier],
    requestOverrides: {
      model: "gpt-4",
    },
  });

  p$.subscribe((event) => {
    if (event.type === "tool.finished") {
      console.log("answer: " + event.data.result);
    }
  });
}

main().catch(console.error);
