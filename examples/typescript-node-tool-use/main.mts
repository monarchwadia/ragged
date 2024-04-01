import S from "fluent-json-schema";

import { Ragged } from "ragged";
import type { PredictOptions } from "ragged";
import dotenv from "dotenv";
dotenv.config();

type ToolFuncArgs = { a: number; b: number };
const toolFunc = (args: ToolFuncArgs) => {
  return args.a + args.b;
};
const toolFuncDefinition: PredictOptions["tools"] = [{}];

const ragged = new Ragged({
  openai: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const r = await ragged.predict("Add 1124124 and 14151512", {
    model: "gpt-4",
    tools: [
      {
        name: "add",
        description: "Add two numbers",
        parameters: S.object()
          .prop("a", S.number())
          .prop("b", S.number())
          .valueOf() as any,
      },
    ],
  });
  console.log(r);
}

main().then(console.log).catch(console.error);
