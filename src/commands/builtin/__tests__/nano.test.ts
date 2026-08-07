// ── commands/builtin/__tests__/nano.test.ts ────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_nano } from '../nano';
import { validateMission } from '../../../utils/labValidator';
import type { Machine, CommandContext, Mission } from '../../../types';

const createMockMachine = (overrides: Partial<Machine> = {}): Machine => ({
  id: 'target-01',
  machine_info: { hostname: 'victim', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/flag.txt', content: 'ZIL{NANO_READS_FLAGS}', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/home/user/nota.txt', content: 'Para mario: la password es sunshine', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    { path: '/root/payload.php', content: '<?php echo "shell"; ?>', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
  ],
  ...overrides,
});

const createContext = (machine: Machine): CommandContext => ({
  machine,
  allMachines: [machine],
  currentMissionId: 1,
  currentDir: '/',
});

describe('cmd_nano - metadata fileRead', () => {
  it('debe emitir fileRead.isFlag al abrir una flag (mismo criterio que cat)', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute(['/root/flag.txt'], createContext(machine));

    expect('nanoFile' in result).toBe(true);
    const fr = 'fileRead' in result ? result.fileRead : undefined;
    expect(fr).toBeDefined();
    expect(fr?.path).toBe('/root/flag.txt');
    expect(fr?.isFlag).toBe(true);
    expect(fr?.content).toContain('ZIL{');
  });

  it('debe validar la misión con fileRead flag al leer con nano', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute(['/root/flag.txt'], createContext(machine));

    const mission: Mission = {
      id: 9,
      task: 'Capture Root Flag',
      targetMachineId: 'target-01',
      discoveryLevel: 4,
      text: 'Read the root flag',
      validationCriteria: { type: 'fileRead', fileType: 'flag' },
    } as unknown as Mission;

    expect(validateMission(result, mission)).toBe(true);
  });

  it('debe emitir fileRead.isNote + possibleUsers al abrir una nota', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute(['/home/user/nota.txt'], createContext(machine));

    const fr = 'fileRead' in result ? result.fileRead : undefined;
    expect(fr?.isNote).toBe(true);
    expect(fr?.isFlag).toBe(false);

    const pu = 'possibleUsers' in result ? result.possibleUsers : undefined;
    expect(pu).toBeDefined();
    expect(pu?.users).toContain('mario');
    expect(pu?.machineId).toBe('target-01');
  });

  it('debe emitir fileRead.isPayload al abrir un payload', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute(['/root/payload.php'], createContext(machine));

    const fr = 'fileRead' in result ? result.fileRead : undefined;
    expect(fr?.isPayload).toBe(true);
  });

  it('no debe emitir fileRead para un archivo nuevo', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute(['/tmp/archivo-nuevo.txt'], createContext(machine));

    expect('nanoFile' in result).toBe(true);
    expect('fileRead' in result).toBe(false);
  });

  it('no debe emitir fileRead sin argumentos', () => {
    const machine = createMockMachine();
    const result = cmd_nano.execute([], createContext(machine));

    expect('nanoFile' in result).toBe(true);
    expect('fileRead' in result).toBe(false);
  });
});
