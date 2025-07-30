/**
 * This script tests various TypeScript module and moduleResolution combinations
 * by creating temporary workspaces, updating their tsconfig.json and package.json,
 * and running TypeScript builds. It helps ensure that the Ragged module and its
 * dependencies work correctly across a wide range of consumer project setups.
 *
 * Each combination is tried in isolation, and results are tabulated and printed.
 * Invalid or legacy combinations are excluded. This is intended for E2E validation
 * of build compatibility, not for CI or production use.
 */
import { BuildSettings, TempWorkspace } from "./TempWorkspace";
import Chalk from 'chalk';

let workspace: TempWorkspace;

const combinations: BuildSettings[] = [
  // CommonJS module
  {
    packageJson: { type: "commonjs" },
    tsconfig: { compilerOptions: { module: "commonjs", moduleResolution: "node" } }
  },
  // ESNext module with node16 resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "Node16", moduleResolution: "node16" } }
  },
  // ESNext module with nodenext resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "nodenext", moduleResolution: "nodenext" } }
  },
  // Bundler module (only valid with preserve or es2015+)
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "es2015", moduleResolution: "bundler" } }
  },
  // CommonJS module with node10 resolution
  {
    packageJson: { type: "commonjs" },
    tsconfig: { compilerOptions: { module: "commonjs", moduleResolution: "node10" } }
  },
  // ES2015+ module with bundler resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "es2015", moduleResolution: "bundler" } }
  },
  // ESNext module with node10 resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "ESNext", moduleResolution: "node10" } }
  },
  // es2015 module with node10 resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "es2015", moduleResolution: "node10" } }
  },
  // NodeNext module with nodenext resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "NodeNext", moduleResolution: "nodenext" } }
  },
  // ESNext module with node resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "ESNext", moduleResolution: "node" } }
  },
  // ES2015 module with node resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "es2015", moduleResolution: "node" } }
  },
  // ESNext module with bundler resolution
  {
    packageJson: { type: "module" },
    tsconfig: { compilerOptions: { module: "ESNext", moduleResolution: "bundler" } }
  },
  // ...existing code...
];
const logError: typeof console.error = (...args: any[]) => console.error(Chalk.red(...args));

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
                    module: tsconfig?.compilerOptions?.module as any,
                    moduleResolution: tsconfig?.compilerOptions?.moduleResolution as any
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