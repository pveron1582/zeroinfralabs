// ── commands/builtin/__tests__/whoami.test.ts ──────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_whoami } from '../whoami';
import type { Machine } from '../../../types';

describe('cmd_whoami', () => {
  const createMockMachine = (id: string, hostname: string, ip: string, os: string, options?: {
    found_credentials?: { file: string; user: string; pass: string; verified: boolean; service?: string }[];
    ssh_credentials?: { user: string; pass: string };
  }): Machine => ({
    id,
    machine_info: { hostname, ip, mac: '00:00:00:00:00:00', os, status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: {
      ports: options?.ssh_credentials
        ? [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: options.ssh_credentials }]
        : []
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
    found_credentials: options?.found_credentials,
  });

  it('debe mostrar root para máquina atacante', () => {
    const machine = createMockMachine('attacker-01', 'kali', '192.168.1.10', 'Kali Linux');
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toBe('root');
  });

  it('debe mostrar usuario de found_credentials SSH si existe (después de SSH)', () => {
    const machine = createMockMachine('target-01', 'web-server', '192.168.1.20', 'Ubuntu', {
      found_credentials: [{ file: '/etc/passwd', user: 'developer', pass: 'dev2024', verified: true, service: 'ssh' }]
    });
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toBe('developer');
  });

  it('debe mostrar usuario de SSH port si no hay found_credentials', () => {
    const machine = createMockMachine('target-02', 'ssh-server', '192.168.1.30', 'Ubuntu', {
      ssh_credentials: { user: 'admin', pass: 'password123' }
    });
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toBe('admin');
  });

  it('debe mostrar "user" por defecto si no hay credenciales', () => {
    const machine = createMockMachine('target-03', 'unknown-server', '192.168.1.40', 'Ubuntu');
    const result = cmd_whoami.execute([], { machine } as any);

    expect(result.output).toBe('user');
  });
});
