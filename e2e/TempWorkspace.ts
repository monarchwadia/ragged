import fs from "fs";
import { tmpdir } from "os";
import path from "path";
import { mkdtemp } from "node:fs/promises";
import { join } from 'node:path'
import { exec, execSync } from "child_process";

const doExecSync: typeof execSync = (...args: any[]) => {
    console.log("command: ", args[0]);

    // @ts-expect-error - who cares, this clearly works.
    return execSync(...args);
}

export class TempWorkspace {
    private directoryPath: string | undefined;

    constructor() { }

    /**
     * Creates a temporary directory and copies Ragged's built files into it.
     * The Ragged file are the same ones as installed in this e2e project.
     */
    async init() {
        // Create a temporary directory
        this.directoryPath = await mkdtemp(join(tmpdir(), 'build-'))

        try {
            // if we ever need to copy dotfiles, we can use this
            // doExecSync(`cp -r "${join(__dirname, "project-template/.*")}" "${this.directoryPath}"`);
            doExecSync(`cp -r ${join(__dirname, "project-template")}/* "${this.directoryPath}"`, { cwd: __dirname });
            doExecSync(`pnpm install`, { cwd: this.directoryPath });
        } catch (e: any) {
            console.error(e);
            if (e.output) {
                console.error(e.output.toString());
            }
            throw new Error("Failed to initialize a new project in the temporary directory.");
        }

        // Copy Ragged's built files into it

        try {
            const raggedOriginPath = join(__dirname, "node_modules", "ragged");
            console.log(raggedOriginPath);
            const raggedDestinationPath = path.resolve(this.directoryPath, "node_modules", "ragged");
            doExecSync(`rm -rf "${raggedDestinationPath}"`);
            doExecSync(`mkdir -p "${raggedDestinationPath}/node_modules"`);
            doExecSync(`cp -r "${raggedOriginPath}" "${raggedDestinationPath}"`);
        } catch (e: any) {
            console.error(e);
            throw new Error("Failed to copy Ragged's built files into the temporary directory.");
        }
    }

    /**
     * Returns the path of the temporary directory.
     */
    getTmpDirPath() {
        return this.directoryPath;
    }

    runTest() {
        try {
            doExecSync(`pnpm tsx index.ts`, { cwd: this.directoryPath });
        } catch (e: any) {
            console.error(e);
            throw new Error("Failed to copy Ragged's built files into the temporary directory.");
        }
    }

    // destroy() {
    //     fs.rmdirSync(this.directoryPath, { recursive: true });
    // }
}