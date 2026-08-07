// ── commands/builtin/__tests__/su.test.ts ──────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_su } from '../su';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_su', () => {
  const createMockMachine = (overrides: Partial<Machine> = {}): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'victim', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Dev:/home/developer:/bin/bash\n', type: 'text' },
      { path: '/etc/group', content: 'root:x:0:\ndeveloper:x:1001:\n', type: 'text' },
    ],
    ...overrides,
  });

  const createContext = (machine: Machine): CommandContext => ({
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    currentDir: '/',
  });

  it('debe pedir password para cambiar a root por defecto sin argumentos', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute([], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
    expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
    expect(machine.su_user).toBeUndefined();
  });

  it('debe pedir password con el argumento "-"', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute(['-'], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
    expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
    expect(machine.su_user).toBeUndefined();
  });

  it('debe pedir password para cambiar a un usuario específico', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute(['developer'], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
    expect('suTarget' in result ? result.suTarget : undefined).toBe('developer');
    expect(machine.su_user).toBeUndefined();
  });

  it('debe rechazar opciones inválidas', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute(['-x'], createContext(machine));

    expect(result.output).toContain('invalid option');
    expect(result.isError).toBe(true);
    expect(machine.su_user).toBeUndefined();
  });

  it('debe aceptar -i y -l como login shell a root', () => {
    for (const flag of ['-i', '-l', '--login']) {
      const machine = createMockMachine();
      const result = cmd_su.execute([flag], createContext(machine));

      expect(result.output).toBe('');
      expect(result.isError).toBe(false);
      expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
      expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
      expect(machine.su_user).toBeUndefined();
    }
  });

  it('debe aceptar su -i <user> como login shell a ese usuario', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute(['-i', 'developer'], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect('suTarget' in result ? result.suTarget : undefined).toBe('developer');
    expect(machine.su_user).toBeUndefined();
  });

  it('debe informar si el usuario actual ya es el objetivo', () => {
    const machine = createMockMachine({ su_user: 'root' });
    const result = cmd_su.execute(['root'], createContext(machine));

    expect(result.output).toContain('already root');
    expect(result.isError).toBe(false);
    expect(machine.su_user).toBe('root');
  });

  it('debe informar si el usuario no existe', () => {
    const machine = createMockMachine();
    const result = cmd_su.execute(['ghost'], createContext(machine));

    expect(result.output).toContain('does not exist');
    expect(result.isError).toBe(true);
    expect(machine.su_user).toBeUndefined();
  });

  it('debe pedir password cuando el usuario actual NO es root', () => {
    // mock machine: getCurrentUser cae al fallback {username:'user', uid:1000}
    const machine = createMockMachine();
    const result = cmd_su.execute(['root'], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    // El Terminal debe esperar password del usuario antes de confirmar
    expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
    expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
    // su_user NO se setea todavía — el CommandRunner lo aplica recién cuando la
    // password tipeada en el prompt sea validada. Si se seteara acá, un password
    // incorrecto igual dejaría al usuario como root (auth cosmética).
    expect(machine.su_user).toBeUndefined();
  });

  it('desde root cambia a otro usuario SIN password (root authority)', () => {
    const machine = createMockMachine({ su_user: 'root' });
    const result = cmd_su.execute(['developer'], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    // Root no pide password: el switch se aplica al instante vía suUserApplied.
    expect(result.requiresPassword).toBeUndefined();
    expect(result.suTarget).toBeUndefined();
    expect(result.suUserApplied).toBe('developer');
    // El comando en sí NO muta la máquina: el CommandRunner lo aplica al store.
    expect(machine.su_user).toBe('root');
  });
});