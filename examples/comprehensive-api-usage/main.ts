import dotenv from "dotenv";
import { listFiles } from "./sub-examples/tool-use";
import { helloWorld } from "./sub-examples/hello-world";
import { streamingPoetry } from "./sub-examples/streaming-poetry";
import { multiToolUse } from "./sub-examples/multi-tool-use";
import { historyUsage } from "./sub-examples/history-usage";
dotenv.config();

const runExample = async (name: string, callable: () => Promise<any>) => {
  console.log(`======== Running example: [${name}] ========`);
  try {
    await callable();
    console.log(`[${name}]: Example complete!`);
  } catch (e) {
    console.error(`[${name}]: Error running example.}`, e);
  }
};

const main = async () => {
  await runExample("hello-world", helloWorld);
  await runExample("streaming-poetry", streamingPoetry);
  await runExample("list-files", listFiles);
  await runExample("multi-tool-use", multiToolUse);
  await runExample("history-usage", historyUsage);
};

main();
