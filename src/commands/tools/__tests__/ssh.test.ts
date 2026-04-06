// ── commands/tools/__tests__/ssh.test.ts ─────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_ssh } from '../ssh';
import { sshSession } from '../../../shells/ssh/SshSession';
import { shellManager, startShellSession, executeShellCommand, resetShellManager } from '../../index';
import type { Machine } from '../../../types';

describe('cmd_ssh (wrapper)', () => {
  const createMockMachine = (discoveryLevel: number = 3, withSSH: boolean = true): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '10.10.10.10', mac: '00:00:00:00:00:00', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: withSSH
        ? [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: { user: 'root', pass: 'toor' } }]
        : []
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Step 1', text: 'Recon', targetMachineId: 'target-01', discoveryLevel: 1 },
      { id: 2, task: 'Step 2', text: 'Scan', targetMachineId: 'target-01', discoveryLevel: 2 },
      { id: 3, task: 'Step 3', text: 'Brute', targetMachineId: 'target-01', discoveryLevel: 3 },
      { id: 4, task: 'Step 4', text: 'SSH', targetMachineId: 'target-01', discoveryLevel: 4 },
    ],
    files: [{ path: '/root/flag.txt', content: 'THM{TEST}', type: 'text' }],
  });

  const createAttacker = (): Machine => ({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.10.10.5', mac: '00:00:00:00:00:01', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  beforeEach(() => {
    resetShellManager();
  });

  it('debe requerir user@ip', () => {
    const result = cmd_ssh.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage:');
  });

  it('debe requerir fuerza bruta previa (discovery_level >= 3)', () => {
    const machines = [createMockMachine(2), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Primero descubre credenciales');
  });

  it('debe iniciar sesión SSH interactiva y pedir contraseña', () => {
    const machines = [createMockMachine(3), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10'], {
      allMachines: machines,
      currentMissionId: 4
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('root@10.10.10.10');
    expect(result.output).toContain('password');
    expect(result.sshSession?.active).toBe(true);
    expect(result.sshSession?.step).toBe('password');
  });

  it('debe fallar si no hay puerto SSH abierto', () => {
    const machines = [createMockMachine(3, false), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Connection refused');
  });
});

describe('sshSession (shell interactivo)', () => {
  const createMockMachine = (discoveryLevel: number = 3): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '10.10.10.10', mac: '00:00:00:00:00:00', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: { user: 'root', pass: 'toor' } }]
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Step 1', text: 'Recon', targetMachineId: 'target-01', discoveryLevel: 1 },
      { id: 4, task: 'SSH Access', text: 'Connect via SSH', targetMachineId: 'target-01', discoveryLevel: 4 },
    ],
    files: [{ path: '/root/flag.txt', content: 'THM{TEST}', type: 'text' }],
  });

  const createAttacker = (): Machine => ({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.10.10.5', mac: '00:00:00:00:00:01', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  const ctx = {
    machine: createAttacker(),
    allMachines: [createMockMachine(), createAttacker()],
    currentMissionId: 4,
    currentDir: '/root/',
    setCurrentDir: () => {},
  } as any;

  beforeEach(() => {
    resetShellManager();
  });

  it('debe crear estado inicial esperando password', () => {
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctx);
    expect(state.connected).toBe(true);
    expect(state.authenticated).toBe(false);
    expect(state.step).toBe('password');
    expect(state.username).toBe('root');
    expect(state.targetIp).toBe('10.10.10.10');
  });

  it('debe fallar si IP no existe', () => {
    const state = sshSession.createInitialState(['root@10.10.10.99'], ctx);
    expect(state.connected).toBe(false);
  });

  it('debe fallar si no hay puerto SSH', () => {
    const ctxNoSsh = {
      ...ctx,
      allMachines: [{
        ...ctx.allMachines[0],
        scan_results: { ports: [] }
      }, ctx.allMachines[1]]
    };
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctxNoSsh);
    expect(state.connected).toBe(false);
  });

  it('debe autenticar con contraseña correcta', () => {
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctx);
    const { result, newState } = sshSession.executeCommand('toor', state, ctx);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Warning: Permanently added');
    expect(result.output).toContain('Welcome to');
    expect(result.output).toContain('Last login:');
    expect(result.completedMissionId).toBe(4);
    expect(result.newMachineId).toBe('target-01');
    expect(result.closeSession).toBe(true);
    expect(result.sshSessionClosed).toBe(true);
    expect(newState.authenticated).toBe(true);
  });

  it('debe rechazar contraseña incorrecta', () => {
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctx);
    const { result, newState } = sshSession.executeCommand('wrongpass', state, ctx);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Permission denied');
    expect(result.closeSession).toBe(true);
    expect(result.failedUser).toBeDefined();
    expect(result.failedUser?.user).toBe('root');
    expect(newState.authenticated).toBe(false);
    expect(newState.connected).toBe(false);
  });

  it('debe completar misión si currentMissionId coincide', () => {
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctx);
    const { result } = sshSession.executeCommand('toor', state, ctx);
    expect(result.completedMissionId).toBe(4);
  });

  it('no debe completar misión si currentMissionId no coincide', () => {
    const ctxWrongMission = { ...ctx, currentMissionId: 99 };
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctxWrongMission);
    const { result } = sshSession.executeCommand('toor', state, ctxWrongMission);
    expect(result.completedMissionId).toBeUndefined();
  });

  it('isActive debe ser true solo cuando conectado y no autenticado (esperando password)', () => {
    const waitingState = { connected: true, authenticated: false, step: 'password' as const };
    expect(sshSession.isActive(waitingState)).toBe(true);

    const authState = { connected: true, authenticated: true, step: 'connected' as const };
    expect(sshSession.isActive(authState)).toBe(false);

    const disconnectedState = { connected: false, authenticated: false, step: 'connecting' as const };
    expect(sshSession.isActive(disconnectedState)).toBe(false);
  });

  it('getPrompt debe mostrar prompt de password', () => {
    const state = sshSession.createInitialState(['root@10.10.10.10'], ctx);
    expect(sshSession.getPrompt(state)).toBe('root@10.10.10.10\'s password: ');
  });
});
