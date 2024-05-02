import { Ragged, t } from "../../../ragged/main";
import type { RaggedHistoryItem } from "../../../ragged/main";

export const historyUsage = async () => {
  // initialize ragged
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // history of responses
  let history: RaggedHistoryItem[] = [];

  // first response
  const PROMPT_1 = "say 'Hello World!'";
  console.log(`[prompt]: ${PROMPT_1}`);
  const firstResponseHistory = await r.chat(PROMPT_1).asHistory();
  firstResponseHistory.forEach((item) => {
    if (item.type === "history.text") {
      console.log(`[history]: ${item.data.text}`);
    }
  });
  history = [...history, ...firstResponseHistory];

  // second response
  const PROMPT_2 = "say 'Hello World!' again";
  console.log(`[prompt]: ${PROMPT_2}`);
  const secondHistoryResponse = await r
    .chat([
      ...history,
      {
        type: "history.text",
        role: "human",
        data: {
          text: PROMPT_2,
        },
      },
    ])
    .asHistory();
  secondHistoryResponse.forEach((item) => {
    if (item.type === "history.text") {
      console.log(`[history]: ${item.data.text}`);
    }
  });
  history = [...history, ...secondHistoryResponse];

  // third response
  const PROMPT_3 = "How many times have you said 'Hello World!' so far?";
  console.log(`[prompt]: ${PROMPT_3}`);
  const thirdHistoryResponse = await r
    .chat([
      ...history,
      {
        type: "history.text",
        role: "human",
        data: {
          text: PROMPT_3,
        },
      },
    ])
    .asHistory();
  thirdHistoryResponse.forEach((item) => {
    if (item.type === "history.text") {
      console.log(`[history]: ${item.data.text}`);
    }
  });
  history = [...history, ...thirdHistoryResponse];

  console.log(`[history.length]:  The history length is ${history.length}`);
};
