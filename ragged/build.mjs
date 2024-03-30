// @ts-check

import * as esbuild from "esbuild";

async function main() {
  // esm minified
  await esbuild.build({
    entryPoints: ["./main.ts"],
    bundle: true,
    outfile: `./build/ragged.js`,
    platform: "neutral",
    logLevel: "info",
    target: ["es6"],
    format: "esm",
    minify: false
  });
}

main()
  .then(() => console.log("done"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
