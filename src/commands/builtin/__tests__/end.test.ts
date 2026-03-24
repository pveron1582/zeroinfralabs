// ── commands/builtin/__tests__/end.test.ts ───────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_end } from '../end';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_end', () => {
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

  it('debe retornar EXIT_TO_LANDING al ejecutar', () => {
    const machine = createMockMachine();
    const result = cmd_end.execute([], createMockContext(machine));

    expect(result.output).toBe('EXIT_TO_LANDING');
  });

  it('debe retornar un objeto CommandResponse válido', () => {
    const machine = createMockMachine();
    const result = cmd_end.execute([], createMockContext(machine));

    expect(result).toHaveProperty('output');
    expect(typeof result.output).toBe('string');
  });

  it('no debe tener propiedad isError', () => {
    const machine = createMockMachine();
    const result = cmd_end.execute([], createMockContext(machine));

    expect(result.isError).toBeUndefined();
  });

  it('debe ignorar argumentos adicionales', () => {
    const machine = createMockMachine();
    const result = cmd_end.execute(['--force', '-y'], createMockContext(machine));

    expect(result.output).toBe('EXIT_TO_LANDING');
  });

  it('debe funcionar en cualquier máquina', () => {
    const machine: Machine = {
      ...createMockMachine(),
      id: 'target-01',
      machine_info: {
        ...createMockMachine().machine_info,
        type: 'server',
      },
    };
    const result = cmd_end.execute([], createMockContext(machine));

    expect(result.output).toBe('EXIT_TO_LANDING');
  });
});