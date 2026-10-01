// ── test/docs-sync.test.ts ───────────────────────────────────────
// Doc test (mejoras-deep §3.1.1): los contadores que README/AGENTS/CLAUDE
// afirman sobre el repo se MIDEN acá contra el código. Si alguien agrega
// un lab, un comando, un hook, una composition o un archivo de test sin
// actualizar los docs, este test falla y dice qué número quedó viejo.
//
// Sobre "3295 tests": el total de tests no se puede derivar estáticamente
// sin parsear `it(` (frágil). El proxy es la cantidad de ARCHIVOS de test,
// que es el número que siempre arrastra al doc — y este test es en sí mismo
// un archivo de test más, así que agregarlo ya obligó a subir los contadores.
//
// El repo no instala @types/node: `node:fs`/`node:path` se declaran en
// `src/test/node-shims.d.ts` (de ahí el uso de readdirSync withFileTypes).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { ACADEMY_PATHS, getAllLessons } from '../academy/paths';
import { SCENARIOS, VISIBLE_SCENARIOS } from '../laboratorios/laboratorios';
import { compositionBlocks, remotionSource } from '../video/remotion/__tests__/remotionFixtures';

// ── Medición (la realidad manda: esto es la fuente de verdad) ─────
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/** Archivos de un dir, recursivo. El predicado recibe el NOMBRE del archivo. */
function walk(dir: string, esArchivo: (nombre: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, esArchivo));
    else if (esArchivo(entry.name)) out.push(full);
  }
  return out;
}

/** Sólo archivos directos: sin recursar en `__tests__/` ni otros subdirs. */
function directos(dir: string, esArchivo: (nombre: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => !entry.isDirectory() && esArchivo(entry.name))
    .map(entry => join(dir, entry.name));
}

const archivosDeTest = walk(SRC, nombre => /\.test\.(ts|tsx)$/.test(nombre));
const specsE2e = walk(join(ROOT, 'e2e'), nombre => nombre.endsWith('.spec.ts'));
const testsE2e = specsE2e.reduce(
  (n, f) => n + (readFileSync(f, 'utf8').match(/^\s*test\(/gm)?.length ?? 0),
  0,
);

const builtin = directos(join(SRC, 'commands', 'builtin'), n => n.endsWith('.ts') && n !== 'index.ts');
const tools = directos(join(SRC, 'commands', 'tools'), n => n.endsWith('.ts') && n !== 'index.ts');
const barrel = readFileSync(join(SRC, 'commands', 'tools', 'index.ts'), 'utf8');
const comandosTools = new Set(barrel.match(/cmd_\w+/g) ?? []).size;
const hooks = directos(join(SRC, 'hooks'), n => /^use[A-Z].*\.ts$/.test(n));
const composiciones = compositionBlocks(remotionSource('Root.tsx')).length;
const lecciones = getAllLessons().length;

// Rango real de labs (laboratorio01-08 → se recalcula solo con 09, 10…)
const numerosLab = walk(join(SRC, 'laboratorios'), n => /laboratorio\d+\.ts$/.test(n))
  .map(f => f.match(/laboratorio(\d+)\.ts$/)?.[1] ?? '')
  .filter(Boolean)
  .sort();
const rangoLabs = `laboratorio${numerosLab[0]}-${numerosLab[numerosLab.length - 1]}`;
const ocultos = SCENARIOS.length - VISIBLE_SCENARIOS.length;

// ── Verificación ──────────────────────────────────────────────────
function contiene(archivo: string, fragmento: string): void {
  const texto = readFileSync(join(ROOT, archivo), 'utf8');
  expect(
    texto.includes(fragmento),
    `${archivo} ya no contiene «${fragmento}» — el contador del doc quedó viejo. ` +
    'Actualizá README/AGENTS.md/CLAUDE.md en el mismo commit que movió el número.',
  ).toBe(true);
}

describe('doc test: los contadores de los docs contra la realidad', () => {
  it('los labs declarados en SCENARIOS son los archivos de lab existentes', () => {
    expect(SCENARIOS.length, 'hay archivos de lab sin registrar en SCENARIOS')
      .toBe(numerosLab.length);
    expect(VISIBLE_SCENARIOS.length).toBeLessThan(SCENARIOS.length);
  });

  it('README.md', () => {
    contiene('README.md', `${archivosDeTest.length} archivos unitarios + ${specsE2e.length} specs / ${testsE2e} tests E2E`);
    contiene('README.md', `${archivosDeTest.length} test files unitarios + ${specsE2e.length} specs / ${testsE2e} tests E2E`);
    contiene('README.md', `(${builtin.length} archivos)`);
    contiene('README.md', `(${tools.length} archivos / ${comandosTools} comandos)`);
    contiene('README.md', `${hooks.length} hooks (use*)`);
    contiene('README.md', `${ACADEMY_PATHS.length} paths / ${lecciones} lecciones`);
    contiene('README.md', `Remotion (${composiciones} composiciones)`);
  });

  it('AGENTS.md', () => {
    contiene('AGENTS.md', `across ${archivosDeTest.length} files, plus ${specsE2e.length} Playwright E2E specs / ${testsE2e} tests in \`e2e/\``);
    contiene('AGENTS.md', `${VISIBLE_SCENARIOS.length} visible labs`);
    contiene('AGENTS.md', `${ACADEMY_PATHS.length} paths / ${lecciones} lessons`);
    contiene('AGENTS.md', `${SCENARIOS.length} labs (${rangoLabs}`);
    contiene('AGENTS.md', `${builtin.length} system commands`);
    contiene('AGENTS.md', `${comandosTools} comandos en ${tools.length} archivos`);
    contiene('AGENTS.md', `${composiciones} compositions registradas en Root.tsx`);
  });

  it('CLAUDE.md', () => {
    contiene('CLAUDE.md', `${VISIBLE_SCENARIOS.length} progressive labs in the grid + ${ocultos} by direct URL`);
    contiene('CLAUDE.md', `${ACADEMY_PATHS.length} paths / ${lecciones} lessons`);
    contiene('CLAUDE.md', `${composiciones} registradas en Root.tsx`);
    contiene('CLAUDE.md', `${builtin.length} comandos:`);
    contiene('CLAUDE.md', `${comandosTools} comandos en ${tools.length} archivos`);
    contiene('CLAUDE.md', `${SCENARIOS.length} lab definitions`);
    contiene('CLAUDE.md', `${hooks.length} hooks (use*)`);
  });
});
