// ── commands/builtin/__tests__/ping.test.ts ──────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ping } from '../ping';
import type { Machine } from '../../../types';

describe('cmd_ping', () => {
  const createMockMachine = (id: string, ip: string): Machine => ({
    id,
    machine_info: { hostname: 'target', ip, mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar error sin argumentos', () => {
    const result = cmd_ping.execute([], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage error');
  });

  it('debe hacer ping a host existente', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_ping.execute(['192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('PING 192.168.1.10');
    expect(result.output).toContain('bytes from 192.168.1.10');
    expect(result.output).toContain('icmp_seq');
    expect(result.output).toContain('0% packet loss');
    expect(result.output).toContain('rtt min/avg/max');
  });

  it('debe reportar 100% packet loss a host inexistente', () => {
    const result = cmd_ping.execute(['10.0.0.99'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('PING 10.0.0.99');
    expect(result.output).toContain('100% packet loss');
    expect(result.output).toContain('0 received');
  });

  it('debe respetar flag -c para cantidad de paquetes', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_ping.execute(['-c', '2', '192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    // Count occurrences of icmp_seq lines
    const matches = result.output.match(/icmp_seq/g);
    expect(matches?.length).toBe(2);
    expect(result.output).toContain('2 packets transmitted');
  });

  it('debe respetar flag -s para tamaño de paquete', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_ping.execute(['-s', '100', '192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('100(128) bytes');
  });

  it('debe mostrar TTL 128 para Windows', () => {
    const machine = createMockMachine('target-01', '192.168.1.10');
    machine.machine_info.os = 'Windows 10 Pro';

    const result = cmd_ping.execute(['192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('ttl=128');
  });

  it('debe mostrar TTL 64 para Linux', () => {
    const machine = createMockMachine('target-01', '192.168.1.10');
    machine.machine_info.os = 'Ubuntu 22.04 LTS';

    const result = cmd_ping.execute(['192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('ttl=64');
  });

  it('debe mostrar ayuda con -h', () => {
    const result = cmd_ping.execute(['-h'], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('-c');
    expect(result.output).toContain('count');
  });

  it('debe rechazar IP inválida', () => {
    const result = cmd_ping.execute(['invalid'], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Name or service not known');
  });
});
