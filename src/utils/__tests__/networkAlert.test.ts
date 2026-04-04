import { describe, it, expect } from 'vitest';
import { createEnumerationSnapshot, hasEnumerationChanged } from '../../utils/networkAlert';
import type { Machine } from '../../types';

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'test-machine',
    machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
    ...overrides,
  } as Machine;
}

describe('networkAlert', () => {
  describe('createEnumerationSnapshot', () => {
    it('debe crear snapshot con valores por defecto', () => {
      const machines = [makeMachine()];
      const snapshot = createEnumerationSnapshot(machines);
      expect(snapshot).toHaveLength(1);
      expect(snapshot[0].discoveryLevel).toBe(0);
      expect(snapshot[0].credentialsCount).toBe(0);
      expect(snapshot[0].directoriesCount).toBe(0);
      expect(snapshot[0].vulnerabilitiesCount).toBe(0);
      expect(snapshot[0].privescCompleted).toBe(false);
      expect(snapshot[0].possibleUsersCount).toBe(0);
    });

    it('debe crear snapshot con datos reales', () => {
      const machines = [makeMachine({
        discovery_level: 3,
        found_credentials: [
          { user: 'admin', pass: 'test', file: '/etc/passwd', verified: true, service: 'ssh' },
          { user: 'root', pass: 'test', file: '/etc/shadow', verified: false, service: 'ftp' },
        ],
        web_enumeration: {
          web_server: 'Apache',
          cms: 'WordPress',
          directories: [{ path: '/wp-admin', status: 200, description: 'Admin' }],
        },
        vulnerabilities: [{ id: 'CVE-2024-001', name: 'Test', status: 'detected' }],
        privesc_completed: true,
        possible_ssh_users: ['admin', 'root'],
      })];
      const snapshot = createEnumerationSnapshot(machines);
      expect(snapshot[0].discoveryLevel).toBe(3);
      expect(snapshot[0].credentialsCount).toBe(2);
      expect(snapshot[0].verifiedCredentialsCount).toBe(1);
      expect(snapshot[0].directoriesCount).toBe(1);
      expect(snapshot[0].vulnerabilitiesCount).toBe(1);
      expect(snapshot[0].privescCompleted).toBe(true);
      expect(snapshot[0].possibleUsersCount).toBe(2);
    });
  });

  describe('hasEnumerationChanged', () => {
    it('debe retornar false si no hay cambios', () => {
      const machines = [makeMachine({ discovery_level: 2 })];
      const before = createEnumerationSnapshot(machines);
      const after = createEnumerationSnapshot(machines);
      expect(hasEnumerationChanged(before, after)).toBe(false);
    });

    it('debe detectar aumento en discovery_level', () => {
      const before = createEnumerationSnapshot([makeMachine({ discovery_level: 1 })]);
      const after = createEnumerationSnapshot([makeMachine({ discovery_level: 2 })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar nuevas credenciales', () => {
      const before = createEnumerationSnapshot([makeMachine()]);
      const after = createEnumerationSnapshot([makeMachine({
        found_credentials: [{ user: 'admin', pass: 'test', file: '/etc/passwd', verified: false, service: 'ssh' }],
      })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar credenciales verificadas', () => {
      const before = createEnumerationSnapshot([makeMachine({
        found_credentials: [{ user: 'admin', pass: 'test', file: '/etc/passwd', verified: false, service: 'ssh' }],
      })]);
      const after = createEnumerationSnapshot([makeMachine({
        found_credentials: [{ user: 'admin', pass: 'test', file: '/etc/passwd', verified: true, service: 'ssh' }],
      })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar nuevos directorios web', () => {
      const before = createEnumerationSnapshot([makeMachine()]);
      const after = createEnumerationSnapshot([makeMachine({
        web_enumeration: {
          web_server: 'Apache',
          cms: 'none',
          directories: [{ path: '/uploads', status: 200, description: 'Uploads' }],
        },
      })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar nuevas vulnerabilidades', () => {
      const before = createEnumerationSnapshot([makeMachine()]);
      const after = createEnumerationSnapshot([makeMachine({
        vulnerabilities: [{ id: 'CVE-2024-001', name: 'Test', status: 'detected' }],
      })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar privesc completado', () => {
      const before = createEnumerationSnapshot([makeMachine()]);
      const after = createEnumerationSnapshot([makeMachine({ privesc_completed: true })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe detectar nuevos posibles usuarios SSH', () => {
      const before = createEnumerationSnapshot([makeMachine()]);
      const after = createEnumerationSnapshot([makeMachine({
        possible_ssh_users: ['admin', 'root'],
      })]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });

    it('debe manejar múltiples máquinas', () => {
      const before = createEnumerationSnapshot([
        makeMachine({ id: 'm1', discovery_level: 1 }),
        makeMachine({ id: 'm2', discovery_level: 0 }),
      ]);
      const after = createEnumerationSnapshot([
        makeMachine({ id: 'm1', discovery_level: 1 }),
        makeMachine({ id: 'm2', discovery_level: 2 }),
      ]);
      expect(hasEnumerationChanged(before, after)).toBe(true);
    });
  });
});
