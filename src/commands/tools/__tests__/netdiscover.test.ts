// ── commands/tools/__tests__/netdiscover.test.ts ─────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_netdiscover } from '../netdiscover';
import type { Machine } from '../../../types';

describe('cmd_netdiscover', () => {
  const createMockMachine = (id: string, ip: string): Machine => ({
    id,
    machine_info: { hostname: 'target', ip, mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  // ── Basic validation ──

  it('debe detectar red automáticamente sin -r', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_netdiscover.execute([], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Scanning range: 192.168.1.0/24');
    expect(result.output).toContain('192.168.1.10');
    expect(result.discoveredHosts).toHaveLength(1);
  });

  it('debe escanear red y encontrar hosts', () => {
    const machines = [
      createMockMachine('target-01', '192.168.1.10'),
      createMockMachine('target-02', '192.168.1.20'),
    ];
    machines[1].machine_info.hostname = 'target2';
    machines[1].machine_info.mac = '00:0C:29:AA:BB:CC';

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Netdiscover');
    expect(result.output).toContain('192.168.1.10');
    expect(result.output).toContain('192.168.1.20');
    expect(result.output).toContain('Oracle Corporation');
    expect(result.output).toContain('2 hosts found');
    expect(result.discoveredHosts).toHaveLength(2);
  });

  it('debe reportar 0 hosts si red está vacía', () => {
    const result = cmd_netdiscover.execute(['-r', '10.0.0.0/24'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('No hosts found');
    expect(result.output).toContain('0 hosts found');
    expect(result.discoveredHosts).toBeUndefined();
  });

  // ── Options ──

  it('-v debe mostrar hostname y OS', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24', '-v'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Hostname: target');
    expect(result.output).toContain('OS: Ubuntu 20.04 LTS');
  });

  it('-P debe usar formato parseable', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24', '-P'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).not.toContain('Netdiscover');
    expect(result.output).not.toContain('hosts found');
    expect(result.output).toContain('192.168.1.10');
    expect(result.output).toContain('08:00:27');
  });

  it('-f debe mostrar Fast mode', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24', '-f'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Fast mode');
  });

  it('-p debe mostrar Passive mode', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24', '-p'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Passive mode');
  });

  it('-n debe respetar nodo inicial', () => {
    const machines = [
      createMockMachine('target-01', '192.168.1.5'),
      createMockMachine('target-02', '192.168.1.50'),
    ];

    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/24', '-n', '10'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.100' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('192.168.1.50');
    // Check that 192.168.1.5 is NOT present (but 192.168.1.50 is)
    // Use a pattern that won't match 192.168.1.50
    expect(result.output).not.toMatch(/192\.168\.1\.5[\s\t]/);
    expect(result.discoveredHosts).toHaveLength(1);
  });

  // ── Help ──

  it('-h debe mostrar ayuda', () => {
    const result = cmd_netdiscover.execute(['-h'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Netdiscover');
    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('-r <range>');
  });

  // ── Error cases ──

  it('debe rechazar rango inválido', () => {
    const result = cmd_netdiscover.execute(['-r', 'invalid'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Invalid range format');
  });

  it('debe rechazar máscara fuera de rango', () => {
    const result = cmd_netdiscover.execute(['-r', '192.168.1.0/8'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('/16 to /30');
  });

  it('debe rechazar IP inválida', () => {
    const result = cmd_netdiscover.execute(['-r', '999.999.999.0/24'], {
      machine: { machine_info: { mac: '08:00:27:AA:BB:CC', ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Invalid IP address');
  });
});
