// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_diff } from '../diff';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/a.txt', content: 'one\ntwo\nthree\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/b.txt', content: 'one\nTWO\nthree\nfour\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/root' }) as any;

describe('cmd_diff', () => {
  it('debe salir vacío si son iguales', () => {
    const result = cmd_diff.execute(['a.txt', 'a.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('');
  });

  it('debe mostrar formato normal con c/a/d', () => {
    const result = cmd_diff.execute(['a.txt', 'b.txt'], ctx(mk()));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('2c2');
    expect(result.output).toContain('< two');
    expect(result.output).toContain('---');
    expect(result.output).toContain('> TWO');
    expect(result.output).toContain('3a4');
    expect(result.output).toContain('> four');
  });

  it('debe mostrar unificado con -u', () => {
    const result = cmd_diff.execute(['-u', 'a.txt', 'b.txt'], ctx(mk()));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('--- a.txt');
    expect(result.output).toContain('+++ b.txt');
    expect(result.output).toContain('@@');
    expect(result.output).toContain('-two');
    expect(result.output).toContain('+TWO');
    expect(result.output).toContain('+four');
  });

  it('debe ser breve con -q', () => {
    const result = cmd_diff.execute(['-q', 'a.txt', 'b.txt'], ctx(mk()));
    expect(result.output).toContain('differ');
  });

  it('debe fallar si falta archivo', () => {
    const m = mk();
    expect(cmd_diff.execute(['a.txt'], ctx(m)).isError).toBe(true);
    expect(cmd_diff.execute(['a.txt', '/nope'], ctx(m)).isError).toBe(true);
  });
});
