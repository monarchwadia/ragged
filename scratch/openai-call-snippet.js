import OpenAI from "openai";
import fs from "fs";

const OPENAI_API_KEY = "your openai key here"

const o = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const chunks = [];

const main = async () => {
    const stream = await o.chat.completions.create({
        stream: true,
        model: "gpt-4",
        messages: [
            {
                role: "user",
                content: "Use the tool to add 1 + 1"
            }
        ],
        tool_choice: {
            type: "function",
            function: {
                name: "adder",
            }
        },
        tools: [
            {
                type: "function",
                function: {
                    name: "adder",
                    description: "Adds two numbers together. Returns a number.",
                    parameters: {
                        type: "object",
                        "properties": {
                            a: {
                                type: "number",
                                description: "The first number"
                            },
                            b: {
                                type: "number",
                                description: "The second number"
                            },
                        },
                        required: ["a", "b"]
                    }
                }
            }
        ]

    })

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    fs.writeFileSync("stream-output.test.json", JSON.stringify(chunks, null, 2));

}

main().then(() => console.log("Done!")).catch(console.error);