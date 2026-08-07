import { describe, it, expect } from 'vitest';
import { scenario_06 } from '../../laboratorios/laboratorio06';
import { executeCommand, resetShellSessions } from '../index';
import { useScenarioStore } from '../../store/scenarioStore';

describe('repro: sesion FTP se limpia al resetear workspace', () => {
  it('tras resetWorkspace el ftp <ip> vuelve a conectar y loguear', () => {
    resetShellSessions();
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const t = machines.find(m => !m.id.includes('attacker'))!;

    let r = executeCommand(`ftp ${t.machine_info.ip}`, attacker, machines, 6, undefined, '/root');
    r = executeCommand('ftpuser', attacker, machines, 6, undefined, '/root');
    r = executeCommand('ftp_dump_2024', attacker, machines, 6, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);

    // reset workspace sin quit previo
    useScenarioStore.getState().resetWorkspace();

    // el ftp <ip> debe abrir sesión nueva (no ?Invalid command)
    r = executeCommand(`ftp ${t.machine_info.ip}`, attacker, machines, 6, undefined, '/root');
    expect(r.output).not.toContain('?Invalid command');
    expect('ftpSession' in r && r.ftpSession?.active).toBe(true);

    r = executeCommand('ftpuser', attacker, machines, 6, undefined, '/root');
    r = executeCommand('ftp_dump_2024', attacker, machines, 6, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);
  });
});
