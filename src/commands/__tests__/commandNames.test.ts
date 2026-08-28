// ── commands/__tests__/commandNames.test.ts ───────────────────────
// Garantiza que la lista estática COMMAND_NAMES (names.ts, liviana,
// usada por autocomplete sin arrastrar el barrel) no diverja del
// registro real de comandos (fuente de verdad).

import { describe, it, expect } from 'vitest';
import { COMMAND_NAMES } from '../names';
import { AVAILABLE_COMMAND_NAMES } from '../index';

describe('COMMAND_NAMES (names.ts)', () => {
  it('debe coincidir exactamente con el registro real de comandos', () => {
    expect([...COMMAND_NAMES].sort()).toEqual([...AVAILABLE_COMMAND_NAMES].sort());
  });

  it('debe estar ordenado alfabéticamente', () => {
    const sorted = [...COMMAND_NAMES].sort();
    expect(COMMAND_NAMES).toEqual(sorted);
  });

  it('debe incluir msfconsole y herramientas clave', () => {
    expect(COMMAND_NAMES).toContain('msfconsole');
    expect(COMMAND_NAMES).toContain('nmap');
    expect(COMMAND_NAMES).toContain('ssh');
    expect(COMMAND_NAMES).toContain('hydra');
  });
});
