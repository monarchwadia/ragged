import { BuildSettings, TempWorkspace } from "./TempWorkspace";
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
    describe("build settings and targets", () => {
        let workspace: TempWorkspace;
        let workspacePath: string;

        beforeEach(async () => {
            workspace = new TempWorkspace();
            await workspace.asyncInit();
        });

        afterEach(() => {
            workspace.destroy();
        });

        const packageJsonTypes = [undefined, "module", "commonjs"];
        const tsconfigModules = [undefined, "commonjs", "ESNext"];
        const tsconfigModuleResolutions = [undefined, "node", "ESNext"];
        const combinations: BuildSettings[] = [];

        packageJsonTypes.forEach(packageJsonType => {
            tsconfigModules.forEach(tsconfigModule => {
                tsconfigModuleResolutions.forEach(tsconfigModuleResolution => {
                    combinations.push({
                        packageJson: {
                            type: packageJsonType as any
                        },
                        tsconfig: {
                            compilerOptions: {
                                module: tsconfigModule as any,
                                moduleResolution: tsconfigModuleResolution as any
                            }
                        }
                    });
                });
            });
        });

        combinations.forEach((combo) => {
            const { packageJson, tsconfig } = combo;

            it(`should build with packageJsonType = ${packageJson?.type}, tsconfigModule = ${tsconfig?.compilerOptions?.module}, tsconfigModuleResolution = ${tsconfig?.compilerOptions?.moduleResolution}`, async () => {
                await workspace.asyncChangeWorkspaceProjectSettings({
                    packageJson: {
                        type: packageJson?.type as any
                    },
                    tsconfig: {
                        compilerOptions: {
                            module: tsconfig?.compilerOptions?.module,
                            moduleResolution: tsconfig?.compilerOptions?.moduleResolution
                        }
                    }
                });

                try {
                    workspace.runTest();
                } catch (e) {
                    console.error("FAILED COMBO", JSON.stringify(combo));
                    throw e;
                }
            });
        })

        // it("Builds and runs", async () => {
        //     workspace.asyncChangeWorkspaceProjectSettings({
        //         packageJson: {
        //             type: "commonjs"
        //         },
        //         tsconfig: {
        //             compilerOptions: {
        //                 module: "commonjs",
        //                 moduleResolution: "node"
        //             }
        //         }
        //     })
        //     workspace.runTest();
        // });
    });
});
