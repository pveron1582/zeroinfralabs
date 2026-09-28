// ── commands/builtin/__tests__/clear.test.ts ──────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_clear } from '../clear';

describe('cmd_clear', () => {
  it('debe retornar CLEAR_TERMINAL al ejecutar', () => {
    const result = cmd_clear.execute();
    // P0.4: la señal va en metadata, no en el texto de la salida.
    expect(result.output).toBe('');
    expect(result.clearScreen).toBe(true);
  });

  it('debe retornar un objeto CommandResponse válido', () => {
    const result = cmd_clear.execute();
    expect(result).toHaveProperty('output');
    expect(typeof result.output).toBe('string');
  });

  it('no debe tener propiedad isError', () => {
    const result = cmd_clear.execute();
    expect(result.isError).toBeUndefined();
  });
});