// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Aislamiento de identidad (HIGH #2): override de su_user por ejecución y
// derivación de usuario para prompt/env (getUserWithSu).
import { describe, it, expect, afterEach } from 'vitest';
import type { Machine } from '../../types';
import {
  getCurrentUser,
  setExecutionSuUser,
  resolveUsername,
  getUserWithSu,
} from '../users';

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'lab-target',
    machine_info: {
      hostname: 'target',
      ip: '10.0.0.5',
      mac: '08:00:27:00:00:01',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      {
        path: '/etc/passwd',
        type: 'text',
        content: [
          'root:x:0:0:root:/root:/bin/bash',
          'carla:x:1001:1001:Carla:/home/carla:/bin/bash',
        ].join('\n') + '\n',
        owner: 'root',
        group: 'root',
        mode: 0o644,
      },
    ],
    ...overrides,
  } as Machine;
}

afterEach(() => {
  setExecutionSuUser(undefined);
});

describe('setExecutionSuUser (override por ejecución)', () => {
  it('debe resolver el usuario del override sin tocar machine.su_user', () => {
    const machine = makeMachine();
    setExecutionSuUser('carla');
    expect(getCurrentUser(machine).username).toBe('carla');
    expect(machine.su_user).toBeUndefined();
  });

  it('sin override debe caer al modo legacy (machine.su_user)', () => {
    const machine = makeMachine({ su_user: 'carla' });
    setExecutionSuUser(undefined);
    expect(getCurrentUser(machine).username).toBe('carla');
  });

  it('override root devuelve uid 0 desde /etc/passwd', () => {
    const machine = makeMachine();
    setExecutionSuUser('root');
    const user = getCurrentUser(machine);
    expect(user.username).toBe('root');
    expect(user.uid).toBe(0);
  });

  it('limpiar el override restaura la identidad derivada de la máquina', () => {
    const machine = makeMachine();
    setExecutionSuUser('root');
    expect(getCurrentUser(machine).username).toBe('root');
    setExecutionSuUser(undefined);
    expect(getCurrentUser(machine).username).not.toBe('root');
  });
});

describe('resolveUsername', () => {
  it('debe resolver usuarios existentes en /etc/passwd', () => {
    expect(resolveUsername(makeMachine(), 'carla').uid).toBe(1001);
  });

  it('debe crear un usuario sintético si no existe', () => {
    const ghost = resolveUsername(makeMachine(), 'ghost');
    expect(ghost.username).toBe('ghost');
    expect(ghost.uid).toBe(1000);
  });
});

describe('getUserWithSu', () => {
  it('con suUser de frame resuelve ese usuario directamente', () => {
    expect(getUserWithSu(makeMachine(), 'carla').username).toBe('carla');
  });

  it('sin suUser deriva de la máquina (credenciales/legacy)', () => {
    const machine = makeMachine({ su_user: 'carla' });
    expect(getUserWithSu(machine).username).toBe('carla');
  });

  it('en Windows ignora el suUser de frame (la regla win manda: admin ⇒ uid 0)', () => {
    const win = makeMachine({
      id: 'win-01',
      machine_info: {
        hostname: 'winbox', ip: '10.0.0.9', mac: '00:11:22:33:44:55',
        os: 'Windows 10', status: 'up', type: 'workstation', family: 'windows',
      },
      win: { currentUser: 'Administrador', isAdmin: true, computerName: 'WIN-TEST' },
    } as Partial<Machine>);
    const user = getUserWithSu(win, 'root');
    expect(user.username).toBe('Administrador');
    expect(user.uid).toBe(0);
  });
});
