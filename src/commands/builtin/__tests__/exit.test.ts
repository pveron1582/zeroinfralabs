// ── commands/builtin/__tests__/exit.test.ts ───────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_exit } from '../exit';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_exit', () => {
  const createMockMachine = (): Machine => ({
    id: 'test-machine',
    machine_info: {
      hostname: 'test-host',
      ip: '192.168.1.100',
      mac: '00:00:00:00:00:00',
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

  it('debe indicar usar "end" al ejecutar en máquina atacante', () => {
    const machine = createMockMachine();
    const result = cmd_exit.execute([], createMockContext(machine));

    expect(result.output).toContain('logout');
    expect(result.output).toContain("Usa 'end' para salir del laboratorio");
  });

  it('debe retornar un objeto CommandResponse válido', () => {
    const machine = createMockMachine();
    const result = cmd_exit.execute([], createMockContext(machine));

    expect(result).toHaveProperty('output');
    expect(typeof result.output).toBe('string');
  });

  it('no debe tener propiedad isError', () => {
    const machine = createMockMachine();
    const result = cmd_exit.execute([], createMockContext(machine));

    expect(result.isError).toBeUndefined();
  });

  it('debe ignorar argumentos adicionales', () => {
    const machine = createMockMachine();
    const result = cmd_exit.execute(['--force', '-y'], createMockContext(machine));

    expect(result.output).toContain('logout');
    expect(result.output).toContain("Usa 'end' para salir del laboratorio");
  });

  it('debe retornar logout y newMachineId cuando no es máquina atacante', () => {
    const attackerMachine = createMockMachine();
    const targetMachine: Machine = {
      ...createMockMachine(),
      id: 'target-01',
      machine_info: {
        ...createMockMachine().machine_info,
        type: 'server',
      },
    };
    const ctx: CommandContext = {
      machine: targetMachine,
      allMachines: [attackerMachine, targetMachine],
      currentMissionId: 1,
      currentDir: '/',
    };
    const result = cmd_exit.execute([], ctx);

    expect(result.output).toContain('logout');
    expect(result.output).toContain('Connection to target closed');
    expect(result.newMachineId).toBe('attacker-01');
  });
});