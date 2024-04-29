import { Ragged, t } from "../../../ragged/main";

export const helloWorld = async () => {
  // initialize ragged
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // define prompt
  const PROMPT = "say 'Hello World!'";

  // run ragged
  console.log(`[prompt]: ${PROMPT}`);
  const response = await r.chat(PROMPT).firstText();
  console.log(`[response]: ${response}`);
};
