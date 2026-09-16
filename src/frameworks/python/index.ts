// ── frameworks/python/index.ts ──────────────────────────────────────
// Barrel del mini-intérprete de Python (subconjunto usado por la
// Academy: variables, tipos, condiciones, bucles, funciones, imports,
// try/except, socket, sys, time, open). Consumido por el comando
// python3 (src/commands/builtin/python3.ts).

export { runPython, formatTraceback } from './runtime';
export type { PythonRunResult } from './runtime';
export type { PyRunOptions, ConnectResult, ConnectAttempt } from './context';
export { PyError, PyInputRequest } from './errors';
