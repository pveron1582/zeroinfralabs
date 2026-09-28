// ── frameworks/python/context.ts ────────────────────────────────────
// Contexto de ejecución compartido entre el runtime, el evaluador y
// los builtins. El comando python3 construye PyRunOptions con callbacks
// que puentean contra el simulador (filesystem virtual, red real del
// lab) — el intérprete nunca importa código del proyecto.

import type { Env } from './env';
import type { PyFunction, PyValue } from './values';

export interface ConnectResult {
  ok: boolean;
  errno?: number;
  banner?: string;
  service?: string;
  version?: string;
}

export interface ConnectAttempt {
  host: string;
  port: number;
  ok: boolean;
  service?: string;
  version?: string;
}

export interface PyRunOptions {
  argv: string[];
  // Respuestas ya tipeadas por el usuario a input() anteriores (flujo
  // interactivo del terminal: el script se re-ejecuta desde el inicio
  // con la cola acumulada).
  inputs: string[];
  pipedInput?: string;
  sourceName: string;
  readFile?: (path: string) => string | null;
  connect?: (host: string, port: number) => ConnectResult;
  maxSteps?: number;
}

export interface RunState {
  // Buffer de stdout continuo: print agrega '\n', input agrega el prompt
  // sin salto (como stdout real de CPython).
  out: string;
  connections: ConnectAttempt[];
  steps: number;
  /** Calls anidadas en curso: guard de recursión (MAX_CALL_DEPTH). */
  callDepth: number;
  inputQueue: Array<{ value: string; echo: boolean }>;
}

export interface RunCtx {
  opts: PyRunOptions;
  state: RunState;
  callFunction: (fn: PyFunction, args: PyValue[], line: number) => PyValue;
  globals: Env;
}

export const DEFAULT_MAX_STEPS = 200_000;
export const MAX_ITER = 100_000;

/**
 * Topes de memoria del intérprete. El intérprete corre en el navegador del
 * alumno: sin estos topes, una línea como `"A" * 1_000_000_000` lanzaba
 * `RangeError: Invalid string length` (o reservaba cientos de MB), el error
 * escapaba del runtime y el `ChunkErrorBoundary` reemplazaba TODA la app por
 * "No se pudo cargar la página" — el alumno perdía la sesión del lab.
 * P0.2 de docs/mejoras_bunny.md.
 */
export const MAX_STRING_LEN = 1_000_000;
export const MAX_ITEMS = 100_000;

/** Profundidad de llamadas anidadas (evita el stack overflow de JS). */
export const MAX_CALL_DEPTH = 100;
