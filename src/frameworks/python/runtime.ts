// ── frameworks/python/runtime.ts ────────────────────────────────────
// API pública del mini-intérprete: runPython(source, opts) → resultado
// con salida, traceback (si hubo error), petición de input (si el
// script quedó esperando entrada) y conexiones registradas.

import type { Stmt, Expr } from './ast';
import { tokenize } from './lexer';
import { StatementParser } from './parser';
import { PyError, PyInputRequest, isPyError } from './errors';
import { makeGlobalEnv } from './builtins';
import { execBlock, callPythonFunction } from './interpreter';
import type { RunCtx, PyRunOptions, ConnectAttempt } from './context';

export interface PythonRunResult {
  output: string;
  error?: string;
  needsInput?: { prompt: string };
  connections: ConnectAttempt[];
}

export function runPython(source: string, opts: PyRunOptions): PythonRunResult {
  const state = {
    out: '',
    connections: [] as ConnectAttempt[],
    steps: 0,
    callDepth: 0,
    inputQueue: buildInputQueue(opts),
  };

  const ctx: RunCtx = {
    opts,
    state,
    globals: null as never,
    callFunction: (fn, args, line) => callPythonFunction(fn, args, line, ctx),
  };
  ctx.globals = makeGlobalEnv(ctx);

  try {
    const program = parse(source);
    const env = ctx.globals;
    execBlock(program, env, ctx);
    return { output: stripTrailingNewline(state.out), connections: state.connections };
  } catch (e) {
    if (e instanceof PyInputRequest) {
      return {
        output: stripTrailingNewline(state.out),
        needsInput: { prompt: e.prompt },
        connections: state.connections,
      };
    }
    if (isPyError(e)) {
      return {
        output: stripTrailingNewline(state.out),
        error: formatTraceback(e, opts.sourceName),
        connections: state.connections,
      };
    }
    // Red de seguridad (P0.2): NUNCA dejar que un error de JS escape.
    // Antes `throw e` llegaba al comando python3 sin try/catch y el
    // ChunkErrorBoundary (que envuelve toda la app) la reemplazaba por
    // "No se pudo cargar la página". Cualquier RangeError/OOM/TypeError
    // propio del intérprete se reporta como traceback de Python.
    return {
      output: stripTrailingNewline(state.out),
      error: [
        'Traceback (most recent call last):',
        `  File "${opts.sourceName}", in <module>`,
        `RuntimeError: ${describeJsError(e)}`,
      ].join('\n'),
      connections: state.connections,
    };
  }
}

/** Traduce un error de JS del intérprete a algo legible para el alumno. */
function describeJsError(e: unknown): string {
  if (e instanceof RangeError) {
    if (/call stack/i.test(e.message)) {
      return 'profundidad de recursión excedida (límite del simulador)';
    }
    return 'memoria agotada: la operación pidió demasiado (límite del simulador)';
  }
  if (e instanceof TypeError) return `error interno del intérprete: ${e.message}`;
  if (e instanceof Error) return e.message;
  return String(e);
}

// stdout real no termina en '\n' si la última línea no la tenía.
function stripTrailingNewline(s: string): string {
  return s.endsWith('\n') ? s.slice(0, -1) : s;
}

function parse(source: string): Stmt[] {
  const tokens = tokenize(source);
  return new StatementParser(tokens).parseProgram();
}

// Export para parsear expresiones sueltas desde fuera (no usado hoy,
// útil para el REPL futuro).
export const parseExpr = (src: string, _line: number): Expr => {
  const tokens = tokenize(src);
  return new StatementParser(tokens).parseExpression();
};

function buildInputQueue(opts: PyRunOptions): Array<{ value: string; echo: boolean }> {
  const queue = opts.inputs.map(v => ({ value: v, echo: true }));
  if (opts.pipedInput !== undefined) {
    const lines = opts.pipedInput.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    queue.push(...lines.map(l => ({ value: l, echo: false })));
  }
  return queue;
}

export function formatTraceback(e: PyError, sourceName: string): string {
  const linePart = e.line !== undefined ? `, line ${e.line}` : '';
  return [
    'Traceback (most recent call last):',
    `  File "${sourceName}"${linePart}, in <module>`,
    `${e.pyClass}: ${e.message}`,
  ].join('\n');
}
