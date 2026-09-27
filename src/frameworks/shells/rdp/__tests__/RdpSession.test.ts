// ── shells/rdp/__tests__/RdpSession.test.ts ───────────────────────
// Autenticación RDP interactiva: usuario → password → desktopAction.

import { describe, it, expect } from 'vitest';
import { rdpSession } from '../RdpSession';
import type { ShellContext } from '../../ShellSession';
import type { Machine } from '../../../../types';

const win = (ports: Machine['scan_results']['ports'], known?: Record<string, string>): Machine => ({
  id: 'win-01',
  machine_info: {
    hostname: 'WIN7-LAB',
    ip: '192.168.60.10',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows 7',
    status: 'up',
    type: 'workstation',
    family: 'windows',
  },
  discovery_level: 2,
  scan_results: { ports },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
  win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
  known_passwords: known,
});

const rdpPort = {
  port: 3389, protocol: 'tcp', state: 'open' as const,
  service: 'ms-wbt-server', version: 'Microsoft Terminal Services',
};

const attacker: Machine = {
  id: 'attacker-01',
  machine_info: {
    hostname: 'kali', ip: '10.0.0.1', mac: '00:00:00:00:00:01',
    os: 'Kali', status: 'up', type: 'workstation', family: 'linux',
  },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
};

const ctxFor = (machines: Machine[]): ShellContext => ({
  machine: machines.find(m => m.id === 'attacker-01') ?? machines[0],
  allMachines: machines,
  currentMissionId: 1,
  currentDir: '/',
  setCurrentDir: () => {},
});

describe('RdpSession', () => {
  const target = win([rdpPort], { Administrator: 'P@ssw0rd123!' });
  const ctx = ctxFor([attacker, target]);

  it('debe pedir usuario si no viene /u', () => {
    const state = rdpSession.createInitialState(['192.168.60.10'], ctx);
    expect(state.connected).toBe(true);
    expect(state.step).toBe('username');
    expect(rdpSession.getPrompt(state)).toBe('Usuario (192.168.60.10): ');
  });

  it('debe ir directo a password con usuario en args', () => {
    const state = rdpSession.createInitialState(['192.168.60.10', 'Administrator'], ctx);
    expect(state.step).toBe('password');
    expect(state.username).toBe('Administrator');
    expect(rdpSession.getPrompt(state)).toContain("Administrator@192.168.60.10's password");
  });

  it('debe rechazar host inexistente o puerto cerrado', () => {
    const noRdp = win([{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'SMB' }]);
    const s1 = rdpSession.createInitialState(['10.0.0.9'], ctxFor([attacker, noRdp]));
    expect(s1.connected).toBe(false);
    const s2 = rdpSession.createInitialState(['192.168.60.10'], ctxFor([attacker, win([])]));
    expect(s2.connected).toBe(false);
  });

  it('debe avanzar de username a password', () => {
    const s0 = rdpSession.createInitialState(['192.168.60.10'], ctx);
    const { result, newState } = rdpSession.executeCommand('Administrator', s0, ctx);
    expect(result.isError).toBeUndefined();
    expect(newState.step).toBe('password');
    expect(newState.username).toBe('Administrator');
  });

  it('debe autenticar y emitir desktopAction con password correcta', () => {
    const s0 = rdpSession.createInitialState(['192.168.60.10', 'Administrator'], ctx);
    const { result, newState } = rdpSession.executeCommand('P@ssw0rd123!', s0, ctx);
    expect(result.isError).toBeUndefined();
    expect(result.desktopAction).toEqual({
      action: 'connect',
      machineId: 'win-01',
      ip: '192.168.60.10',
    });
    expect(result.foundCredentials).toMatchObject({
      machineId: 'win-01',
      user: 'Administrator',
      service: 'rdp',
    });
    expect(result.closeSession).toBe(true);
    expect(newState.authenticated).toBe(true);
    expect(rdpSession.isActive(newState)).toBe(false);
  });

  it('debe fallar con password incorrecta (estilo ssh)', () => {
    const s0 = rdpSession.createInitialState(['192.168.60.10', 'Administrator'], ctx);
    const { result, newState } = rdpSession.executeCommand('wrong', s0, ctx);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Permission denied');
    expect(result.closeSession).toBe(true);
    expect(result.failedUser).toEqual({ machineId: 'win-01', user: 'Administrator' });
    expect(newState.connected).toBe(false);
  });

  it('debe validar también contra credenciales del puerto 3389', () => {
    const portCred = win([{
      ...rdpPort,
      credentials: { user: 'admin', pass: 'rdp-secret' },
    }]);
    const c = ctxFor([attacker, portCred]);
    const s0 = rdpSession.createInitialState(['192.168.60.10', 'admin'], c);
    const ok = rdpSession.executeCommand('rdp-secret', s0, c);
    expect(ok.result.desktopAction?.action).toBe('connect');
    const s1 = rdpSession.createInitialState(['192.168.60.10', 'admin'], c);
    const bad = rdpSession.executeCommand('nope', s1, c);
    expect(bad.result.isError).toBe(true);
  });

  it('isActive solo mientras espera credenciales', () => {
    const s0 = rdpSession.createInitialState(['192.168.60.10'], ctx);
    expect(rdpSession.isActive(s0)).toBe(true);
    expect(rdpSession.isActive({ ...s0, step: 'password', username: 'a' })).toBe(true);
    expect(rdpSession.isActive({ ...s0, authenticated: true, step: 'connected' })).toBe(false);
    expect(rdpSession.isActive({ ...s0, connected: false })).toBe(false);
  });
});
