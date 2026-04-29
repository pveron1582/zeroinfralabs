// ── commands/builtin/__tests__/top.test.ts ───────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_top } from '../top';
import type { Machine } from '../../../types';

describe('cmd_top', () => {
  const createMockMachine = (os: string): Machine => ({
    id: 'test-machine',
    machine_info: { hostname: 'test', ip: '192.168.1.10', mac: '08:00:27:C4:D5:E6', os, status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar vista top con estadísticas', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('top -');
    expect(result.output).toContain('up');
    expect(result.output).toContain('user');
    expect(result.output).toContain('load average');
    expect(result.output).toContain('Tasks:');
    expect(result.output).toContain('%Cpu(s):');
    expect(result.output).toContain('MiB Mem');
    expect(result.output).toContain('PID USER');
    expect(result.output).toContain('Press \'q\' to exit.');
  });

  it('debe retornar blockingCommand', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.cancelKey).toBe('q');
    expect(result.blockingCommand?.message).toBe('top running...');
  });

  it('debe mostrar procesos de Linux', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('systemd');
    expect(result.output).toContain('sshd');
    expect(result.output).toContain('nginx');
    expect(result.output).toContain('mysqld');
  });

  it('debe mostrar procesos de Windows', () => {
    const machine = createMockMachine('Windows Server 2019');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('System');
    expect(result.output).toContain('svchost.exe');
    expect(result.output).toContain('httpd.exe');
    expect(result.output).toContain('bash');
  });

  it('debe incluir métricas de CPU y Memoria', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('us');
    expect(result.output).toContain('sy');
    expect(result.output).toContain('ni');
    expect(result.output).toContain('id');
    expect(result.output).toContain('MiB Mem');
    expect(result.output).toContain('total');
    expect(result.output).toContain('free');
    expect(result.output).toContain('used');
  });

  it('debe incluir métricas de swap', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_top.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('MiB Swap');
  });
});
