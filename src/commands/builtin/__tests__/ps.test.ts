// ── commands/builtin/__tests__/ps.test.ts ───────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ps } from '../ps';
import type { Machine } from '../../../types';

describe('cmd_ps', () => {
  const createMockMachine = (os: string): Machine => ({
    id: 'test-machine',
    machine_info: { hostname: 'test', ip: '192.168.1.10', mac: '08:00:27:C4:D5:E6', os, status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar procesos básicos con ps', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_ps.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('PID TTY');
    expect(result.output).toContain('bash');
  });

  it('debe mostrar lista completa con ps aux', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_ps.execute(['aux'], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('USER');
    expect(result.output).toContain('%CPU');
    expect(result.output).toContain('%MEM');
    expect(result.output).toContain('root');
    expect(result.output).toContain('sshd');
    expect(result.output).toContain('nginx');
    expect(result.output).toContain('mysqld');
  });

  it('debe mostrar procesos de Windows en Windows', () => {
    const machine = createMockMachine('Windows Server 2019');

    const result = cmd_ps.execute(['aux'], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('svchost.exe');
    expect(result.output).toContain('explorer.exe');
    expect(result.output).toContain('lsass.exe');
  });

  it('debe funcionar con flag -e', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_ps.execute(['-e'], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('USER');
    expect(result.output).toContain('%CPU');
  });

  it('debe funcionar con flag -ef', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_ps.execute(['-ef'], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('USER');
    expect(result.output).toContain('PID');
  });
});
