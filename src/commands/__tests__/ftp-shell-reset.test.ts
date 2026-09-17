// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
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

    executeCommand({ line: `ftp ${t.machine_info.ip}`, machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    executeCommand({ line: 'ftpuser', machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    let r = executeCommand({ line: 'ftp_dump_2024', machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);

    // reset workspace sin quit previo
    useScenarioStore.getState().resetWorkspace();

    // el ftp <ip> debe abrir sesión nueva (no ?Invalid command)
    r = executeCommand({ line: `ftp ${t.machine_info.ip}`, machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    expect(r.output).not.toContain('?Invalid command');
    expect('ftpSession' in r && r.ftpSession?.active).toBe(true);

    executeCommand({ line: 'ftpuser', machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    r = executeCommand({ line: 'ftp_dump_2024', machine: attacker, allMachines: machines, currentMissionId: 6, currentDir: '/root' });
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);
  });
});
