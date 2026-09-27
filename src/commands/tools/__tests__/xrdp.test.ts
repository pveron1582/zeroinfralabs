// ── commands/tools/__tests__/xrdp.test.ts ─────────────────────────
// Cliente RDP de Linux: mismo núcleo que mstsc, con mensajes propios
// y exclusivo del bash (da Command not found en máquinas Windows).

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_xrdp } from '../xrdp';
import {
  resetShellManager, isShellSessionActive, getCurrentShellName, executeShellCommand,
} from '../../shellIntegration';
import type { Machine } from '../../../types';

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

const kali = (): Machine => ({
  id: 'kali-01',
  machine_info: {
    hostname: 'kali',
    ip: '192.168.60.5',
    mac: '08:00:27:AA:BB:CC',
    os: 'Kali Linux 2024.1',
    status: 'up',
    type: 'attacker',
  },
  discovery_level: 2,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
});

const rdpPort = {
  port: 3389, protocol: 'tcp', state: 'open' as const,
  service: 'ms-wbt-server', version: 'Microsoft Terminal Services',
};

/** Contexto típico: atacante Linux + objetivos (incluye el Windows). */
const ctx = (targets: Machine[]) => ({
  machine: kali(),
  allMachines: targets,
  currentMissionId: 1,
  terminalId: 'test-xrdp',
} as any);

/** Contexto en el que la máquina ACTUAL es Windows (guard del comando). */
const winCtx = (m: Machine) => ({
  machine: m,
  allMachines: [m],
  currentMissionId: 1,
  terminalId: 'test-xrdp',
} as any);

describe('cmd_xrdp', () => {
  beforeEach(() => {
    resetShellManager();
  });

  it('debe pedir /v:<ip-o-hostname>', () => {
    const r = cmd_xrdp.execute([], ctx([]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso: xrdp');
  });

  it('debe fallar si el host no existe', () => {
    const r = cmd_xrdp.execute(['/v:10.0.0.9'], ctx([win([rdpPort])]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se puede encontrar');
  });

  it('debe nombrar a xrdp (no a mstsc) cuando el puerto 3389 está cerrado', () => {
    const m = win([{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'SMB' }]);
    const r = cmd_xrdp.execute(['/v:192.168.60.10'], ctx([m]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('xrdp:');
    expect(r.output).not.toContain('mstsc');
  });

  it('debe autenticar one-shot con credenciales conocidas y emitir desktopAction', () => {
    const m = win([rdpPort], { Administrator: 'P@ssw0rd123!' });
    const r = cmd_xrdp.execute(
      ['/v:192.168.60.10', '/u:Administrator', '/p:P@ssw0rd123!'],
      ctx([m]),
    );
    expect(r.isError).toBeUndefined();
    expect(r.desktopAction).toEqual({
      action: 'connect', machineId: 'win-01', ip: '192.168.60.10',
    });
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc).toMatchObject({
      machineId: 'win-01', user: 'Administrator', pass: 'P@ssw0rd123!',
    });
  });

  it('debe rechazar el one-shot con password incorrecta', () => {
    const m = win([rdpPort], { Administrator: 'P@ssw0rd123!' });
    const r = cmd_xrdp.execute(
      ['/v:192.168.60.10', '/u:Administrator', '/p:mala'],
      ctx([m]),
    );
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
    expect(r.desktopAction).toBeUndefined();
  });

  it('debe abrir la sesión interactiva RDP desde Linux', () => {
    const r = cmd_xrdp.execute(['/v:192.168.60.10'], ctx([win([rdpPort])]));
    expect(isShellSessionActive('test-xrdp')).toBe(true);
    expect(getCurrentShellName('test-xrdp')).toBe('rdp');
    expect(r.output).toContain('Conectando a 192.168.60.10:3389');
  });

  it('la sesión interactiva nombra a xrdp si el puerto RDP se cierra', () => {
    const c = ctx([win([rdpPort])]);
    cmd_xrdp.execute(['/v:192.168.60.10'], c);
    expect(isShellSessionActive('test-xrdp')).toBe(true);

    (c.allMachines[0] as Machine).scan_results.ports = [];
    const r = executeShellCommand('x', c);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('xrdp:');
    expect(r.output).not.toContain('mstsc');
  });

  it('debe dar Command not found en una máquina Windows', () => {
    const m = win([rdpPort]);
    const r = cmd_xrdp.execute(['/v:192.168.60.10'], winCtx(m));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found: xrdp');
    expect(isShellSessionActive('test-xrdp')).toBe(false);
  });
});
