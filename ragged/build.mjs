import * as esbuild from "esbuild";

/**
 * Options for the base build function
 * @typedef {Object} BaseOptions
 * @property {string} name - Gets interpolated into the output filename
 * @property {"browser" | "node" | "neutral"} platform - which platform
 * @property {"esm" | "ejs"} format - The format
 * @property {string?} target - The target
 * @property {boolean} minify - Minify the output
 */

/**
 * Base build function
 * @param {BaseOptions} options
 */
async function base(options) {
  // same as in package.json
  // TODO: Source maps https://esbuild.github.io/api/#sourcemap
  const opts = {
    entryPoints: ["./main.ts"],
    bundle: true,
    outfile: `./build/ragged.${options.name}.js`,
    platform: options.platform,
    format: options.format,
    logLevel: "info",
    minify: options.minify,
  }

  if (options.platform) {
    opts.platform = options.platform;
  }

  await esbuild.build(opts);
}

async function main() {
  // esm module build
  await base({
    name: "module", platform: "neutral", format: "esm",
  });

  // esm minified
  await base({
    name: "module.min", platform: "neutral", format: "esm", minify: true,
  });

  // node build
  await base({
    name: "node", platform: "node", format: "cjs",
  });

  // node minified
  await base({
    name: "node.min", platform: "node", format: "cjs", minify: true,
  });

  // browser build
  await base({
    name: "browser", platform: "browser", format: "esm",
    target: "firefox70,safari12",
  });

  // browser minified
  await base({
    name: "browser.min", platform: "browser", format: "esm",
    target: "firefox70,safari12",
    minify: true,
  });
}

main()
  .then(() => console.log("done"))
  .catch((e) => {
    console.error(e);
    // @ts-expect-error process doesn't exist in browser TS types
    process.exit(1);
  });
