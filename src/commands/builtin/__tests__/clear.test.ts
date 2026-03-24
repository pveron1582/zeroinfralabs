// ── commands/builtin/__tests__/clear.test.ts ──────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_clear } from '../clear';

describe('cmd_clear', () => {
  it('debe retornar CLEAR_TERMINAL al ejecutar', () => {
    const result = cmd_clear.execute();
    expect(result.output).toBe('CLEAR_TERMINAL');
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