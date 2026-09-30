// ── test/node-shims.d.ts ──────────────────────────────────────────
// El proyecto NO instala @types/node (tsconfig `types` es solo vitest +
// jest-dom), así que un test no puede importar `node:fs` con tipos.
// El único test que lo necesita es el de capas
// (store/__tests__/layering.test.ts), que lee el grafo de imports del repo
// para verificar que las capas no se invierten. En runtime sí corre en Node
// (el test usa @vitest-environment node); esto es solo la declaración.

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string;
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string): string[];
  export function readdirSync(path: string, options: { withFileTypes: true }): Array<{ name: string; isDirectory(): boolean }>;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function dirname(path: string): string;
  export function resolve(...parts: string[]): string;
}

declare const process: { cwd(): string };
