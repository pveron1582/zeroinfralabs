// ── commands/__tests__/files-changed-contract.test.ts ──────────────
// P1 3.7.6 — convención `filesChanged` = SNAPSHOT COMPLETO del árbol
// (ver `src/utils/filesChanged.ts`). El store REEMPLAZA `machine.files` con
// lo que llega acá, así que un snapshot mal formado corrompe el FS simulado.
// Tres incumplimientos reales, todos corregidos el 2026-10-01:
//
//   - wget devolvía un DELTA (sólo el archivo descargado): 6 archivos → 1
//     tras `wget http://10.10.10.11/`. Data loss en un lab completo.
//   - runPipeline concatenaba los snapshots de los segmentos: 6 paths
//     únicos se aplicaban como 11 entradas (`echo hola > a | tee b`).
//   - la redirección pisaba el `filesChanged` del comando: `crontab -e > f`
//     perdía los archivos que crontab sólo declaraba (no muta in-place).
//
// Las reglas estáticas de acá (barrido sobre src/commands + src/utils):
//
//  1. Quien muta `.files = ...` declara `filesChanged`. Si no, el store
//     nunca se entera y la UI queda congelada con el árbol viejo.
//  2. Quien declara `filesChanged` referencia `machine.files` en el cuerpo:
//     es la prueba estática de que manda el árbol completo y no una lista
//     de cambios (un delta no menciona el árbol del que sale).
//
// Esa regla 2 sólo atrapa deltas armados en archivos que jamás nombran el
// árbol — así cayó wget. Para el resto está el barrido de comportamiento de
// `files-changed-behavior.test.ts`.
//
// Nota regla 1: `scp.ts:108` escribe el FS de la máquina REMOTA
// (`target.files`). El contrato sólo tiene un `filesChanged` y éste
// pertenece a `ctx.machine`, así que esa escritura no es notificable; se
// pinta igual porque `target` es el mismo objeto del store y cualquier
// re-render posterior la refleja.
//
// Allowlist con el motivo, como en layering.test.ts / a11y-contract.test.ts.

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsFiles(full));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) out.push(full);
  }
  return out;
}

// Commands + utils: de ahí salen todas las escrituras de árbol (los
// laboratorios y frameworks no devuelven CommandResponse).
const files = [...tsFiles(join(SRC, 'commands')), ...tsFiles(join(SRC, 'utils'))];
const rel = (f: string) => f.replace(`${process.cwd()}/`, '');
const source = (f: string) => readFileSync(f, 'utf8');

// Regla 1: mutación `.files = ...` sin declarar filesChanged.
const MUTA_SIN_DECLARAR: Record<string, string> = {
  'src/commands/builtin/ls.ts': 'inicialización perezosa (si machine.files no existe, []) — no cambia el árbol',
};

// Regla 2: declara filesChanged sin tocar machine.files en el cuerpo.
const DECLARA_SIN_ARBOL: Record<string, string> = {
  'src/commands/builtin/sleep.ts': 'reenvía tal cual la respuesta de runCron (ya cumplió su contrato)',
};

const esMuta = (f: string) => /\w+\.files\s*=(?!=)/.test(source(f));
const esDeclarante = (f: string) =>
  source(f).includes('filesChanged') && !/machine\.files/.test(source(f));

describe('Contrato filesChanged: reglas estáticas', () => {
  it('todo archivo que muta .files declara filesChanged', () => {
    const violaciones = files
      .filter(esMuta)
      .filter(f => !source(f).includes('filesChanged'))
      .filter(f => !(rel(f) in MUTA_SIN_DECLARAR));
    expect(violaciones.map(rel)).toEqual([]);
  });

  it('la allowlist de la regla 1 sigue vigente (sin muertos)', () => {
    const usadas = Object.keys(MUTA_SIN_DECLARAR).filter(
      p => files.some(f => rel(f) === p && esMuta(f))
    );
    expect(Object.keys(MUTA_SIN_DECLARAR).sort()).toEqual(usadas.sort());
  });

  it('todo archivo que declara filesChanged referencia machine.files (snapshot, no delta)', () => {
    const violaciones = files.filter(esDeclarante).filter(f => !(rel(f) in DECLARA_SIN_ARBOL));
    expect(violaciones.map(rel)).toEqual([]);
  });

  it('la allowlist de la regla 2 sigue vigente (sin muertos)', () => {
    // Condición completa: el archivo tiene que seguir necesitando la
    // excepción (declara y NO menciona el árbol), no sólo seguir declarando.
    const usadas = Object.keys(DECLARA_SIN_ARBOL).filter(
      p => files.some(f => rel(f) === p && esDeclarante(f))
    );
    expect(Object.keys(DECLARA_SIN_ARBOL).sort()).toEqual(usadas.sort());
  });

  it('hay material suficiente: commands + utils se escanean de verdad', () => {
    // Scanner roto = todo verde en vacío. Al menos 40 archivos y ~30 con
    // filesChanged, como en el barrido del que salieron los tres bugs.
    expect(files.length).toBeGreaterThan(40);
    expect(files.filter(f => source(f).includes('filesChanged')).length).toBeGreaterThan(25);
  });
});
