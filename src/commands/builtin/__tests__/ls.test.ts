// ── commands/builtin/__tests__/ls.test.ts ────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ls } from '../ls';
import type { Machine } from '../../../types';

const createMachine = (files: Array<{ path: string; content: string; type: 'text' }>): Machine => ({
  id: 'test-machine',
  machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files,
});

describe('cmd_ls', () => {
  it('debe listar archivos sin argumento', () => {
    const machine = createMachine([
      { path: '/root/file1.txt', content: 'test', type: 'text' },
      { path: '/root/file2.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('file1.txt');
    expect(result.output).toContain('file2.txt');
    expect(result.output).toContain('total');
  });

  it('debe mostrar total 0 si no hay archivos', () => {
    const machine = createMachine([]);
    const result = cmd_ls.execute([], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('total 0');
  });

  it('debe listar archivos en directorio específico', () => {
    const machine = createMachine([
      { path: '/var/www/html/index.php', content: 'test', type: 'text' },
      { path: '/var/www/html/config.php', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('index.php');
    expect(result.output).toContain('config.php');
  });

  it('debe mostrar subdirectorios con /', () => {
    const machine = createMachine([
      { path: '/var/www/html/uploads/file.txt', content: 'test', type: 'text' },
      { path: '/var/www/html/index.php', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('uploads/');
    expect(result.output).toContain('drwxr-xr-x');
  });

  it('debe mostrar total 0 para directorio vacío', () => {
    const machine = createMachine([
      { path: '/root/file.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/empty'], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('total 0');
  });

  it('debe mostrar permisos de archivo', () => {
    const machine = createMachine([
      { path: '/root/test.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('-rw-r--r--');
    expect(result.output).toContain('admin');
  });

  it('debe mostrar permisos de directorio', () => {
    const machine = createMachine([
      { path: '/var/www/html/uploads/file.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('drwxr-xr-x');
    expect(result.output).toContain('root');
  });

  it('debe listar múltiples archivos', () => {
    const machine = createMachine([
      { path: '/root/zebra.txt', content: 'test', type: 'text' },
      { path: '/root/alpha.txt', content: 'test', type: 'text' },
      { path: '/root/middle.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('alpha.txt');
    expect(result.output).toContain('middle.txt');
    expect(result.output).toContain('zebra.txt');
  });
});