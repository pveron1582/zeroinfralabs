// @vitest-environment node  (lógica pura, sin DOM)
import { describe, it, expect } from 'vitest';
import { cmd_vi, cmd_vim } from '../vi';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  su_user: 'root',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/notes.txt', content: 'hola\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/root' }) as any;

describe('cmd_vi / cmd_vim', () => {
  it('debe abrir el editor con contenido existente', () => {
    const r = cmd_vim.execute(['notes.txt'], ctx(mk()));
    expect(r.isError).toBeFalsy();
    const nf = 'nanoFile' in r ? r.nanoFile : undefined;
    expect(nf).toBeDefined();
    expect(nf?.content).toContain('hola');
  });

  it('vi y vim comparten comportamiento', () => {
    const a = cmd_vi.execute(['notes.txt'], ctx(mk()));
    const b = cmd_vim.execute(['notes.txt'], ctx(mk()));
    expect(a.nanoFile?.content).toBe(b.nanoFile?.content);
  });

  it('debe fallar si el padre no existe', () => {
    const r = cmd_vim.execute(['/nope/x.txt'], ctx(mk()));
    expect(r.isError).toBe(true);
  });

  it('debe crear archivo nuevo si el padre existe', () => {
    const r = cmd_vim.execute(['nuevo.txt'], ctx(mk()));
    expect(r.isError).toBeFalsy();
    expect(r.nanoFile?.path).toBe('/root/nuevo.txt');
  });

  it('debe avisar que es emulación con --version', () => {
    expect(cmd_vim.execute(['--version'], ctx(mk())).output).toContain('not implemented');
  });
});
