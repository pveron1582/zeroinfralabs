// ── frameworks/python/errors.ts ─────────────────────────────────────
// Errores y señales de control del mini-intérprete.
// PyError representa una excepción Python (con clase y línea) y es lo
// único que propaga el evaluador; las señales (break/continue/return/
// input) implementan el control de flujo sin excepciones semánticas.

export class PyError extends Error {
  constructor(
    public readonly pyClass: string,
    message: string,
    public readonly line?: number,
  ) {
    super(message);
    this.name = pyClass;
  }
}

// Señal de control de flujo (no son errores de usuario).
export class PySignal {
  constructor(public readonly kind: 'break' | 'continue' | 'return', public readonly value?: unknown) {}
}

// input() sin datos disponibles: el runtime lo atrapa y el comando pide
// la entrada al usuario (ver hooks/usePendingPythonInput).
export class PyInputRequest {
  constructor(public readonly prompt: string) {}
}

export const isPyError = (e: unknown): e is PyError => e instanceof PyError;

export const syntaxError = (msg: string, line?: number): PyError =>
  new PyError('SyntaxError', msg, line);

export const nameError = (name: string, line?: number): PyError =>
  new PyError('NameError', `name '${name}' is not defined`, line);

export const typeError = (msg: string, line?: number): PyError =>
  new PyError('TypeError', msg, line);

export const valueError = (msg: string, line?: number): PyError =>
  new PyError('ValueError', msg, line);
