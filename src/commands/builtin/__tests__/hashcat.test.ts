// ── commands/builtin/__tests__/hashcat.test.ts ───────────────────
import { describe, it, expect } from 'vitest';
import { cmd_hashcat } from '../hashcat';

describe('cmd_hashcat', () => {
  it('debe mostrar uso si no hay argumentos', () => {
    const result = cmd_hashcat.execute([]);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Uso: hashcat');
  });

  it('debe mostrar uso si falta -m', () => {
    const result = cmd_hashcat.execute(['hash.txt', 'rockyou.txt']);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Uso: hashcat');
  });

  it('debe mostrar error si modo es inválido', () => {
    const result = cmd_hashcat.execute(['-m', 'abc', 'hash.txt', 'rockyou.txt']);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('modo inválido');
  });

  it('debe mostrar error si falta hash file', () => {
    const result = cmd_hashcat.execute(['-m', '0']);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Uso: hashcat');
  });

  it('debe mostrar error si wordlist no es rockyou', () => {
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', 'passwords.txt']);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('rockyou.txt');
  });

  it('debe crackear hash con wordlist rockyou', () => {
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', 'rockyou.txt']);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('hashcat');
    expect(result.output).toContain('Cracked');
    expect(result.output).toContain('hello');
    expect(result.output).toContain('simulador educativo');
  });

  it('debe mostrar dispositivos GPU simulados', () => {
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', 'rockyou.txt']);
    expect(result.output).toContain('Intel Core i7');
    expect(result.output).toContain('NVIDIA RTX 3080');
  });

  it('debe mostrar hash MD5 ficticio', () => {
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', 'rockyou.txt']);
    expect(result.output).toContain('5d41402abc4b2a76b9719d911017c592');
  });
});