// @ts-check

import * as esbuild from "esbuild";
import fs from "fs";

import { buildPublicInterface } from "./buildConfig/buildPublicInterface";
import { updatePackageJsonEntrypoints } from "./buildConfig/updatePackageJsonEntrypoints";

// const entryPoints = {
//     'chat/index': './src/public/chat/index.ts',
//     // 'chat/adapter/index': './src/public/chat/adapter/index.ts',
// }

const __dirname = new URL(".", import.meta.url).pathname;

async function main() {
    // update packagejson
    updatePackageJsonEntrypoints({
        pathToRaggedDir: __dirname
    });


    const { esbuildEntryPoints } = buildPublicInterface('./src/public');
    // esm minified
    await esbuild.build({
        entryPoints: esbuildEntryPoints,
        outdir: 'build/esm',
        bundle: true,
        // outfile: `./build/src/index.js`,
        platform: "neutral",
        logLevel: "info",
        target: ["es6"],
        format: "esm",
        minify: true,
        tsconfig: "./buildConfig/tsconfig.esm.json"
    });

    // Build CommonJS minified
    await esbuild.build({
        entryPoints: esbuildEntryPoints,
        outdir: 'build/cjs',
        bundle: true,
        platform: "neutral",
        logLevel: "info",
        target: ["es6"],
        format: "cjs",
        minify: true,
        tsconfig: "./buildConfig/tsconfig.cjs.json"
    });

    fs.copyFileSync('./buildConfig/cjs.package.json', './build/cjs/package.json');

    // and same for esm
    fs.copyFileSync('./buildConfig/esm.package.json', './build/esm/package.json');
}

main()
    .then(() => console.log("done"))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });


// temporarily here

// const adder = new RaggedTool()
// .title("adder")
// .example({
//   description: "Add two numbers together",
//   input: [1, 2],
//   output: 3,
// })
// .example({
//   description: "Empty array will return 0",
//   input: [],
//   output: 0,
// })
// .handler((input: number[]) => {
//   const result = input.reduce((a, b) => a + b, 0);
//   console.log(result); // 15275636
//   return result;
// });

// import { ChatCompletionTool } from "openai/resources/index.mjs";

// const buildCallTool = ()/*: ChatCompletionTool */ => ({
//   type: "function",
//   function: {
//     name: "callTool",
//     description:
//       "Calls a tool with a given name and input. Tools are all accessible via a unified interface. The only tool available to the GPT model is `callTool`, which allows the model to call a tool with a given name and input.",
//     parameters: {
//       type: "object",
//       properties: {
//         name: {
//           type: "string",
//           description:
//             "The name of the tool to call. A list of tools will be provided in the context, in a section called 'Tools Catalogue'.",
//         },
//         data: {
//           description:
//             "The input to the tool. The format of this input will depend on the tool being called.",
//         },
//       },
//       required: ["name"],
//     },
//   },
// });