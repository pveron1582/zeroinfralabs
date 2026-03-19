// ── commands/builtin/__tests__/whoami.test.ts ──────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_whoami } from '../whoami';
import type { Machine } from '../../../types';

describe('cmd_whoami', () => {
  const createMockMachine = (id: string, hostname: string, ip: string, os: string): Machine => ({
    id,
    machine_info: { hostname, ip, mac: '00:00:00:00:00:00', os, status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar root para máquina atacante', () => {
    const machine = createMockMachine('attacker-01', 'kali', '192.168.1.10', 'Kali Linux');
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toContain('root');
    expect(result.output).toContain('uid=0(root)');
    expect(result.output).toContain('192.168.1.10');
  });

  it('debe mostrar admin para máquina objetivo', () => {
    const machine = createMockMachine('target-01', 'web-server', '192.168.1.20', 'Ubuntu');
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toContain('admin');
    expect(result.output).not.toContain('root');
    expect(result.output).toContain('web-server');
  });
});
