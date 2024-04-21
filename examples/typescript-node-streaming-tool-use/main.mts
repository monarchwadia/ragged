import { Ragged, t } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_CREDS = process.env.OPENAI_CREDS;

async function main() {
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

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: OPENAI_CREDS,
    },
  });

  const prompt = "tell me what is Order 66 in star wars?";
  console.log("prompt:", prompt);
  const p$ = r.predictStream(prompt, {
    tools: [adder, multiplier],
    requestOverrides: {
      model: "gpt-4",
    },
  });

  p$.subscribe((event) => {
    if (event.type === "collected") {
      console.log(event.payload);
    }
  });
}

main().catch(console.error);
