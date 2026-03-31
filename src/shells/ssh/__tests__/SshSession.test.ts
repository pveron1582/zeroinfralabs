// ── shells/ssh/__tests__/SshSession.test.ts ──────────────────────────────
import { describe, it, expect } from 'vitest';
import { sshSession } from '../SshSession';
import type { ShellContext } from '../../ShellSession';
import type { Machine } from '../../../types';

describe('SshSession', () => {
  const createMockMachine = (ip: string, credentials?: { user: string; pass: string }): Machine => ({
    id: ip === '10.0.0.1' ? 'attacker-01' : 'target-01',
    machine_info: { hostname: ip === '10.0.0.1' ? 'kali' : 'target', ip, mac: '00:00:00:00:00:00', os: 'Ubuntu 22.04', status: 'up', type: ip === '10.0.0.1' ? 'workstation' : 'server' },
    discovery_level: 4,
    scan_results: {
      ports: credentials
        ? [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials }]
        : []
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  const attacker = createMockMachine('10.0.0.1');
  const target = createMockMachine('192.168.1.100', { user: 'admin', pass: 'secret123' });

  const ctx: ShellContext = {
    machine: attacker,
    allMachines: [attacker, target],
    currentMissionId: 1,
    currentDir: '/',
    setCurrentDir: () => {},
  };

  describe('createInitialState', () => {
    it('debe retornar estado desconectado sin argumentos', () => {
      const state = sshSession.createInitialState([], ctx);
      expect(state.connected).toBe(false);
      expect(state.authenticated).toBe(false);
    });

    it('debe conectar con credenciales correctas', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100', 'secret123'], ctx);
      expect(state.connected).toBe(true);
      expect(state.authenticated).toBe(true);
      expect(state.user).toBe('admin');
      expect(state.targetIp).toBe('192.168.1.100');
    });

    it('debe conectar sin autenticación si credenciales incorrectas', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100', 'wrong'], ctx);
      expect(state.connected).toBe(true);
      expect(state.authenticated).toBe(false);
    });

    it('debe retornar desconectado si la máquina no existe', () => {
      const state = sshSession.createInitialState(['admin@192.168.999.999', 'pass'], ctx);
      expect(state.connected).toBe(false);
    });
  });

  describe('getPrompt', () => {
    it('debe mostrar prompt con usuario e IP cuando está autenticado', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', user: 'admin', authenticated: true };
      expect(sshSession.getPrompt(state)).toBe('admin@192.168.1.100:~$ ');
    });

    it('debe retornar string vacío cuando no está autenticado', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', user: 'admin', authenticated: false };
      expect(sshSession.getPrompt(state)).toBe('');
    });
  });

  describe('executeCommand - autenticación', () => {
    it('debe pedir password si solo se proporciona usuario', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', user: 'admin', authenticated: false };
      const { result } = sshSession.executeCommand('secret123', state, ctx);
      expect(result.output).toContain('Welcome to');
      expect(result.newMachineId).toBe('target-01');
      expect(result.foundCredentials).toBeDefined();
    });

    it('debe rechazar password incorrecto', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', user: 'admin', authenticated: false };
      const { result } = sshSession.executeCommand('wrongpass', state, ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain('Permission denied');
    });
  });

  describe('executeCommand - comandos autenticados', () => {
    const authState = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', user: 'admin', authenticated: true };

    it('debe ejecutar whoami', () => {
      const { result } = sshSession.executeCommand('whoami', authState, ctx);
      expect(result.output).toBe('admin');
    });

    it('debe ejecutar pwd', () => {
      const { result } = sshSession.executeCommand('pwd', authState, ctx);
      expect(result.output).toBe('/home/admin');
    });

    it('debe ejecutar ls', () => {
      const { result } = sshSession.executeCommand('ls', authState, ctx);
      expect(result.output).toContain('Desktop');
      expect(result.output).toContain('Documents');
    });

    it('debe ejecutar hostname', () => {
      const { result } = sshSession.executeCommand('hostname', authState, ctx);
      expect(result.output).toBe('192.168.1.100');
    });

    it('debe ejecutar id', () => {
      const { result } = sshSession.executeCommand('id', authState, ctx);
      expect(result.output).toContain('uid=');
      expect(result.output).toContain('admin');
    });

    it('debe ejecutar uname', () => {
      const { result } = sshSession.executeCommand('uname', authState, ctx);
      expect(result.output).toBe('Linux');
    });

    it('debe ejecutar uname -a', () => {
      const { result } = sshSession.executeCommand('uname -a', authState, ctx);
      expect(result.output).toContain('Linux');
      expect(result.output).toContain('x86_64');
    });

    it('debe ejecutar help', () => {
      const { result } = sshSession.executeCommand('help', authState, ctx);
      expect(result.output).toContain('whoami');
      expect(result.output).toContain('pwd');
      expect(result.output).toContain('ls');
    });

    it('debe ejecutar exit y cerrar sesión', () => {
      const { result, newState } = sshSession.executeCommand('exit', authState, ctx);
      expect(result.output).toContain('Connection to closed');
      expect(result.closeSession).toBe(true);
      expect(newState.connected).toBe(false);
      expect(newState.authenticated).toBe(false);
    });

    it('debe ejecutar quit', () => {
      const { result } = sshSession.executeCommand('quit', authState, ctx);
      expect(result.closeSession).toBe(true);
    });

    it('debe ejecutar logout', () => {
      const { result } = sshSession.executeCommand('logout', authState, ctx);
      expect(result.closeSession).toBe(true);
    });

    it('debe retornar error para comando desconocido', () => {
      const { result } = sshSession.executeCommand('comandoinexistente', authState, ctx);
      expect(result.output).toContain('command not found');
    });
  });

  describe('isActive', () => {
    it('debe retornar true cuando está conectado y autenticado', () => {
      const state = { connected: true, authenticated: true };
      expect(sshSession.isActive(state)).toBe(true);
    });

    it('debe retornar false cuando no está autenticado', () => {
      const state = { connected: true, authenticated: false };
      expect(sshSession.isActive(state)).toBe(false);
    });

    it('debe retornar false cuando no está conectado', () => {
      const state = { connected: false, authenticated: false };
      expect(sshSession.isActive(state)).toBe(false);
    });
  });
});
