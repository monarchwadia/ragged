import { Ragged } from "../../../ragged/main";

export const questionAnswer = async () => {
  const ragged = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  const PROMPT = "What is Toronto?";

  console.log(`[prompt]: ${PROMPT}`);
  return ragged
    .chat("What is Toronto?")
    .firstText()
    .then((response) => console.log(`[response]: ${response}`));
};
