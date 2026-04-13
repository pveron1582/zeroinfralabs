// ── shells/ssh/__tests__/SshSession.test.ts ──────────────────────────────
import { describe, it, expect } from 'vitest';
import { sshSession } from '../SshSession';
import type { ShellContext } from '../../ShellSession';
import type { Machine } from '../../../../types';

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
    learning_steps: [
      { id: 1, task: 'SSH Access', text: 'Connect via SSH', targetMachineId: 'target-01', discoveryLevel: 4 },
    ],
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
      expect(state.step).toBe('connecting');
    });

    it('debe conectar y esperar password (sin autenticar aun)', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100'], ctx);
      expect(state.connected).toBe(true);
      expect(state.authenticated).toBe(false);
      expect(state.step).toBe('password');
      expect(state.username).toBe('admin');
      expect(state.targetIp).toBe('192.168.1.100');
    });

    it('debe retornar desconectado si la máquina no existe', () => {
      const state = sshSession.createInitialState(['admin@10.10.10.99'], ctx);
      expect(state.connected).toBe(false);
    });

    it('debe retornar desconectado si no hay puerto SSH', () => {
      const noSshTarget = createMockMachine('192.168.1.200');
      const ctxNoSsh: ShellContext = { ...ctx, allMachines: [attacker, noSshTarget] };
      const state = sshSession.createInitialState(['admin@192.168.1.200'], ctxNoSsh);
      expect(state.connected).toBe(false);
    });
  });

  describe('getPrompt', () => {
    it('debe mostrar prompt de password cuando espera contraseña', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', username: 'admin', authenticated: false, step: 'password' as const };
      expect(sshSession.getPrompt(state)).toBe('admin@192.168.1.100\'s password: ');
    });

    it('debe retornar string vacío cuando está conectado', () => {
      const state = { connected: true, targetIp: '192.168.1.100', targetId: 'target-01', username: 'admin', authenticated: true, step: 'connected' as const };
      expect(sshSession.getPrompt(state)).toBe('');
    });
  });

  describe('executeCommand - autenticación', () => {
    it('debe autenticar con contraseña correcta', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100'], ctx);
      const { result, newState } = sshSession.executeCommand('secret123', state, ctx);

      expect(result.isError).toBeUndefined();
      expect(result.output).toContain('Warning: Permanently added');
      expect(result.output).toContain('Welcome to');
      expect(result.output).toContain('Last login:');
      expect(result.newMachineId).toBe('target-01');
      expect(result.closeSession).toBe(true);
      expect(result.sshSessionClosed).toBe(true);
      expect(result.foundCredentials).toBeDefined();
      expect(result.foundCredentials?.user).toBe('admin');
      expect(result.foundCredentials?.pass).toBe('secret123');
      expect(newState.authenticated).toBe(true);
    });

    it('debe rechazar contraseña incorrecta', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100'], ctx);
      const { result, newState } = sshSession.executeCommand('wrongpass', state, ctx);

      expect(result.isError).toBe(true);
      expect(result.output).toContain('Permission denied');
      expect(result.closeSession).toBe(true);
      expect(result.failedUser).toBeDefined();
      expect(result.failedUser?.user).toBe('admin');
      expect(newState.authenticated).toBe(false);
      expect(newState.connected).toBe(false);
    });

    it('debe reportar metadata de login exitoso (sin completedMissionId)', () => {
      const state = sshSession.createInitialState(['admin@192.168.1.100'], ctx);
      const { result } = sshSession.executeCommand('secret123', state, ctx);
      // completedMissionId ya no se usa - las misiones se validan por labValidator
      expect(result.completedMissionId).toBeUndefined();
      expect(result.sshLoginUser).toBe('admin');
      expect(result.foundCredentials).toBeDefined();
    });
  });

  describe('isActive', () => {
    it('debe retornar true cuando está conectado y esperando password', () => {
      const state = { connected: true, authenticated: false, step: 'password' as const };
      expect(sshSession.isActive(state)).toBe(true);
    });

    it('debe retornar false cuando está autenticado (sesión se cierra)', () => {
      const state = { connected: true, authenticated: true, step: 'connected' as const };
      expect(sshSession.isActive(state)).toBe(false);
    });

    it('debe retornar false cuando no está conectado', () => {
      const state = { connected: false, authenticated: false, step: 'connecting' as const };
      expect(sshSession.isActive(state)).toBe(false);
    });
  });
});
