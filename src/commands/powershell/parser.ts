// ── commands/powershell/parser.ts ─────────────────────────────────
// Parser de líneas PowerShell (PLAN_WINDOWS W2). Forma soportada:
//   Verb-Noun [-Param value] [-Param:value] [-Flag] [posicionales]
// Pipes (|) se resuelven en session.ts con splitTopLevel (existente).
// Límites v1 (documentados): sin $variables, sin objetos complejos,
// sin scripts .ps1 — la semántica es "parsear → ejecutar cmdlet".

import { splitArgs } from '../../utils/shellParse';

export interface PsInvocation {
  /** Nombre resuelto del cmdlet (alias ya mapeado). */
  name: string;
  /** Token original (antes de resolver alias) — para errores. */
  rawName: string;
  positionals: string[];
  /** -Param value / -Param:value → string; -Flag (sin valor) → true. */
  params: Record<string, string | boolean>;
}

const PARAM_RE = /^-{1,2}([A-Za-z][A-Za-z0-9]*)(?::(.*)|$)/;

/**
 * Parsea una línea (ya sin pipes) en invocaciones de cmdlet.
 * Devuelve null si la línea está vacía.
 */
export function parsePsLine(line: string): PsInvocation | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const tokens = splitArgs(trimmed);
  if (tokens.length === 0) return null;

  const rawName = tokens[0];
  const inv: PsInvocation = {
    name: rawName,
    rawName,
    positionals: [],
    params: {},
  };

  let i = 1;
  while (i < tokens.length) {
    const tok = tokens[i];
    const m = PARAM_RE.exec(tok);
    if (m) {
      const key = m[1];
      // -Param:value (el : quedó en el token)
      if (m[2] !== undefined) {
        inv.params[key] = m[2];
        i++;
        continue;
      }
      // -Param value (siguiente token si no empieza con -)
      const next = tokens[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        inv.params[key] = next;
        i += 2;
      } else {
        // Switch booleano: -Recurse
        inv.params[key] = true;
        i++;
      }
      continue;
    }
    inv.positionals.push(tok);
    i++;
  }

  return inv;
}

/** Case-insensitive lookup de un parámetro. */
export function getParam<T extends string | boolean = string | boolean>(
  inv: PsInvocation,
  ...names: string[]
): T | undefined {
  for (const name of names) {
    for (const [k, v] of Object.entries(inv.params)) {
      if (k.toLowerCase() === name.toLowerCase()) return v as T;
    }
  }
  return undefined;
}

/** Primer valor posicional o el de un parámetro (Path/P/file son los comunes). */
export function pathArg(inv: PsInvocation): string | undefined {
  const p = getParam<string>(inv, 'Path', 'P', 'File', 'LiteralPath');
  if (typeof p === 'string') return p;
  return inv.positionals[0];
}
