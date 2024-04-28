import { Ragged } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

console.log("started");
ragged
  .chat("What is Toronto?")
  .firstText()
  .then(console.log)
  .catch(console.error);
