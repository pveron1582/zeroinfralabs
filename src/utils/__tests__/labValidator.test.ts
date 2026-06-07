// ── utils/__tests__/labValidator.test.ts ───────────────────────────────
// Tests for the universal lab validator

import { describe, it, expect } from 'vitest';
import { validateMission } from '../labValidator';
import type { CommandResponse, Mission } from '../../types';

function createMission(criteria: Mission['validationCriteria']): Mission {
  return {
    id: 1,
    title: 'Test Mission',
    description: 'Test',
    status: 'active',
    targetMachineId: 'test-machine',
    discoveryLevel: 1,
    hintLevel: 0,
    validationCriteria: criteria,
  };
}

describe('labValidator', () => {
  describe('validateMission', () => {
    it('debe retornar false si no hay validationCriteria', () => {
      const result: CommandResponse = { output: 'test', discoveredHosts: [{ ip: '10.0.0.1', mac: '00:00:00:00:00:00', hostname: 'test' }] };
      const mission = createMission(undefined);
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe validar discoveredHosts correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        discoveredHosts: [{ ip: '10.0.0.1', mac: '00:00:00:00:00:00', hostname: 'test' }],
      };
      const mission = createMission({ type: 'discoveredHosts', minHosts: 1 });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe fallar si no hay hosts descubiertos suficientes', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'discoveredHosts', minHosts: 1 });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe validar scanResults correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        scanResults: {
          targetId: 'test',
          targetIp: '10.0.0.1',
          targetHostname: 'test',
          ports: [{ port: 80, protocol: 'tcp', state: 'open', service: 'http' }],
        },
      };
      const mission = createMission({ type: 'scanResults', port: 80 });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar foundCredentials correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        foundCredentials: {
          machineId: 'test',
          user: 'admin',
          pass: 'password',
          file: '/etc/passwd',
          service: 'ssh',
          verified: true,
        },
      };
      const mission = createMission({ type: 'foundCredentials', user: 'admin' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar foundDirectories correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        foundDirectories: {
          targetId: 'test',
          targetUrl: 'http://10.0.0.1',
          directories: [{ path: '/wp-admin', status: 200 }, { path: '/uploads', status: 200 }],
        },
      };
      const mission = createMission({ type: 'foundDirectories', directories: ['/wp-admin'] });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar fileRead con tipo flag', () => {
      const result: CommandResponse = {
        output: 'test',
        fileRead: {
          path: '/root/flag.txt',
          isFlag: true,
          isPayload: false,
          isNote: false,
          content: 'ZIL{test}',
        },
      };
      const mission = createMission({ type: 'fileRead', fileType: 'flag' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar sshLogin correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        sshLoginUser: 'root',
      };
      const mission = createMission({ type: 'sshLogin', user: 'root' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar ftpLogin correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        ftpSession: { active: true, connected: true, loggedIn: true, step: 'connected' },
      };
      const mission = createMission({ type: 'ftpLogin' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar fileDownloaded correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        downloadedFile: { path: '/root/nota.txt', content: 'test', type: 'text' },
      };
      const mission = createMission({ type: 'fileDownloaded', fileType: 'note' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar privesc correctamente', () => {
      const result: CommandResponse = { output: 'test', privescAttempted: true };
      const mission = createMission({ type: 'privesc' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar sudoPrivileges con canSudo=true', () => {
      const result: CommandResponse = {
        output: 'test',
        sudoPrivileges: {
          machineId: 'test',
          user: 'john',
          commands: ['john       ALL=(ALL) NOPASSWD: /usr/bin/vim'],
          canSudo: true,
        },
      };
      const mission = createMission({ type: 'sudoPrivileges' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe fallar sudoPrivileges si canSudo es false', () => {
      const result: CommandResponse = {
        output: 'test',
        sudoPrivileges: {
          machineId: 'test',
          user: 'john',
          commands: [],
          canSudo: false,
        },
      };
      const mission = createMission({ type: 'sudoPrivileges' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe validar sudoPrivileges con user específico', () => {
      const result: CommandResponse = {
        output: 'test',
        sudoPrivileges: {
          machineId: 'test',
          user: 'john',
          commands: ['john       ALL=(ALL) NOPASSWD: /usr/bin/vim'],
          canSudo: true,
        },
      };
      expect(validateMission(result, createMission({ type: 'sudoPrivileges', user: 'john' }))).toBe(true);
      expect(validateMission(result, createMission({ type: 'sudoPrivileges', user: 'alice' }))).toBe(false);
    });

    it('debe validar sudoPrivileges con command específico (substring match)', () => {
      const result: CommandResponse = {
        output: 'test',
        sudoPrivileges: {
          machineId: 'test',
          user: 'john',
          commands: ['john       ALL=(ALL) NOPASSWD: /usr/bin/vim'],
          canSudo: true,
        },
      };
      expect(validateMission(result, createMission({ type: 'sudoPrivileges', command: 'vim' }))).toBe(true);
      expect(validateMission(result, createMission({ type: 'sudoPrivileges', command: 'nano' }))).toBe(false);
    });

    it('debe fallar sudoPrivileges sin metadata en el resultado', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'sudoPrivileges' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe validar uidChecked correctamente', () => {
      const result: CommandResponse = { output: 'test', uidChecked: true };
      const mission = createMission({ type: 'uidChecked' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar ncListener correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        blockingCommand: { message: 'Listening', listeningPort: 4444 },
      };
      const mission = createMission({ type: 'ncListener', port: 4444 });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar blockingCommand correctamente', () => {
      const result: CommandResponse = {
        output: 'test',
        blockingCommand: { message: 'Listening', listeningPort: 4444 },
      };
      const mission = createMission({ type: 'blockingCommand' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe retornar false para custom criteria', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'custom' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe retornar false para tipo desconocido', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'unknown' as any });
      expect(validateMission(result, mission)).toBe(false);
    });
  });
});
