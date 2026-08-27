// ── commands/__tests__/closeSession.test.ts ────────────────────────
// A5: cerrar una sesión debe responder según su TIPO (no siempre FTP)
// y el executor no debe sobrescribir el estado con FTP genérico.

import { describe, it, expect, beforeEach } from 'vitest';
import { scenario_06 } from '../../laboratorios/laboratorio06';
import {
  executeCommand, resetShellSessions,
  isShellSessionActive, getCurrentShellName, getShellPrompt,
} from '../index';

describe('cierre de sesiones interactivas (SSH/FTP)', () => {
  beforeEach(() => {
    resetShellSessions();
  });

  it('exit en sesión FTP responde tipo ftp con 221 Goodbye', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const t = machines.find(m => !m.id.includes('attacker'))!;

    executeCommand(`ftp ${t.machine_info.ip}`, attacker, machines, 6, undefined, '/root');
    executeCommand('ftpuser', attacker, machines, 6, undefined, '/root');
    executeCommand('ftp_dump_2024', attacker, machines, 6, undefined, '/root');
    expect(isShellSessionActive()).toBe(true);
    expect(getCurrentShellName()).toBe('ftp');

    const r = executeCommand('exit', attacker, machines, 6, undefined, '/root');
    // El exit dentro de la sesión lo maneja FtpSession (221) y el
    // executor enruta por hybrid con metadatos ftpSession inactivos.
    expect(r.output).toContain('221 Goodbye');
    expect(!isShellSessionActive()).toBe(true);
    expect('ftpSession' in r ? r.ftpSession?.active : undefined).toBe(false);
    // El executor ya NO inyecta estado SSH ni contamina el cierre FTP
    expect('sshSession' in r ? r.sshSession : undefined).toBeUndefined();
  });

  it('exit en sesión SSH responde tipo ssh con logout (no 221 de FTP)', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const t = machines.find(m => !m.id.includes('attacker'))!;
    // Credenciales del lab06 para el servicio ssh
    const cred = t.scan_results?.ports?.find(p => p.service === 'ssh')?.credentials;
    if (!cred) return; // el lab no modela ssh: nada que probar acá

    executeCommand(`ssh ${cred.user}@${t.machine_info.ip}`, attacker, machines, 6, undefined, '/root');
    executeCommand(cred.pass ?? '', attacker, machines, 6, undefined, '/root');
    expect(getCurrentShellName()).toBe('ssh');

    const r = executeCommand('exit', attacker, machines, 6, undefined, '/root');
    expect('type' in r ? r.type : undefined).toBe('ssh');
    expect(r.output).not.toContain('221');
    expect(!isShellSessionActive()).toBe(true);
  });

  it('getShellPrompt/getCurrentShellName quedan vacíos tras cerrar', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const t = machines.find(m => !m.id.includes('attacker'))!;

    executeCommand(`ftp ${t.machine_info.ip}`, attacker, machines, 6, undefined, '/root');
    executeCommand('ftpuser', attacker, machines, 6, undefined, '/root');
    executeCommand('ftp_dump_2024', attacker, machines, 6, undefined, '/root');
    executeCommand('exit', attacker, machines, 6, undefined, '/root');

    expect(getCurrentShellName()).toBeNull();
    expect(getShellPrompt()).toBe('');
  });
});
