// ── commands/tools/__tests__/gobuster.test.ts ──────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_gobuster } from '../gobuster';
import type { Machine } from '../../../types';

describe('cmd_gobuster', () => {
  const createMockMachine = (): Machine => ({
    id: 'web-01',
    machine_info: { hostname: 'web', ip: '10.10.10.11', mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 2,
    scan_results: { ports: [] },
    web_enumeration: {
      web_server: 'apache',
      cms: 'none',
      directories: [
        { path: '/admin', status: 301, description: '' },
        { path: '/backup', status: 200, description: '' },
        { path: '/old', status: 403, description: '' },
      ],
    },
    learning_steps: [],
    files: [],
  });

  const ctx = (machines: Machine[]) => ({ allMachines: machines, currentMissionId: 1 }) as any;

  it('debe pedir subcomando dir con -u y -w', () => {
    const result = cmd_gobuster.execute(['-u', 'http://10.10.10.11', '-w', 'common.txt'], ctx([createMockMachine()]));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Usage:');
  });

  it('debe pedir la IP real en vez de <IP>', () => {
    const result = cmd_gobuster.execute(['dir', '-u', 'http://<IP>', '-w', 'common.txt'], ctx([createMockMachine()]));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('IP real');
  });

  it('debe enumerar directorios y emitir foundDirectories', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', '/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('/admin');
    expect(result.output).toContain('/backup');
    const fd = 'foundDirectories' in result ? result.foundDirectories : undefined;
    expect(fd).toBeDefined();
    expect(fd?.directories.some(d => d.path === '/admin')).toBe(true);
  });

  it('debe aceptar wordlists distintas a common.txt', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('/admin');
    const fd = 'foundDirectories' in result ? result.foundDirectories : undefined;
    expect(fd).toBeDefined();
  });

  it('debe filtrar códigos con -s', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', 'common.txt', '-s', '200'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('/backup');
    expect(result.output).not.toContain('/admin');
    expect(result.output).not.toContain('/old');
  });

  it('debe ocultar códigos con -b', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', 'common.txt', '-b', '403'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('/admin');
    expect(result.output).not.toContain('/old');
  });

  it('debe expandir URLs con -e', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', 'common.txt', '-s', '301', '-e'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('http://10.10.10.11/admin');
  });

  it('debe aceptar -x, -t y --wildcard del uso realista', () => {
    const result = cmd_gobuster.execute(
      ['dir', '-u', 'http://10.10.10.11', '-w', 'common.txt', '-x', 'php,txt', '-t', '50', '--wildcard'],
      ctx([createMockMachine()])
    );
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Threads: 50');
    expect(result.output).toContain('Extensions: php,txt');
    expect(result.output).toContain('Wildcard');
  });
});
