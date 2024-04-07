import { Ragged, RaggedTool } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  openai: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const adder = new RaggedTool()
    .title("adder")
    .example({
      input: [1, 2],
      output: 3,
    })
    .example({
      input: [3, 4],
      output: 7,
    })
    .handler((input: number[]) => {
      return input.reduce((a, b) => a + b, 0);
    });

  const r = await ragged.predict("Add 1124124 and 14151512", {
    model: "gpt-4",
    tools: [adder],
  });

  console.log(r);
}

main().then(console.log).catch(console.error);
