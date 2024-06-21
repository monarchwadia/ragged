import { TempWorkspace } from "./TempWorkspace";
import fs from "fs";
import path from "path";

describe("(META_SELFTEST_SUITE) TempWorkspace", () => {
    describe("without init", () => {
        const workspace = new TempWorkspace();
        it("should throw an error when calling getTmpDirPath()", () => {
            expect(() =>
                workspace.getTmpDirPath()
            ).toThrowErrorMatchingInlineSnapshot(
                `"The temporary directory path is not set. Have you initialized the TempWorkspace?"`
            );
        });

        it("should throw an error when calling runTest()", () => {
            expect(() => workspace.runTest()).toThrowErrorMatchingInlineSnapshot(
                `"The temporary directory path is not set. Have you initialized the TempWorkspace?"`
            );
        });

        it("should throw an error when calling destroy()", () => {
            expect(() => workspace.destroy()).toThrowErrorMatchingInlineSnapshot(
                `"The temporary directory path is not set. Have you initialized the TempWorkspace?"`
            );
        });

        it("should throw an error when calling asyncWithBuildSettings()", async () => {
            await expect(
                workspace.asyncChangeWorkspaceProjectSettings({})
            ).rejects.toThrowErrorMatchingInlineSnapshot(
                `"The temporary directory path is not set. Have you initialized the TempWorkspace?"`
            );
        });
    });
    describe("init", () => {
        let workspace: TempWorkspace;
        let workspacePath: string;

        beforeAll(async () => {
            workspace = new TempWorkspace();
            await workspace.asyncInit();
            workspacePath = workspace.getTmpDirPath() as string;
        });

        afterAll(() => {
            workspace.destroy();
        });

        it("should provide a temporary directory path when calling getTmpDirPath()", () => {
            const workspacePath = workspace.getTmpDirPath();
            expect(workspacePath).toBeTruthy();
        });

        it("should have copied the basic project structure", () => {
            expect(fs.readdirSync(path.resolve(workspacePath)))
                .toMatchInlineSnapshot(`
          [
            "index.ts",
            "node_modules",
            "package.json",
            "tsconfig.json",
          ]
        `);
        });

        describe("asyncWithBuildSettings", () => {
            it.each([undefined, 'module', 'commonjs'])("should modify package.json type setting to %s", async (typeSetting) => {
                await workspace.asyncChangeWorkspaceProjectSettings({
                    packageJson: {
                        type: typeSetting as any,
                    }
                });

                expect(
                    JSON.parse(fs.readFileSync(path.resolve(workspacePath, "package.json"), "utf-8")).type
                ).toEqual(typeSetting);
            });

            describe("can modify tsconfig type setting", () => {
                it("can set to commonjs/node", async () => {
                    await workspace.asyncChangeWorkspaceProjectSettings({
                        tsconfig: {
                            compilerOptions: {
                                module: "commonjs",
                                moduleResolution: "node",
                            }
                        }
                    });

                    const tsconfig = JSON.parse(fs.readFileSync(path.resolve(workspacePath, "tsconfig.json"), "utf-8")) as any;

                    expect(tsconfig.compilerOptions.module).toEqual("commonjs");
                    expect(tsconfig.compilerOptions.moduleResolution).toEqual("node");
                });

                it("can set to ESNext/ESNext", async () => {

                    await workspace.asyncChangeWorkspaceProjectSettings({
                        tsconfig: {
                            compilerOptions: {
                                module: "ESNext",
                                moduleResolution: "ESNext",
                            }
                        }
                    });

                    const tsconfig = JSON.parse(fs.readFileSync(path.resolve(workspacePath, "tsconfig.json"), "utf-8")) as any;

                    expect(tsconfig.compilerOptions.module).toEqual("ESNext");
                    expect(tsconfig.compilerOptions.moduleResolution).toEqual("ESNext");
                });
            });
        });
    });
});
