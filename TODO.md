* Need to fix imports to work with Node projects.
  * https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library
  * https://esbuild.github.io/content-types/#isolated-modules
  * Need to do the following:
    * Rename all file imports to end in .js
    * Create new build process
      * Give a single emission approach a shot, first
      * The build should first begin with a fresh folder, with no files in it.
      * Copy over the package.json, LICENSE.md, README.md
      * Create a `build` folder inside it
      * Create a build that's pure nodejs, starting in the public directory (i think already done)
      * Emit type definitions, starting in the public directory (i dont think this is done)
        * MAKE SURE EVERY *.js FILE HAS A CORRESPONDING *.d.ts FILE!!

* Need to add documentation for embeddings.
* Need examples for embeddings.