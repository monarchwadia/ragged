import * as fs from 'fs';
import * as path from 'path';

interface EsbuildEntryPoints {
    [key: string]: string;
}

interface PackageExportsEntry {
    require?: string;
    import?: string;
    types?: string;
}

interface PackageJsonExports {
    [key: string]: PackageExportsEntry;
}

export function buildPublicInterface(pathToSrcPublicFolder: string) {
    const esbuildEntryPoints = {} as EsbuildEntryPoints;
    const packageJsonExports = {} as PackageJsonExports;

    function processDirectory(currentPath: string) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(pathToSrcPublicFolder, fullPath);

            if (entry.isDirectory()) {
                processDirectory(fullPath);
            } else if (entry.isFile()) {
                // we only support ts and dts files
                if (!relativePath.endsWith('.ts') || relativePath.endsWith('.d.ts')) {
                    throw new Error(`Unexpected file type for file [${relativePath}] . We only support .ts files.`);
                }

                // esbuild entrypoint don't have .ts extension
                let esBuildEntryKey = relativePath.slice(0, -3);

                let packageJsonEntryKey = '';
                if (relativePath === 'index.ts') {
                    packageJsonEntryKey = '.';
                } else {
                    packageJsonEntryKey = relativePath.slice(0, -3)
                    // if it starts with ./, remove it
                    packageJsonEntryKey = packageJsonEntryKey.startsWith('.') ? packageJsonEntryKey : './' + packageJsonEntryKey;
                    // if it ends in /index, remove it
                    packageJsonEntryKey = packageJsonEntryKey.endsWith('/index') ? packageJsonEntryKey.slice(0, -6) : packageJsonEntryKey;
                }


                if (!packageJsonExports[packageJsonEntryKey]) {
                    packageJsonExports[packageJsonEntryKey] = {};
                }

                packageJsonExports[packageJsonEntryKey].import = `./build/esm/${relativePath.replace('.ts', '.js')}`;
                packageJsonExports[packageJsonEntryKey].require = `./build/cjs/${relativePath.replace('.ts', '.js')}`;
                // types are always d.ts
                packageJsonExports[packageJsonEntryKey].types = `./build/src/public/${relativePath}`.slice(0, -3) + '.d.ts';

                if (!esbuildEntryPoints[esBuildEntryKey]) {
                    let buildPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
                    buildPath = './' + path.join('./src/public', buildPath);
                    // prepend ./src/public
                    esbuildEntryPoints[esBuildEntryKey] = buildPath;
                }


                // if (relativePath.endsWith('.ts') && !relativePath.endsWith('.d.ts')) {

                //     esbuildEntryPoints[esBuildEntryKey] = buildPath;

                //     if (!packageJsonExports[esBuildEntryKey]) {
                //         packageJsonExports[esBuildEntryKey] = {};
                //     }
                //     packageJsonExports[esBuildEntryKey].import = `./build/esm/${relativePath.replace('.ts', '.js')}`;
                //     packageJsonExports[esBuildEntryKey].require = `./build/cjs/${relativePath.replace('.ts', '.js')}`;
                // }

                // if (relativePath.endsWith('.d.ts')) {
                //     if (!packageJsonExports[esBuildEntryKey]) {
                //         packageJsonExports[esBuildEntryKey] = {};
                //     }
                //     packageJsonExports[esBuildEntryKey].types = `./build/src/public/${relativePath}`;
                // }
            }
        }
    }

    processDirectory(pathToSrcPublicFolder);

    return { esbuildEntryPoints, packageJsonExports };
}



// import fs from "fs";
// import path, { relative } from "path";

// export const buildPublicInterface = (rootDir: string) => {

//     const state = {
//         sourceFiles: [] as string[],
//         typeFiles: [] as string[]
//     }

//     walk(rootDir, (filepath) => {
//         if (filepath.endsWith(".d.ts")) {
//             state.typeFiles.push(filepath);
//         } else if (filepath.endsWith(".ts")) {
//             state.sourceFiles.push(filepath);
//         }
//     });

//     console.log(state)

//     // generate package.json exports declaration
//     // for example, 
//     /*
//       "exports": {
//     "./chat": {
//       "require": "./build/cjs/chat/index.js",
//       "import": "./build/esm/chat/index.js",
//       "types": "./build/src/public/chat/index.d.ts"
//     },
//     "./chat/adapter": {
//       "types": "./build/src/public/chat/adapter/index.d.ts"
//     }
//   },*/

//     const packageJsonExports: any = {};

//     state.sourceFiles.forEach((absPath) => {
//         const { relativePath, dirPath } = getPaths(rootDir, absPath);

//         if (!packageJsonExports[dirPath]) {
//             packageJsonExports[dirPath] = {};
//         }

//         packageJsonExports[dirPath]['types'] = './build/esm/' + relativePath;
//     });

//     state.typeFiles.forEach((typeFile) => {
//         const { relativePath, dirPath } = getPaths(rootDir, typeFile);

//         // if dirpath = ., then ./
//         // if dirpath = somedir, then ./somedir
//         if (!packageJsonExports[dirPath]) {
//             packageJsonExports[dirPath] = {};
//         }

//         packageJsonExports[dirPath]['import'] = './build/esm/' + relativePath;
//         packageJsonExports[dirPath]['require'] = './build/cjs/' + relativePath;
//     });

//     // generate esbuild entryPoints
//     // for example,
//     /*
//     const entryPoints = {
//         'chat/index': './src/public/chat/index.ts',
//         'chat/adapter/index': './src/public/chat/adapter/index.ts',
//     }
//     */

//     const esbuildEntryPoints: any = {};

//     state.sourceFiles.forEach((sourceFile) => {
//         const { relativePath, dirPath } = getPaths(rootDir, sourceFile);
//         esbuildEntryPoints[dirPath] = relativePath;
//     });


//     return { packageJsonExports, esbuildEntryPoints };
// }

// const getPaths = (rootDir: string, absPath: string) => {
//     // generate relative path
//     const relativePath = path.relative(rootDir, absPath);

//     // generate relative path to folder that contains the file
//     let dirPath = path.dirname(relativePath);

//     dirPath = dirPath === '.' ? './' : './' + dirPath;

//     return {
//         relativePath,
//         dirPath
//     }
// }


// const walk = (rootDir: string, cb: (filepath: string) => void) => {
//     const rootDirAbsPath = path.resolve(rootDir);
//     console.log("rootDirAbsPath", rootDirAbsPath);

//     const files = fs.readdirSync(rootDir);
//     for (const file of files) {
//         const filepath = rootDirAbsPath + '/' + file;
//         // const filepath = `${rootDir}/${file}`;
//         const stat = fs.statSync(filepath);
//         if (stat.isDirectory()) {
//             walk(filepath, cb);
//         } else {
//             cb(filepath);
//         }
//     }
// }