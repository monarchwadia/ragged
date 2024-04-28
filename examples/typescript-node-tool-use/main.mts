import { RaggedToolUseResultEvent } from "ragged/src/driver/types";
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

  const prompt = "add 66 and 66";
  console.log("prompt:", prompt);
  const result = await ragged.chat("add 66 and 66", {
    requestOverrides: {
      model: "gpt-4",
    },
    tools: [adder],
  });

  const toolUseResult = result.find((r) => r.type === "tool.finished") as
    | RaggedToolUseResultEvent
    | undefined;

  console.log("answer:", toolUseResult?.data.result);
}

// console output:
// prompt: add 66 and 66
// answer: 132

main()
  .then(() => console.log("done!"))
  .catch(console.error);
