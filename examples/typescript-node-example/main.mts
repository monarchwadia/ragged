import { Ragged } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const ragged = new Ragged({
  provider: "openai",
  config: {
    apiKey: process.env.OPENAI_CREDS,
  },
});

ragged.predict("What is Toronto?").then(console.log).catch(console.error);
