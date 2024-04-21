import { Ragged, t } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => {
      const result = input.a + input.b;
      return result;
    });

  await ragged.predict("Add 1124124 and 14151512", {
    requestOverrides: {
      model: "gpt-4",
    },
    tools: [adder],
  });
}

main().then(console.log).catch(console.error);
