import { config } from "dotenv";
config();
import { program } from "commander";
import fs from "fs";
import { Chat } from "ragged/chat";

const OUTPUT_DIR = "./.output";

const c = Chat.with("openai", {
    apiKey: process.env.OPENAI_API_KEY
})

// first ask the user for the prefix name of the types. For example, OpenAi. also ask for the filepath to the input dir.

program
    .requiredOption("-p, --prefix <prefix>", "prefix for the types")
    .requiredOption("-i, --input <input>", "input directory path")
    .parse(process.argv);

const { prefix, input } = program.opts();

// check if the input dir exists

if (!fs.existsSync(input) || !fs.lstatSync(input).isDirectory()) {
    console.error("Input directory does not exist");
    process.exit(1);
}

// check if there is a request-body.json and response-body.json in the input dir

if (!fs.existsSync(`${input}/request-body.json`) || !fs.existsSync(`${input}/response-body.json`)) {
    console.error("Input directory must contain request-body.json and response-body.json");
    process.exit(1);
}

// ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// ensure prefix is a-zA-Z. If not, throw an error.
if (!/^[a-zA-Z0-9]+$/.test(prefix)) {
    console.error("Prefix must be a string of letters or numbers");
    process.exit(1);
}

// then, using the prefix, generate typings for the LlmRequest and LlmResponse. For example, OpenAiRoot.
const requestBody = fs.readFileSync(`${input}/request-body.json`, "utf-8");
const responseBody = fs.readFileSync(`${input}/response-body.json`, "utf-8");

// now, generate the types for the request and response bodies

await c.chat(`
Generate typescript typings for the following JSON:
${requestBody}
`);
const requestBodyTypes = c.history.at(-1)?.text;

await c.chat(`
Generate typescript typings for the following JSON:
${responseBody}
`);
const responseBodyTypes = c.history.at(-1)?.text;

if (!requestBodyTypes || !responseBodyTypes) {
    console.error("Failed to generate types");
    process.exit(1);
}

// output the types to a file in the output directory

fs.writeFileSync(`${OUTPUT_DIR}/${prefix}Request.ts`, requestBodyTypes);
fs.writeFileSync(`${OUTPUT_DIR}/${prefix}Response.ts`, responseBodyTypes);

// then get the typings for the RaggedRequest and RaggedResponse.



// then generate the mappings for the LlmRequest and LlmResponse to the RaggedRequest and RaggedResponse.

// then generate tests for the mappings.

// then output all of the above to a file.
