// Minimal ambient types for the Node builtins used in tests. The project ships
// no @types/node; these keep `astro check` green without adding a dependency.
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}
declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}
