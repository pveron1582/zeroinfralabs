// ── commands/builtin/__tests__/pipeline.test.ts ────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_grep } from '../pipeline';
import type { Machine } from '../../../types';

describe('cmd_grep flags', () => {
  const createMockMachine = (): Machine => ({
    id: 'm1',
    machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/var/www/.dir', content: '', type: 'text' },
      { path: '/var/www/config.php', content: "user=admin\npass='s3cret'\npass='backup'\n", type: 'file' },
    ],
  } as unknown as Machine);

  const ctx = () => {
    const m = createMockMachine();
    return { machine: m, allMachines: [m], currentDir: '/' } as any;
  };

  it('debe numerar líneas con -n', () => {
    const result = cmd_grep.execute(['-n', 'pass', '/var/www/config.php'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain("2:pass='s3cret'");
    expect(result.output).toContain("3:pass='backup'");
    expect(result.output).not.toContain('1:');
  });

  it('debe contar coincidencias con -c', () => {
    const result = cmd_grep.execute(['-c', 'pass', '/var/www/config.php'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output.trim()).toBe('2');
  });

  it('debe mostrar solo el fragmento con -o', () => {
    const result = cmd_grep.execute(['-o', 'pass', '/var/www/config.php'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output.split('\n')).toEqual(['pass', 'pass']);
  });

  it('debe combinar -r con -n (archivo:línea:contenido)', () => {
    const result = cmd_grep.execute(['-rn', 'pass', '/var/www'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('/var/www/config.php:2:');
    expect(result.output).toContain('/var/www/config.php:3:');
  });

  it('debe contar por archivo con -r -c', () => {
    const result = cmd_grep.execute(['-rc', 'pass', '/var/www'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('/var/www/config.php:2');
  });
});
