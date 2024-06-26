// @ts-check

import * as esbuild from "esbuild";

// const entryPoints = {
//     'chat/index': './src/public/chat/index.ts',
//     // 'chat/adapter/index': './src/public/chat/adapter/index.ts',
// }

const __dirname = new URL(".", import.meta.url).pathname;

async function main() {
    // Build CommonJS minified
    await esbuild.build({
        entryPoints: [
            './src/index.ts',
        ],
        outdir: 'build',
        bundle: true,
        platform: "node",
        logLevel: "info",
        target: ["node18.16.0"],
        format: "cjs",
        minify: true,
        tsconfig: "./tsconfig.build.json"
    });
}

main()
    .then(() => console.log("done"))
    .catch((e) => {
        console.error(e);
        // @ts-expect-error
        process.exit(1);
    });

