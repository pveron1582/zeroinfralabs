// ── commands/builtin/__tests__/help.test.ts ─────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_help } from '../help';

describe('cmd_help', () => {
  it('debe retornar lista de comandos disponibles', () => {
    const result = cmd_help.execute([], {} as any);

    expect(result.output).toContain('help');
    expect(result.output).toContain('clear');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('hydra');
    expect(result.output).toContain('msfconsole');
    expect(result.isError).toBeUndefined();
  });

  it('debe incluir descripción de cada comando', () => {
    const result = cmd_help.execute([], {} as any);

    expect(result.output).toContain('Mostrar esta ayuda');
    expect(result.output).toContain('Limpiar la terminal');
    expect(result.output).toContain('Escanear puertos');
  });
});
