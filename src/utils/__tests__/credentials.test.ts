import { describe, it, expect } from 'vitest';
import type { Machine } from '../../types';
import {
  getMachineCredentials,
  getKnownPassword,
  validatePassword,
  hasLoginShell,
  getCurrentSession,
} from '../credentials';

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
          'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
          'gonzalo:x:1000:1000:gonzalo:/home/gonzalo:/bin/bash',
          'carla:x:1001:1001:carla:/home/carla:/bin/bash',
        ].join('\n') + '\n',
        owner: 'root',
        group: 'root',
        mode: 0o644,
      },
    ],
    ...overrides,
  };
}

describe('getMachineCredentials', () => {
  it('une known_passwords con credenciales de puertos (ssh/ftp)', () => {
    const machine = makeMachine({
      known_passwords: { root: 'rootpass', carla: 'letmein' },
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'x', credentials: { user: 'gonzalo', pass: 'casablanca' } },
          { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'x' },
        ],
      },
    });
    expect(getMachineCredentials(machine)).toEqual({
      root: 'rootpass',
      carla: 'letmein',
      gonzalo: 'casablanca',
    });
  });

  it('devuelve tabla vacía si la máquina no define passwords', () => {
    expect(getMachineCredentials(makeMachine())).toEqual({});
  });
});

describe('getKnownPassword', () => {
  it('resuelve la password de un usuario de known_passwords', () => {
    const machine = makeMachine({ known_passwords: { carla: 'letmein' } });
    expect(getKnownPassword(machine, 'carla')).toBe('letmein');
    expect(getKnownPassword(machine, 'root')).toBeUndefined();
  });

  it('resuelve también desde credenciales de puerto', () => {
    const machine = makeMachine({
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'x', credentials: { user: 'gonzalo', pass: 'casablanca' } },
        ],
      },
    });
    expect(getKnownPassword(machine, 'gonzalo')).toBe('casablanca');
  });
});

describe('hasLoginShell', () => {
  it('devuelve true para root y usuarios con shell de login', () => {
    expect(hasLoginShell(makeMachine(), 'root')).toBe(true);
    expect(hasLoginShell(makeMachine(), 'gonzalo')).toBe(true);
  });

  it('devuelve false para usuarios de servicio y usuarios inexistentes', () => {
    expect(hasLoginShell(makeMachine(), 'www-data')).toBe(false);
    expect(hasLoginShell(makeMachine(), 'nobody')).toBe(false);
    expect(hasLoginShell(makeMachine(), 'ghost')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('acepta la password de known_passwords y rechaza otra', () => {
    const machine = makeMachine({ known_passwords: { root: 'rootpass' } });
    expect(validatePassword(machine, 'root', 'rootpass')).toBe(true);
    expect(validatePassword(machine, 'root', 'incorrecta')).toBe(false);
  });

  it('rechaza usuarios de servicio aunque la password sea el username', () => {
    const machine = makeMachine();
    expect(validatePassword(machine, 'www-data', 'www-data')).toBe(false);
  });

  it('rechaza usuarios inexistentes', () => {
    expect(validatePassword(makeMachine(), 'ghost', 'ghost')).toBe(false);
  });

  it('rechaza user=user aunque la shell sea de login y no haya password definida (sin fallback)', () => {
    // No existe el fallback legacy password=username: solo se acepta la
    // password registrada en known_passwords / credenciales de puerto.
    const machine = makeMachine();
    expect(validatePassword(machine, 'gonzalo', 'gonzalo')).toBe(false);
    expect(validatePassword(machine, 'gonzalo', 'otra')).toBe(false);
  });
});

describe('getCurrentSession', () => {
  it('devuelve el usuario actual y su password desde known_passwords', () => {
    const machine = makeMachine({
      su_user: 'gonzalo',
      known_passwords: { gonzalo: 'casablanca' },
    });
    const session = getCurrentSession(machine);
    expect(session.user.username).toBe('gonzalo');
    expect(session.password).toBe('casablanca');
  });

  it('devuelve la password desde credenciales verificadas (ssh)', () => {
    const machine = makeMachine({
      found_credentials: [
        { file: '/etc/passwd', user: 'gonzalo', pass: 'casablanca', verified: true, service: 'ssh' },
      ],
    });
    const session = getCurrentSession(machine);
    expect(session.user.username).toBe('gonzalo');
    expect(session.password).toBe('casablanca');
  });

  it('el atacante es root y no tiene password (sistema general: kali no necesita tabla)', () => {
    const machine = makeMachine({
      id: 'attacker-01',
      machine_info: { ...makeMachine().machine_info, hostname: 'kali' },
    });
    const session = getCurrentSession(machine);
    expect(session.user.username).toBe('root');
    expect(session.password).toBeUndefined();
  });
});
