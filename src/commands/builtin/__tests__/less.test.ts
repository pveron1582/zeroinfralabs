// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_less, cmd_more } from '../less';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/notes.txt', content: 'line1\nline2\nline3\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/secret.txt', content: 'x', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/root', ...extra }) as any;

describe('cmd_less / cmd_more', () => {
  it('debe volcar el archivo', () => {
    const result = cmd_less.execute(['notes.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('line1\nline2\nline3');
  });

  it('more debe volcar igual', () => {
    const result = cmd_more.execute(['notes.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('line2');
  });

  it('debe numerar con -N', () => {
    const result = cmd_less.execute(['-N', 'notes.txt'], ctx(mk()));
    expect(result.output).toContain('     1\tline1');
    expect(result.output).toContain('     3\tline3');
  });

  it('debe leer de pipe sin archivo', () => {
    const result = cmd_less.execute([], ctx(mk(), { pipedInput: 'a\nb' }));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('a\nb');
  });

  it('debe fallar sin archivo ni pipe', () => {
    const result = cmd_less.execute([], ctx(mk()));
    expect(result.isError).toBe(true);
  });

  it('debe fallar si no existe', () => {
    const result = cmd_more.execute(['/nope'], ctx(mk()));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });
});
