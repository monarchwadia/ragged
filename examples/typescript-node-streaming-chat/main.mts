import { Ragged, t } from "../../ragged/main";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_CREDS = process.env.OPENAI_CREDS;

async function main() {
  // // first tool
  // const adder = t
  //   .tool()
  //   .title("adder")
  //   .description("Add two numbers together")
  //   .inputs({
  //     a: t.number().description("first number").isRequired(),
  //     b: t.number().description("second number").isRequired(),
  //   })
  //   .handler((input: { a: number; b: number }) => input.a + input.b);

  // // second tool
  // const multiplier = t
  //   .tool()
  //   .title("multiplier")
  //   .description("Multiply two numbers together")
  //   .inputs({
  //     a: t.number().description("first number").isRequired(),
  //     b: t.number().description("second number").isRequired(),
  //   })
  //   .handler((input: { a: number; b: number }) => input.a * input.b);

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: OPENAI_CREDS,
    },
  });

  const prompt =
    "hello, hello, hello, is there anybody in there? Just nod if you can hear me. Is there anyone at home?";
  console.log("prompt:", prompt);

  const p$ = r.chatStream([
    {
      type: "text",
      data: {
        sender: "human",
        text: prompt,
      },
    },
  ]);

  p$.subscribe((event) => {
    // if (event.type === "collected") {
    //   console.log(event.payload);
    // }
    if (event.type === "streaming-chat-response") {
      console.log("response:", event.payload);
    }
  });
}

main().catch(console.error);
