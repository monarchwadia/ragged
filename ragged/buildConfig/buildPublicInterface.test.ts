import fs from "fs";

import { buildPublicInterface } from "./buildPublicInterface.js";

describe("buildPublicInterface", () => {
  it("should build the public interface", () => {
    // make a temporary directory
    // create a few files in the directory

    let tmpFolder = ".tmp";
    if (!fs.existsSync(".tmp")) {
      fs.mkdirSync(".tmp");
    }
    const dir = fs.mkdtempSync(tmpFolder + "/ragged-test-");
    fs.writeFileSync(`${dir}/index.ts`, "");
    fs.writeFileSync(`${dir}/file1.ts`, "");
    fs.writeFileSync(`${dir}/file2.ts`, "");
    fs.mkdirSync(`${dir}/subdir`);
    fs.writeFileSync(`${dir}/subdir/index.ts`, "");
    fs.writeFileSync(`${dir}/subdir/file3.ts`, "");
    fs.writeFileSync(`${dir}/subdir/file4.ts`, "");
    fs.mkdirSync(`${dir}/subdir/subsubdir`);
    fs.writeFileSync(`${dir}/subdir/subsubdir/index.ts`, "");
    fs.writeFileSync(`${dir}/subdir/subsubdir/file5.ts`, "");
    fs.writeFileSync(`${dir}/subdir/subsubdir/file6.ts`, "");

    // call generatePublicInterface
    const { esbuildEntryPoints, packageJsonExports } =
      buildPublicInterface(dir);

    // remove the temporary directory
    fs.rmSync(dir, { recursive: true });

    expect(esbuildEntryPoints).toMatchInlineSnapshot(`
      {
        "file1": "./src/public/file1.ts",
        "file2": "./src/public/file2.ts",
        "index": "./src/public/index.ts",
        "subdir/file3": "./src/public/subdir/file3.ts",
        "subdir/file4": "./src/public/subdir/file4.ts",
        "subdir/index": "./src/public/subdir/index.ts",
        "subdir/subsubdir/file5": "./src/public/subdir/subsubdir/file5.ts",
        "subdir/subsubdir/file6": "./src/public/subdir/subsubdir/file6.ts",
        "subdir/subsubdir/index": "./src/public/subdir/subsubdir/index.ts",
      }
    `);

    expect(packageJsonExports).toMatchInlineSnapshot(`
      {
        ".": {
          "import": "./build/esm/index.js",
          "require": "./build/cjs/index.js",
          "types": "./build/src/public/index.d.ts",
        },
        "./file1": {
          "import": "./build/esm/file1.js",
          "require": "./build/cjs/file1.js",
          "types": "./build/src/public/file1.d.ts",
        },
        "./file2": {
          "import": "./build/esm/file2.js",
          "require": "./build/cjs/file2.js",
          "types": "./build/src/public/file2.d.ts",
        },
        "./subdir": {
          "import": "./build/esm/subdir/index.js",
          "require": "./build/cjs/subdir/index.js",
          "types": "./build/src/public/subdir/index.d.ts",
        },
        "./subdir/file3": {
          "import": "./build/esm/subdir/file3.js",
          "require": "./build/cjs/subdir/file3.js",
          "types": "./build/src/public/subdir/file3.d.ts",
        },
        "./subdir/file4": {
          "import": "./build/esm/subdir/file4.js",
          "require": "./build/cjs/subdir/file4.js",
          "types": "./build/src/public/subdir/file4.d.ts",
        },
        "./subdir/subsubdir": {
          "import": "./build/esm/subdir/subsubdir/index.js",
          "require": "./build/cjs/subdir/subsubdir/index.js",
          "types": "./build/src/public/subdir/subsubdir/index.d.ts",
        },
        "./subdir/subsubdir/file5": {
          "import": "./build/esm/subdir/subsubdir/file5.js",
          "require": "./build/cjs/subdir/subsubdir/file5.js",
          "types": "./build/src/public/subdir/subsubdir/file5.d.ts",
        },
        "./subdir/subsubdir/file6": {
          "import": "./build/esm/subdir/subsubdir/file6.js",
          "require": "./build/cjs/subdir/subsubdir/file6.js",
          "types": "./build/src/public/subdir/subsubdir/file6.d.ts",
        },
      }
    `);
  });
});
