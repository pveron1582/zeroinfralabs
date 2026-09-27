// ── utils/__tests__/labValidator.test.ts ───────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
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

    it('debe validar fileRead flag leída en la máquina atacante (flujo lab06: post-descarga)', () => {
      const result: CommandResponse = {
        output: 'test',
        fileRead: {
          path: '/root/database_dump.sql',
          machineId: 'attacker-01',
          isFlag: true,
          isPayload: false,
          isNote: false,
          content: 'ZIL{DATABASE_COMPROMISED}',
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

    it('debe validar vulnerabilityFound solo por vulnId sin status', () => {
      const result: CommandResponse = {
        output: 'test',
        foundVulnerability: { machineId: 'test', vulnId: 'SQLi', status: 'detected' },
      };
      const mission = createMission({ type: 'vulnerabilityFound', vulnId: 'SQLi' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar vulnerabilityFound que coincide con status pedido', () => {
      const result: CommandResponse = {
        output: 'test',
        foundVulnerability: { machineId: 'test', vulnId: 'SQLi', status: 'confirmed' },
      };
      const mission = createMission({ type: 'vulnerabilityFound', vulnId: 'SQLi', status: 'confirmed' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe fallar vulnerabilityFound si el status no coincide', () => {
      const result: CommandResponse = {
        output: 'test',
        foundVulnerability: { machineId: 'test', vulnId: 'SQLi', status: 'detected' },
      };
      const mission = createMission({ type: 'vulnerabilityFound', vulnId: 'SQLi', status: 'confirmed' });
      expect(validateMission(result, mission)).toBe(false);
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

    it('debe validar privesc con escalada real (privescCompleted)', () => {
      const result: CommandResponse = { output: 'test', privescCompleted: 'target-01' };
      const mission = createMission({ type: 'privesc' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe fallar privesc si solo hubo intento (privescAttempted sin completed)', () => {
      const result: CommandResponse = { output: 'test', privescAttempted: true };
      const mission = createMission({ type: 'privesc' });
      expect(validateMission(result, mission)).toBe(false);
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

    it('debe retornar false para browserAction criteria', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'browserAction' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe validar httpRequest cuando hay una request capturada', () => {
      const result: CommandResponse = {
        output: 'test',
        httpRequest: { method: 'GET', url: 'http://192.168.50.11/login', headers: {}, body: '' },
        httpResponse: { status: 200, statusText: 'OK', headers: {}, body: '' },
      };
      const mission = createMission({ type: 'httpRequest' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe validar httpRequest que coincida con una URL objetivo', () => {
      const result: CommandResponse = {
        output: 'test',
        httpRequest: { method: 'GET', url: 'http://192.168.50.11/login', headers: {}, body: '' },
        httpResponse: { status: 200, statusText: 'OK', headers: {}, body: '' },
      };
      const mission = createMission({ type: 'httpRequest', url: '/login' });
      expect(validateMission(result, mission)).toBe(true);
    });

    it('debe retornar false para httpRequest sin request capturada', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'httpRequest' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe retornar false para httpRequest con URL que no coincide', () => {
      const result: CommandResponse = {
        output: 'test',
        httpRequest: { method: 'GET', url: 'http://192.168.50.11/', headers: {}, body: '' },
        httpResponse: { status: 200, statusText: 'OK', headers: {}, body: '' },
      };
      const mission = createMission({ type: 'httpRequest', url: '/admin' });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe retornar false para tipo desconocido', () => {
      const result: CommandResponse = { output: 'test' };
      const mission = createMission({ type: 'unknown' as any });
      expect(validateMission(result, mission)).toBe(false);
    });

    it('debe exigir minHosts en discoveredHosts', () => {
      const result: CommandResponse = {
        output: 'test',
        discoveredHosts: [{ ip: '10.0.0.1', mac: '00:00:00:00:00:00', hostname: 'a' }],
      };
      expect(validateMission(result, createMission({ type: 'discoveredHosts', minHosts: 3 }))).toBe(false);
      const two: CommandResponse = {
        output: 'test',
        discoveredHosts: [
          { ip: '10.0.0.1', mac: '00:00:00:00:00:00', hostname: 'a' },
          { ip: '10.0.0.2', mac: '00:00:00:00:00:00', hostname: 'b' },
        ],
      };
      expect(validateMission(two, createMission({ type: 'discoveredHosts', minHosts: 2 }))).toBe(true);
    });

    it('debe matchear la IP objetivo en discoveredHosts', () => {
      const result: CommandResponse = {
        output: 'test',
        discoveredHosts: [{ ip: '10.0.0.1', mac: '00:00:00:00:00:00', hostname: 'a' }],
      };
      expect(validateMission(result, createMission({ type: 'discoveredHosts', targetIp: '10.0.0.1' }))).toBe(true);
      expect(validateMission(result, createMission({ type: 'discoveredHosts', targetIp: '10.0.0.9' }))).toBe(false);
    });

    it('debe matchear la IP objetivo en scanResults', () => {
      const base: CommandResponse = {
        output: 'test',
        scanResults: {
          targetId: 'test', targetIp: '10.0.0.1', targetHostname: 'test',
          ports: [{ port: 80, protocol: 'tcp', state: 'open', service: 'http' }],
        },
      };
      expect(validateMission(base, createMission({ type: 'scanResults', targetIp: '10.0.0.1' }))).toBe(true);
      expect(validateMission(base, createMission({ type: 'scanResults', targetIp: '10.0.0.9' }))).toBe(false);
      const noPorts: CommandResponse = {
        output: 'test',
        scanResults: { targetId: 'test', targetIp: '10.0.0.1', targetHostname: 'test', ports: [] },
      };
      expect(validateMission(noPorts, createMission({ type: 'scanResults' }))).toBe(false);
    });

    it('debe exigir escalada REAL en privesc (no alcanza el intento)', () => {
      const attempt: CommandResponse = { output: 'test', privescAttempted: true };
      expect(validateMission(attempt, createMission({ type: 'privesc' }))).toBe(false);
      const real: CommandResponse = { output: 'test', privescCompleted: 'machine-under-test' };
      expect(validateMission(real, createMission({ type: 'privesc' }))).toBe(true);
    });

    it('debe matchear vulnId y status en vulnerabilityFound', () => {
      const confirmed: CommandResponse = {
        output: 'test',
        foundVulnerability: { machineId: 'test-machine', vulnId: 'MS17-010', status: 'confirmed' },
      };
      const detected: CommandResponse = {
        output: 'test',
        foundVulnerability: { machineId: 'test-machine', vulnId: 'MS17-010', status: 'detected' },
      };
      expect(validateMission(confirmed, createMission({ type: 'vulnerabilityFound' }))).toBe(true);
      expect(validateMission(detected, createMission({ type: 'vulnerabilityFound' }))).toBe(false);
      expect(validateMission(confirmed, createMission({ type: 'vulnerabilityFound', vulnId: 'MS17-010' }))).toBe(true);
      expect(validateMission(confirmed, createMission({ type: 'vulnerabilityFound', vulnId: 'CVE-OTRA' }))).toBe(false);
      expect(validateMission(confirmed, createMission({
        type: 'vulnerabilityFound', vulnId: 'MS17-010', status: 'confirmed',
      }))).toBe(true);
      expect(validateMission(confirmed, createMission({
        type: 'vulnerabilityFound', vulnId: 'MS17-010', status: 'detected',
      }))).toBe(false);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'vulnerabilityFound' }))).toBe(false);
    });

    it('debe validar exploit por sesión abierta o intento de privesc', () => {
      const session: CommandResponse = { output: 'test', newMachineId: 'm2' };
      expect(validateMission(session, createMission({ type: 'exploit' }))).toBe(true);
      const attempt: CommandResponse = { output: 'test', privescAttempted: true };
      expect(validateMission(attempt, createMission({ type: 'exploit' }))).toBe(true);
      const nothing: CommandResponse = { output: 'test' };
      expect(validateMission(nothing, createMission({ type: 'exploit' }))).toBe(false);
    });

    it('debe validar uidChecked con y sin condición isSystem', () => {
      const sys: CommandResponse = { output: 'test', uidChecked: true, isSystem: true };
      expect(validateMission(sys, createMission({ type: 'uidChecked' }))).toBe(true);
      expect(validateMission(sys, createMission({ type: 'uidChecked', isSystem: true }))).toBe(true);
      expect(validateMission(sys, createMission({ type: 'uidChecked', isSystem: false }))).toBe(false);
      const unchecked: CommandResponse = { output: 'test' };
      expect(validateMission(unchecked, createMission({ type: 'uidChecked' }))).toBe(false);
    });

    it('debe validar ncListener y blockingCommand por puerto', () => {
      const listening: CommandResponse = {
        output: 'test',
        blockingCommand: { message: 'Listening on 4444', listeningPort: 4444 },
      };
      expect(validateMission(listening, createMission({ type: 'ncListener' }))).toBe(true);
      expect(validateMission(listening, createMission({ type: 'ncListener', port: 4444 }))).toBe(true);
      expect(validateMission(listening, createMission({ type: 'ncListener', port: 5555 }))).toBe(false);
      expect(validateMission(listening, createMission({ type: 'blockingCommand' }))).toBe(true);
      const plain: CommandResponse = { output: 'test' };
      expect(validateMission(plain, createMission({ type: 'ncListener' }))).toBe(false);
      expect(validateMission(plain, createMission({ type: 'blockingCommand' }))).toBe(false);
    });

    it('debe validar sudoPrivileges con usuario y comando', () => {
      const perms: CommandResponse = {
        output: 'test',
        sudoPrivileges: { machineId: 'm', user: 'john', commands: ['/usr/bin/vim'], canSudo: true },
      };
      expect(validateMission(perms, createMission({ type: 'sudoPrivileges' }))).toBe(true);
      expect(validateMission(perms, createMission({ type: 'sudoPrivileges', user: 'john' }))).toBe(true);
      expect(validateMission(perms, createMission({ type: 'sudoPrivileges', user: 'root' }))).toBe(false);
      expect(validateMission(perms, createMission({ type: 'sudoPrivileges', command: 'vim' }))).toBe(true);
      expect(validateMission(perms, createMission({ type: 'sudoPrivileges', command: 'nmap' }))).toBe(false);
      const noSudo: CommandResponse = {
        output: 'test',
        sudoPrivileges: { machineId: 'm', user: 'john', commands: [], canSudo: false },
      };
      expect(validateMission(noSudo, createMission({ type: 'sudoPrivileges' }))).toBe(false);
    });

    it('debe exigir los directorios requeridos en foundDirectories', () => {
      const result: CommandResponse = {
        output: 'test',
        foundDirectories: {
          targetId: 'test', targetUrl: 'http://10.0.0.1',
          directories: [{ path: '/wp-admin', status: 200 }],
        },
      };
      expect(validateMission(result, createMission({ type: 'foundDirectories' }))).toBe(true);
      expect(validateMission(result, createMission({ type: 'foundDirectories', directories: ['/wp-admin'] }))).toBe(true);
      expect(validateMission(result, createMission({ type: 'foundDirectories', directories: ['/oculto'] }))).toBe(false);
      const empty: CommandResponse = { output: 'test' };
      expect(validateMission(empty, createMission({ type: 'foundDirectories' }))).toBe(false);
    });

    it('debe validar foundCredentials por verified/user/service', () => {
      const creds: CommandResponse = {
        output: 'test',
        foundCredentials: { machineId: 'm', user: 'john', pass: 'x', file: 'nota.txt', service: 'ssh', verified: true },
      };
      expect(validateMission(creds, createMission({ type: 'foundCredentials' }))).toBe(true);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', user: 'john' }))).toBe(true);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', user: 'root' }))).toBe(false);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', verified: true }))).toBe(true);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', verified: false }))).toBe(false);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', service: 'ssh' }))).toBe(true);
      expect(validateMission(creds, createMission({ type: 'foundCredentials', service: 'ftp' }))).toBe(false);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'foundCredentials' }))).toBe(false);
    });

    it('debe validar sshLogin por usuario', () => {
      const login: CommandResponse = { output: 'test', sshLoginUser: 'john', newMachineId: 'm' };
      expect(validateMission(login, createMission({ type: 'sshLogin' }))).toBe(true);
      expect(validateMission(login, createMission({ type: 'sshLogin', user: 'john' }))).toBe(true);
      expect(validateMission(login, createMission({ type: 'sshLogin', user: 'root' }))).toBe(false);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'sshLogin' }))).toBe(false);
    });

    it('debe validar ftpLogin solo con sesión conectada y logueada', () => {
      const ok: CommandResponse = {
        output: 'test',
        ftpSession: { active: true, connected: true, loggedIn: true },
      };
      expect(validateMission(ok, createMission({ type: 'ftpLogin' }))).toBe(true);
      const notLogged: CommandResponse = {
        output: 'test',
        ftpSession: { active: true, connected: true, loggedIn: false },
      };
      expect(validateMission(notLogged, createMission({ type: 'ftpLogin' }))).toBe(false);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'ftpLogin' }))).toBe(false);
    });

    it('debe validar fileRead por tipo de archivo', () => {
      const mk = (meta: object): CommandResponse => ({ output: 'test', fileRead: {
        path: '/root/flag.txt', isNote: false, isFlag: false, isPayload: false, content: '', ...meta,
      } });
      expect(validateMission(mk({ isFlag: true }), createMission({ type: 'fileRead', fileType: 'flag' }))).toBe(true);
      expect(validateMission(mk({ isFlag: false }), createMission({ type: 'fileRead', fileType: 'flag' }))).toBe(false);
      expect(validateMission(mk({ isPayload: true }), createMission({ type: 'fileRead', fileType: 'payload' }))).toBe(true);
      expect(validateMission(mk({ isNote: true }), createMission({ type: 'fileRead', fileType: 'note' }))).toBe(true);
      expect(validateMission(mk({}), createMission({ type: 'fileRead' }))).toBe(true);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'fileRead' }))).toBe(false);
    });

    it('debe validar fileDownloaded por nombre y contenido', () => {
      const mk = (path: string, content: string): CommandResponse => ({
        output: 'test', downloadedFile: { path, content, type: 'text' },
      });
      expect(validateMission(mk('/tmp/nota.txt', 'hola'), createMission({ type: 'fileDownloaded', fileType: 'note' }))).toBe(true);
      expect(validateMission(mk('/tmp/data.bin', 'hola'), createMission({ type: 'fileDownloaded', fileType: 'note' }))).toBe(false);
      expect(validateMission(mk('/tmp/root.txt', 'ZIL{abc}'), createMission({ type: 'fileDownloaded', fileType: 'flag' }))).toBe(true);
      expect(validateMission(mk('/tmp/data.txt', 'hola'), createMission({ type: 'fileDownloaded', fileType: 'flag' }))).toBe(false);
      expect(validateMission(mk('/tmp/x.txt', 'hola'), createMission({ type: 'fileDownloaded' }))).toBe(true);
      const none: CommandResponse = { output: 'test' };
      expect(validateMission(none, createMission({ type: 'fileDownloaded' }))).toBe(false);
    });
  });
});
