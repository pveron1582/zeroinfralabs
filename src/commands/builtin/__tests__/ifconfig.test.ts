// ── commands/builtin/__tests__/ifconfig.test.ts ───────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ifconfig } from '../ifconfig';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_ifconfig', () => {
  const createMockMachine = (ip: string = '192.168.1.100', mac: string = '00:11:22:33:44:55'): Machine => ({
    id: 'test-machine',
    machine_info: {
      hostname: 'test-host',
      ip,
      mac,
      os: 'Kali Linux',
      status: 'up',
      type: 'workstation',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  const createMockContext = (machine: Machine): CommandContext => ({
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    currentDir: '/',
  });

  it('debe mostrar información de eth0 con IP y MAC', () => {
    const machine = createMockMachine('10.10.10.5', 'aa:bb:cc:dd:ee:ff');
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('eth0');
    expect(result.output).toContain('10.10.10.5');
    expect(result.output).toContain('aa:bb:cc:dd:ee:ff');
  });

  it('debe mostrar netmask 255.255.255.0', () => {
    const machine = createMockMachine('192.168.1.50');
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('255.255.255.0');
  });

  it('debe calcular broadcast correctamente', () => {
    const machine = createMockMachine('192.168.1.100');
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('broadcast 192.168.1.255');
  });

  it('debe mostrar interfaz loopback lo', () => {
    const machine = createMockMachine();
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('lo:');
    expect(result.output).toContain('127.0.0.1');
    expect(result.output).toContain('255.0.0.0');
  });

  it('debe mostrar flags UP,BROADCAST,RUNNING,MULTICAST para eth0', () => {
    const machine = createMockMachine();
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('UP,BROADCAST,RUNNING,MULTICAST');
  });

  it('debe mostrar mtu 1500 para eth0', () => {
    const machine = createMockMachine();
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('mtu 1500');
  });

  it('debe mostrar mtu 65536 para lo', () => {
    const machine = createMockMachine();
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.output).toContain('mtu 65536');
  });

  it('no debe retornar error', () => {
    const machine = createMockMachine();
    const result = cmd_ifconfig.execute([], createMockContext(machine));

    expect(result.isError).toBeUndefined();
  });
});