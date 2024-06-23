import { BuildSettings, TempWorkspace } from "./TempWorkspace";
import Chalk from 'chalk';

let workspace: TempWorkspace;

const packageJsonTypes = ["module", "commonjs"];
const tsconfigModules = ["commonjs", "ESNext"];
const tsconfigModuleResolutions = ["node", "ESNext", "Bundler"];


const combinations: BuildSettings[] = [];
const logError: typeof console.error = (...args: any[]) => console.error(Chalk.red(...args));

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

const main = async () => {
    const reports: Report[] = [];
    for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        console.log(Chalk.yellow('============================================================\n'))
        console.log(`PackageJsonType = ${combo.packageJson?.type}, tsconfigModule = ${combo.tsconfig?.compilerOptions?.module}, tsconfigModuleResolution = ${combo.tsconfig?.compilerOptions?.moduleResolution}`)

        const { packageJson, tsconfig } = combo;
        workspace = new TempWorkspace();
        await workspace.asyncInit();

        // it(`should build with packageJsonType = ${packageJson?.type}, tsconfigModule = ${tsconfig?.compilerOptions?.module}, tsconfigModuleResolution = ${tsconfig?.compilerOptions?.moduleResolution}`, async () => {
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

        const report: Report = {
            packageJsonType: packageJson?.type ?? "undefined",
            tsconfigModule: tsconfig?.compilerOptions?.module ?? "undefined",
            tsconfigModuleResolution: tsconfig?.compilerOptions?.moduleResolution ?? "undefined",
            error: "",
            // pass by default
            passed: "✅"
        }

        try {
            workspace.runTest();
            console.log(Chalk.green('PASSED!'));
        } catch (e: any) {
            logError("FAILED COMBO", JSON.stringify(combo));
            report.error = e?.message || "unknown error";
            report.passed = "❌";
            continue;
        } finally {
            workspace.destroy();
            reports.push(report);
        }
    }

    // tabulate the reports
    console.log(JSON.stringify(reports, null, 2));
    logReports(reports);
}

type Report = {
    packageJsonType: string,
    tsconfigModule: string,
    tsconfigModuleResolution: string,
    error: string,
    passed: "✅" | "❌"
}

main().then(() => console.log("done")).catch(e => console.error(e));


const logReports = (reports: Report[]) => {
    const transformForConsoleTable = (data: Report[]): any[] => {
        return data.map((item) => ({
            'Package JSON Type': item.packageJsonType,
            'TS Config Module': item.tsconfigModule,
            'TS Config Module Resolution': item.tsconfigModuleResolution,
            'Error': item.error,
            'Passed': item.passed,
        }));
    };

    const tableReports = transformForConsoleTable(reports);

    for (let i = 0; i < tableReports.length; i++) {
        const report = tableReports[i];
        console.table(report);

        if (report['Error']) {
            logError(report['Error']);
        }
    }

    // console.table();
}