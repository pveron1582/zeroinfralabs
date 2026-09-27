// ── commands/builtin/__tests__/hashcat.test.ts ───────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_hashcat } from '../hashcat';
import type { Machine } from '../../../types';

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

  // ── Potfile real (P1 realismo) ──
  const createUserMachine = (files: Machine['files'] = []): Machine => ({
    id: 'kali-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '', os: 'Kali', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/hash.txt', content: '5d41402abc4b2a76b9719d911017c592\n', type: 'file', owner: 'user', group: 'user', mode: 0o644 },
      ...files,
    ],
  } as unknown as Machine);

  const userCtx = (m: Machine) =>
    ({ machine: m, allMachines: [m], currentDir: '/home/user' }) as any;

  it('debe persistir el crack en el potfile', () => {
    const m = createUserMachine();
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', 'rockyou.txt'], userCtx(m));
    expect(result.isError).toBeUndefined();
    const changed = 'filesChanged' in result ? result.filesChanged : undefined;
    expect(changed).toBeDefined();
    const pot = changed!.find(f => f.path === '/home/user/.hashcat/hashcat.potfile');
    expect(pot).toBeDefined();
    expect(pot!.content).toContain('5d41402abc4b2a76b9719d911017c592:hello');
  });

  it('debe mostrar cracks previos con --show', () => {
    const m = createUserMachine([
      { path: '/home/user/.hashcat/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/.hashcat/hashcat.potfile', content: '5d41402abc4b2a76b9719d911017c592:hello\n', type: 'file', owner: 'user', group: 'user', mode: 0o644 },
    ]);
    const result = cmd_hashcat.execute(['--show'], userCtx(m));
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('5d41402abc4b2a76b9719d911017c592:hello');
  });

  it('debe filtrar --show por hashfile', () => {
    const m = createUserMachine([
      { path: '/home/user/.hashcat/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      {
        path: '/home/user/.hashcat/hashcat.potfile',
        content: '5d41402abc4b2a76b9719d911017c592:hello\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:other\n',
        type: 'file', owner: 'user', group: 'user', mode: 0o644,
      },
    ]);
    const result = cmd_hashcat.execute(['-m', '0', 'hash.txt', '--show'], userCtx(m));
    expect(result.output).toContain('5d41402abc4b2a76b9719d911017c592:hello');
    expect(result.output).not.toContain('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:other');
  });

  it('debe avisar si el potfile está vacío con --show', () => {
    const m = createUserMachine();
    const result = cmd_hashcat.execute(['--show'], userCtx(m));
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('No hay hashes crackeados');
  });
});