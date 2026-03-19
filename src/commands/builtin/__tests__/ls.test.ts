// ── commands/builtin/__tests__/ls.test.ts ───────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ls } from '../ls';
import type { Machine } from '../../../types';

describe('cmd_ls', () => {
  const createMockMachine = (files: any[] = []): Machine => ({
    id: 'test-01',
    machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files,
  });

  it('debe mostrar "total 0" si no hay archivos', () => {
    const machine = createMockMachine([]);
    const result = cmd_ls.execute([], { machine } as any);

    expect(result.output).toBe('total 0');
  });

  it('debe listar archivos con tamaños', () => {
    const machine = createMockMachine([
      { path: '/home/user/file1.txt', content: 'test', type: 'text' },
      { path: '/etc/config.conf', content: 'config', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine } as any);

    expect(result.output).toContain('file1.txt');
    expect(result.output).toContain('config.conf');
    expect(result.output).toContain('total');
    expect(result.output).toContain('admin');
  });

  it('debe mostrar permisos de archivo', () => {
    const machine = createMockMachine([
      { path: '/flag.txt', content: 'FLAG', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine } as any);

    expect(result.output).toContain('-rw-r--r--');
  });
});
