// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_tee } from '../tee';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o777 },
    { path: '/tmp/existing.txt', content: 'old\n', type: 'text', owner: 'root', group: 'root', mode: 0o777 },
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/tmp', ...extra }) as any;

describe('cmd_tee', () => {
  it('debe escribir y mostrar en stdout', () => {
    const m = mk();
    const result = cmd_tee.execute(['out.txt'], ctx(m, { pipedInput: 'hello' }));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('hello');
    expect(m.files.find(f => f.path === '/tmp/out.txt')?.content).toBe('hello\n');
  });

  it('debe agregar con -a', () => {
    const m = mk();
    cmd_tee.execute(['-a', 'existing.txt'], ctx(m, { pipedInput: 'new' }));
    expect(m.files.find(f => f.path === '/tmp/existing.txt')?.content).toBe('old\nnew\n');
  });

  it('debe escribir a varios archivos', () => {
    const m = mk();
    const result = cmd_tee.execute(['a.txt', 'b.txt'], ctx(m, { pipedInput: 'x' }));
    expect(result.isError).toBeFalsy();
    expect(m.files.find(f => f.path === '/tmp/a.txt')?.content).toBe('x\n');
    expect(m.files.find(f => f.path === '/tmp/b.txt')?.content).toBe('x\n');
  });

  it('debe fallar con permiso denegado sin romper stdout', () => {
    const m = mk();
    // sin ser root no puede crear en /root (0700 root)
    const result = cmd_tee.execute(['/root/x.txt'], ctx(m, { pipedInput: 'hi' }));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('hi');
    expect(result.output).toContain('Permission denied');
  });
});
