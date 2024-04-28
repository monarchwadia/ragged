import { Ragged, t } from "../../ragged/main";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const main = async () => {
  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  const response = await r
    .chat(
      [
        {
          type: "history.text",
          role: "human",
          data: {
            text: "hello!",
          },
        },
      ],
      {
        tools: [
          t
            .tool()
            .title("list-files")
            .description("List files in the current directory")
            .handler(() => {
              const files = fs.readdirSync(".");
              return files.join("\n");
            }),
        ],
      }
    )
    .subscribe((e) => {
      if (e.type === "text.joined") {
        console.log(e.data);
      }

      if (e.type === "tool.finished") {
        console.log(e.data.result);
      }
    });
  console.log(response);
};

main();
