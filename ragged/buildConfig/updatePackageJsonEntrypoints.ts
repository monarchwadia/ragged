import path from 'path';

import PackageJson from '@npmcli/package-json';
import { buildPublicInterface } from './buildPublicInterface.js'

type Params = {
    pathToRaggedDir: string
}
export const updatePackageJsonEntrypoints = async (params: Params) => {
    const pkgJson = await PackageJson.load(path.join(params.pathToRaggedDir));

    const { packageJsonExports } = buildPublicInterface(path.join(params.pathToRaggedDir, 'src/public'));

    pkgJson.update({
        exports: packageJsonExports as any
    })

    await pkgJson.save();
}

