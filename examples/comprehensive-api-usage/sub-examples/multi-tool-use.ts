import { Ragged, t } from "../../../ragged/main";

/**
 * This example demonstrates how to use multiple tools in a single chat request.
 * The AI will be able to use the tools to answer the question.
 */
export async function multiToolUse() {
  // first tool
  const adder = t
    .tool()
    .title("adder")
    .description("Add two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a + input.b);

  // second tool
  const multiplier = t
    .tool()
    .title("multiplier")
    .description("Multiply two numbers together")
    .inputs({
      a: t.number().description("first number").isRequired(),
      b: t.number().description("second number").isRequired(),
    })
    .handler((input: { a: number; b: number }) => input.a * input.b);

  const r = new Ragged({
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_CREDS,
    },
  });

  // adding
  const PROMPT1 = "add 123 + 456";
  console.log("prompt:", PROMPT1);
  console.log(
    `answer: `,
    (
      await r
        .chat(PROMPT1, {
          tools: [adder, multiplier],
          requestOverrides: {
            model: "gpt-4",
          },
        })
        .firstToolResult()
    ).result
  );

  // multiplying
  // adding
  const PROMPT2 = "multiply 123 * 456";
  console.log("prompt:", PROMPT2);
  console.log(
    `answer: `,
    (
      await r
        .chat(PROMPT2, {
          tools: [adder, multiplier],
          requestOverrides: {
            model: "gpt-4",
          },
        })
        .firstToolResult()
    ).result
  );
}
