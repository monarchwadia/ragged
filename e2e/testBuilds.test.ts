import { TempWorkspace } from "./TempWorkspace";
import fs from "fs";
import path from "path";

describe("(E2E_TEST_SUITE) TempWorkspace", () => {
    // describe("init", () => {
    //     let workspace: TempWorkspace;
    //     let workspacePath: string;

    //     beforeEach(async () => {
    //         workspace = new TempWorkspace();
    //         await workspace.init();
    //         workspacePath = workspace.getTmpDirPath() as string;
    //     });

    //     afterEach(() => {
    //         workspace.destroy();
    //     });

    //     it("should build with moduleResolution = 'node' and module = 'commonjs", () => {

    //     });
    // })
    describe("after running the test", () => {
        let workspace: TempWorkspace;
        let workspacePath: string;

        beforeEach(async () => {
            workspace = new TempWorkspace();
            await workspace.asyncInit();
        });

        it("should create a temporary folder with Ragged built files in its node_modules.", async () => {
            workspace.runTest();
        });
    });
});
