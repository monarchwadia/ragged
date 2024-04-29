import { Ragged, t } from "../../../ragged/main";

export const streamingPoetry = async () => {
  // initialize ragged
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // define prompt
  const PROMPT = "print two or three lines from The Raven by Edgar Allan Poe'";

  // resolve gets called when the ragged chat is finished.
  // this is a hack to resolve the promise when the ragged chat is finished.
  // this solution is necessary because we are using subscribe instead of await.
  let resolve: Function = () => {};
  const promise = new Promise((res) => {
    resolve = res;
  });

  // run ragged
  console.log(`[prompt]: ${PROMPT}\n`);
  const r$ = r.chat(PROMPT);

  // subscribe to the ragged chat and print the text chunks to the console
  r$.subscribe((e) => {
    if (e.type === "text.chunk") {
      process.stdout.write(e.data);
    }

    if (e.type === "ragged.finished") {
      process.stdout.write("\n");
      resolve();
    }
  });

  // return the promise to wait for the ragged chat to finish
  return promise;
};
