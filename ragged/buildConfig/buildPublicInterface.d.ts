declare module buildPublicInterface {
    export function buildPublicInterface(dir: string): { esbuildEntryPoints: Record<string, string>, packageJsonExports: Record<string, string> };
}