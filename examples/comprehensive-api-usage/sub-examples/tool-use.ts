import { Ragged, t } from "../../../ragged/main";
import fs from "fs";

/**
 * This example demonstrates how to list all files in the current directory using Ragged.
 * It uses the `fs` module to read the files in the current directory and returns them as a string.
 */
export const listFiles = async () => {
  // initialize ragged
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // create tool
  const listFilesTool = t
    .tool()
    .title("list-files")
    .description(
      "List files in the current directory using the node.js 'fs' module."
    )
    .handler(() => {
      const files = fs.readdirSync(".");
      return "\n" + files.join("\n");
    });

  // define prompt
  const PROMPT =
    "list all files in the current directory using the 'fs' module.";
  console.log(`[prompt]: ${PROMPT}`);
  const response = await r
    .chat(PROMPT, {
      tools: [listFilesTool],
    })
    .firstToolResult();
  console.log(`[response]: ${response.result}`);
};
