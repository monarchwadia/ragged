// in order to use the unminified version, make sure you are using "moduleResolution='NodeNext'" in your tsconfig.json

import { Ragged } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  openai: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const r = await ragged.qPredict("What is Toronto?");
  console.log(r);
}

main();
