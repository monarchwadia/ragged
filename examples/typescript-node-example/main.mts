import { Ragged } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  openai: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

async function main() {
  const r = await ragged.predict("What is Toronto?");
  console.log(r);
}

main();
