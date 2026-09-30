// ── store/__tests__/layering.test.ts ───────────────────────────────
// ARQUITECTURA COMO TEST (P1 3.3). Las capas del proyecto son una regla, no
// una sugerencia: si el store vuelve a importar los labs, el síntoma es
// "un test del slice carga 30 archivos y 13 labs"; si utils vuelve a
// depender de un framework, aparece un ciclo en el bundle.
//
// El test recorre el grafo de imports relativo a partir de un archivo y
// falla si alcanza una capa prohibida. Allowlist explícita = deuda
// consciente, con el motivo escrito al lado.

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const IMPORT_RE = /(?:from|import)\s*\(?\s*'([^']+)'/g;

function resolveSpec(fromFile: string, spec: string): string | null {
  if (!spec.startsWith('.')) return null; // paquete externo
  const base = resolve(dirname(fromFile), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && candidate.endsWith('.ts')) return candidate;
  }
  return null;
}

/** Grafo transitivo de imports relativos desde los archivos dados. */
function reachableFrom(entries: string[]): Map<string, Set<string>> {
  const edges = new Map<string, Set<string>>();
  const queue = [...entries];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    const deps = new Set<string>();
    for (const match of source.matchAll(IMPORT_RE)) {
      const target = resolveSpec(file, match[1]);
      if (target) {
        deps.add(target);
        queue.push(target);
      }
    }
    edges.set(file, deps);
  }
  return edges;
}

const rel = (file: string): string => file.replace(`${ROOT}/`, '');

/** Aristas (archivo → dependencia) que cruzan a una capa prohibida. */
function violations(entries: string[], forbidden: RegExp): string[] {
  const edges = reachableFrom(entries);
  const out: string[] = [];
  for (const [file, deps] of edges) {
    if (forbidden.test(rel(file))) continue; // el infractor no se juzga a sí mismo
    for (const dep of deps) {
      if (forbidden.test(rel(dep))) out.push(`${rel(file)} → ${rel(dep)}`);
    }
  }
  return out.sort();
}

const tsFilesIn = (dir: string): string[] =>
  readdirSync(dir)
    .filter((f: string) => f.endsWith('.ts'))
    .map((f: string) => join(dir, f));

/** Todos los .ts de un árbol de directorios (para el test de frameworks). */
function tsFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsFilesUnder(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const storeFiles = [
  ...tsFilesIn(join(SRC, 'store')),
  ...tsFilesIn(join(SRC, 'store', 'slices')),
];

describe('capas — el store no depende de los labs', () => {
  it('ningún archivo del store alcanza la capa de datos de laboratorios', () => {
    // Antes: scenarioSlice importaba SCENARIOS desde laboratorios/laboratorios
    // y arrastraba 13 módulos de lab + templates + attackers a cada test.
    // Hoy resuelve contra el registro (hoja sin datos) — ver
    // laboratorios/registry.ts.
    const bad = violations(storeFiles, /^src\/laboratorios\/(?!registry\.ts$|emptyScenario\.ts$)/);
    expect(bad).toEqual([]);
  });

  it('el store solo habla con la capa de labs por el registro y la factory vacía', () => {
    const edges = reachableFrom(storeFiles);
    const labDeps = new Set<string>();
    for (const deps of edges.values()) {
      for (const dep of deps) {
        if (rel(dep).startsWith('src/laboratorios/')) labDeps.add(rel(dep));
      }
    }
    expect([...labDeps].sort()).toEqual([
      'src/laboratorios/emptyScenario.ts',
      'src/laboratorios/registry.ts',
    ]);
  });
});

describe('capas — el store no depende de los comandos', () => {
  it('store/** no alcanza src/commands/**', () => {
    // Un store que importa comandos es un store que sabe ejecutar cosas: el
    // efecto va al revés (commands → store).
    expect(violations(storeFiles, /^src\/commands\//)).toEqual([]);
  });
});

describe('capas — el store y los frameworks', () => {
  // Estas dos aristas SÍ quedan, a propósito y con motivo:
  //  - scenarioSlice → resetManagers: entrar a un lab tiene que resetear los
  //    managers globales (shells/red/procesos/paquetes/cron/mounts). Se
  //    intentó un puerto de efectos (registerScenarioEffect) y se revirtió:
  //    sin el import, la garantía "entrar a un lab cierra las sesiones
  //    abiertas" se pierde en silencio y lo detectan los tests de contrato.
  //  - scenarioStore → shellManager: resetWorkspace (salir del lab) tiene que
  //    soltar las sesiones de shell.
  // La alternativa honesta es mover el estado de los managers a una capa que
  // el store ya posea; es un refactor grande, no un cambio de import.
  it('las únicas dependencias store→frameworks son las dos justificadas', () => {
    const bad = violations(storeFiles, /^src\/frameworks\//);
    expect(bad).toEqual([
      'src/store/scenarioStore.ts → src/frameworks/shells/ShellManager.ts',
      'src/store/slices/scenarioSlice.ts → src/frameworks/resetManagers.ts',
    ]);
  });
});

describe('capas — frameworks no dependen de commands', () => {
  // Quedan DOS aristas, y son a propósito: el `dir`/`type` de una sesión
  // meterpreter imprime EXACTAMENTE lo que imprime cmd.exe sobre el mismo FS
  // virtual, porque llama al comando. Reutilizarlo es el comportamiento
  // buscado (si `dir` cambia de formato, cambia en los dos lados), no una
  // comodidad. Lo que falta es bajar el formateo de `dir` a una capa común
  // (`frameworks/fs/` o `utils/`), que es el pendiente de 3.3.
  it('las únicas dependencias frameworks→commands son dir/type del meterpreter', () => {
    const offenders = tsFilesUnder(join(SRC, 'frameworks'))
      .flatMap(file => [...(reachableFrom([file]).get(file) ?? [])]
        .filter(dep => rel(dep).startsWith('src/commands/')))
      .map(rel);
    expect([...new Set(offenders)].sort()).toEqual([
      'src/commands/windows/fs.ts',
    ]);
  });
});

describe('capas — utils no depende de frameworks', () => {
  it('utils/** no alcanza src/frameworks/**', () => {
    // Ya no: MsfModule (usado por autocomplete.ts) pasó a types/msf.ts.
    expect(violations(tsFilesIn(join(SRC, 'utils')), /^src\/frameworks\//)).toEqual([]);
  });

  it('utils/autocomplete no arrastra el barrel de comandos (solo la hoja names.ts)', () => {
    const edges = reachableFrom([join(SRC, 'utils', 'autocomplete.ts')]);
    const cmdDeps = [...edges.values()].flatMap(d => [...d]).filter(d => rel(d).startsWith('src/commands/'));
    // `commands/names.ts` es una hoja (sin imports) que existe justamente para
    // esto: la lista de comandos no puede venir del barrel.
    expect([...new Set(cmdDeps.map(rel))]).toEqual(['src/commands/names.ts']);
  });
});
