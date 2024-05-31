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
  const PROMPT_1 = "Current value is 123415135. increment by 123413636236 using the provided adder tool!'";
  console.log(`[prompt]: ${PROMPT_1}`);
  const chatStream = await r.chat(PROMPT_1, { tools });
  const firstResponseHistory = await chatStream.asHistory();
  history = [...history, ...firstResponseHistory];
  const chatStream2 = await r.chat(history, { tools });
  const toolUseResponse = await chatStream2.firstText();
  console.log("TOOL USE RESPONSE", toolUseResponse);
};
