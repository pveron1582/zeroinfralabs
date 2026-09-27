// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_sed } from '../sed';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/f.txt', content: 'foo one\nfoo two\nbar three\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/root', ...extra }) as any;

describe('cmd_sed', () => {
  it('debe sustituir global con s///g', () => {
    const result = cmd_sed.execute(['s/foo/BAZ/g', 'f.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('BAZ one\nBAZ two\nbar three');
  });

  it('debe sustituir solo primera sin g', () => {
    const result = cmd_sed.execute(['s/o/0/', 'f.txt'], ctx(mk()));
    expect(result.output.split('\n')[0]).toBe('f0o one');
  });

  it('debe soportar & y grupos', () => {
    const m = mk();
    let result = cmd_sed.execute(['s/foo/[&]/'], ctx(m, { pipedInput: 'foo' }));
    expect(result.output).toBe('[foo]');
    result = cmd_sed.execute(['s/(fo+)(.*)/\\2\\1/'], ctx(m, { pipedInput: 'fooXYZ' }));
    expect(result.output).toBe('XYZfoo');
  });

  it('debe borrar por dirección', () => {
    const m = mk();
    expect(cmd_sed.execute(['2d', 'f.txt'], ctx(m)).output).toBe('foo one\nbar three');
    expect(cmd_sed.execute(['1,2d', 'f.txt'], ctx(m)).output).toBe('bar three');
    expect(cmd_sed.execute(['/bar/d', 'f.txt'], ctx(m)).output).toBe('foo one\nfoo two');
  });

  it('debe imprimir solo con -n y p', () => {
    const result = cmd_sed.execute(['-n', '2p', 'f.txt'], ctx(mk()));
    expect(result.output).toBe('foo two');
  });

  it('debe salir con q', () => {
    const result = cmd_sed.execute(['2q', 'f.txt'], ctx(mk()));
    expect(result.output).toBe('foo one\nfoo two');
  });

  it('debe fallar con script inválido y archivo inexistente', () => {
    const m = mk();
    expect(cmd_sed.execute(['s/foo/'], ctx(m)).isError).toBe(true);
    expect(cmd_sed.execute(['s/a/b/', '/nope'], ctx(m)).isError).toBe(true);
    expect(cmd_sed.execute(['z'], ctx(m)).isError).toBe(true);
  });
});
