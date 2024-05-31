import { Ragged, t } from "../../../ragged/main";
import type { RaggedHistoryItem } from "../../../ragged/main";

export const historyWithToolUse = async () => {
  // initialize ragged
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // create tool
  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a + input.b);

  const tools = [adder];

  // history of responses
  let history: RaggedHistoryItem[] = [];

  // first response
  const PROMPT_1 = "Current value is 0. increment by 250 using the adder tool!'";
  console.log(`[prompt]: ${PROMPT_1}`);
  const firstResponseHistory = await r.chat(PROMPT_1, { tools }).asHistory();
  history = [...history, ...firstResponseHistory];
  console.log("HISTORY AFTER FIRST CALL ===============\n", history, "\n====================");
  const toolUseResponse = await r.chat(history, { tools }).asHistory();
  history = [...history, ...toolUseResponse];
  console.log("HISTORY AFTER SECOND CALL ===============\n", history, "\n====================");
};
