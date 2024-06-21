import { TempWorkspace } from "./TempWorkspace";
import fs from "fs";
import path from "path";

describe("TempWorkspace", () => {
    describe("init", () => {
        let workspace: TempWorkspace;
        let workspacePath: string;

        beforeAll(async () => {
            workspace = new TempWorkspace();
            await workspace.init();
            workspacePath = workspace.getTmpDirPath() as string;
        });

        it("should provide a temporary directory path when calling getTmpDirPath()", () => {
            const workspacePath = workspace.getTmpDirPath();
            expect(workspacePath).toBeTruthy();
        });

        it("should create a temporary folder with Ragged built files in its node_modules.", async () => {
            const raggedModule = fs.statSync(
                path.resolve(workspacePath, "node_modules", "ragged")
            );
            expect(raggedModule.isDirectory()).toStrictEqual(true);
        });

        it("should have copied the basic project structure", () => {

            expect(fs.readdirSync(path.resolve(workspacePath))).toMatchInlineSnapshot(`
          [
            "index.ts",
            "node_modules",
            "package.json",
            "pnpm-lock.yaml",
            "tsconfig.json",
          ]
        `);
        });

        it("should run the test", async () => {

        });
    })
});
