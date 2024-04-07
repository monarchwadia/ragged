import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const main = async () => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_CREDS });
  const r = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
# Tools Catalogue

Here are the available tools.

## add

Adds two numbers together.

Example:

{
  type: "add",
  payload: [1, 2], // returns 3
} 

{
  type: "add",
  payload: [5, 6, 0], // returns 11
}

{
  type: "add",
  payload: [], // returns 0
}

`,
      },
      {
        role: "user",
        content: "What is 1124124 + 14151512?",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "callTool",
          description:
            "Calls a tool with a given name and input. Tools are all accessible via a unified interface. The only tool available to the GPT model is `callTool`, which allows the model to call a tool with a given name and input.",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description:
                  "The name of the tool to call. A list of tools will be provided in the context, in a section called 'Tools Catalogue'.",
              },
              payload: {
                description:
                  "The input to the tool. The format of this input will depend on the tool being called.",
              },
            },
            required: ["name"],
          },
        },
      },
    ],
  });

  console.log(JSON.stringify(r.choices[0]));
};

main().then(console.log).catch(console.error);
