// ── commands/__tests__/happyPath-scenario07-flow.test.ts ─────────────
// Flujo completo del Lab 07 (Burp Suite) validado misión a misión.
// Misiones 1-2 por terminal (executeCommand); misiones 3-5 por el navegador
// (CasinoVeo: visita + SQLi manual); misiones 6-8 por Burp Suite, simulando
// los CommandResponse que emiten CasinoVeoSite y BurpSuite.

import { describe, it, expect } from 'vitest';
import { scenario_07, scenario07Data } from '../../laboratorios/laboratorio07';
import { scenario_06 } from '../../laboratorios/laboratorio06';
import { useScenarioStore } from '../../store/scenarioStore';
import { executeCommand } from '../index';
import { validateMission } from '../../utils/labValidator';
import { buildSyntheticResponse } from '../../frameworks/http/response';
import { setupBeforeEach } from './happyPathHelpers';
import type { CommandResponse, Machine } from '../../types';

setupBeforeEach();

// Marca una misión como activa en el store (resetea el resto a pending).
function setActiveMission(missionId: number) {
  useScenarioStore.setState({
    missions: scenario_07.missions.map(m => ({
      ...m,
      status: m.id === missionId ? ('active' as const) : ('pending' as const),
    })),
    currentMissionId: missionId,
  });
}

// Emula el CommandResponse 'http' que CasinoVeoSite/BurpSuite construyen
// al enviar una transacción HTTP contra el target.
function httpTx(target: Machine, req: { method: string; url: string; body?: string }): CommandResponse {
  return {
    output: '',
    type: 'http',
    httpRequest: { method: req.method, url: req.url, headers: { Host: target.machine_info.ip }, body: req.body ?? '' },
    httpResponse: { status: 200, statusText: 'OK', headers: {}, body: '' },
    foundVulnerability: undefined,
    foundCredentials: undefined,
    fileRead: undefined,
  };
}

// Emula el POST /login del formulario del navegador (CasinoVeoSite):
// mismo motor HTTP que Burp, con la metadata resultante adjunta.
function browserLogin(target: Machine, username: string) {
  const synth = buildSyntheticResponse(target, 'POST', '/login', `username=${encodeURIComponent(username)}&password=x`);
  return {
    output: synth.body,
    type: 'http' as const,
    httpRequest: { method: 'POST', url: `http://${target.machine_info.ip}/login`, headers: { Host: target.machine_info.ip }, body: `username=${username}&password=x` },
    httpResponse: { status: synth.status, statusText: synth.statusText, headers: {}, body: synth.body },
    foundVulnerability: synth.foundVulnerability,
    foundCredentials: synth.foundCredentials,
    fileRead: synth.fileRead,
  } satisfies CommandResponse;
}

describe('Happy Path: Scenario 07 (Burp Suite) - flujo completo', () => {
  it('misiones 1 y 2 se validan por terminal (descubrimiento + scan)', () => {
    const machines = scenario_07.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;

    useScenarioStore.setState({ missions: scenario_07.missions, currentMissionId: 1 });
    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;
    const completeActive = () => useScenarioStore.getState().completeMission(active().id);

    // Misión 1: descubrir hosts (cualquier herramienta sirve, ej. arp-scan)
    let r = executeCommand(`arp-scan ${scenario07Data.networkRange}`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(2);

    // Misión 2: escaneo de puertos del objetivo
    r = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, machines, active().id, undefined, '/root');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(3);
  });

  it('misión 3: visitar el sitio en el navegador (browserAction)', () => {
    setActiveMission(3);
    const mission3 = useScenarioStore.getState().missions.find(m => m.id === 3)!;

    // browserAction NO se valida por metadata: FakeBrowser la completa
    // directamente al navegar a la IP del target (onMissionComplete(3)).
    expect(validateMission({ output: '' }, mission3)).toBe(false);

    // Simula la navegación del FakeBrowser a http://<ip>/login
    useScenarioStore.getState().completeMission(3);
    expect(useScenarioStore.getState().missions.find(m => m.status === 'active')!.id).toBe(4);
  });

  it('misiones 4 y 5: SQLi probado primero en el navegador (CasinoVeo)', () => {
    const target = scenario_07.machines.find(m => !m.id.includes('attacker'))!;

    setActiveMission(4);
    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;
    const completeActive = () => useScenarioStore.getState().completeMission(active().id);

    // Misión 4: comilla simple en el formulario → 500 + SQLi detected
    const r4 = browserLogin(target, "admin'");
    expect(r4.httpResponse!.status).toBe(500);
    expect(r4.httpResponse!.body).toContain('SQL syntax');
    expect(r4.foundVulnerability?.status).toBe('detected');
    expect(validateMission(r4, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(5);

    // Misión 5: tautología ' OR '1'='1 → bypass + SQLi confirmed
    const r5 = browserLogin(target, "' OR '1'='1");
    expect(r5.httpResponse!.status).toBe(200);
    expect(r5.httpResponse!.body).toContain('Render desbloqueado');
    expect(r5.foundVulnerability?.status).toBe('confirmed');
    expect(validateMission(r5, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(6);
  });

  it('misión 6: interceptar la request con Burp Suite (Proxy)', () => {
    const target = scenario_07.machines.find(m => !m.id.includes('attacker'))!;

    setActiveMission(6);
    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;

    // Misión 6: request POST /login capturada por el Proxy
    const r6 = httpTx(target, { method: 'POST', url: `http://${target.machine_info.ip}/login`, body: 'username=admin&password=x' });
    expect(validateMission(r6, active())).toBe(true);
    useScenarioStore.getState().completeMission(active().id);
    expect(useScenarioStore.getState().missions.find(m => m.status === 'active')!.id).toBe(7);

    // Una request a otra URL NO valida la misión 6
    const rNoLogin = httpTx(target, { method: 'GET', url: `http://${target.machine_info.ip}/admin` });
    const mission6 = scenario_07.missions.find(m => m.id === 6)!;
    expect(validateMission(rNoLogin, mission6)).toBe(false);
  });

  it('misiones 7 y 8: UNION en Repeater expone credenciales MySQL y la flag root', () => {
    const target = scenario_07.machines.find(m => !m.id.includes('attacker'))!;

    setActiveMission(7);
    const active = () => useScenarioStore.getState().missions.find(m => m.status === 'active')!;

    const union = buildSyntheticResponse(target, 'POST', '/login', "username=' UNION SELECT * FROM users--&password=x");

    // Misión 7: creds MySQL root — debe ser la password declarada en el lab 07
    expect(union.foundCredentials?.user).toBe('root');
    expect(union.foundCredentials?.pass).toBe(scenario07Data.credentials.database.pass);
    const r7: CommandResponse = {
      output: union.body, type: 'http',
      httpRequest: { method: 'POST', url: `http://${target.machine_info.ip}/login`, headers: {}, body: "username=' UNION SELECT * FROM users--&password=x" },
      httpResponse: { status: union.status, statusText: union.statusText, headers: {}, body: union.body },
      foundCredentials: union.foundCredentials,
    };
    expect(validateMission(r7, active())).toBe(true);
    useScenarioStore.getState().completeMission(active().id);
    expect(useScenarioStore.getState().missions.find(m => m.status === 'active')!.id).toBe(8);

    // Misión 8: la flag root está en el volcado y emite fileRead.isFlag
    expect(union.body).toContain(scenario07Data.flags.root);
    expect(union.fileRead?.isFlag).toBe(true);
    expect(union.fileRead?.content).toBe(scenario07Data.flags.root);
    const mission8 = useScenarioStore.getState().missions.find(m => m.status === 'active')!;
    const r8: CommandResponse = {
      output: union.body, type: 'http',
      httpRequest: { method: 'POST', url: `http://${target.machine_info.ip}/login`, headers: {}, body: "username=' UNION SELECT * FROM users--&password=x" },
      httpResponse: { status: union.status, statusText: union.statusText, headers: {}, body: union.body },
      fileRead: union.fileRead,
    };
    expect(validateMission(r8, mission8)).toBe(true);
  });

  it('el UNION del lab 07 NO muestra credenciales ajenas (ni ftpuser, ni dump FTP)', () => {
    const target = scenario_07.machines.find(m => !m.id.includes('attacker'))!;
    const union = buildSyntheticResponse(target, 'POST', '/login', "username=' UNION SELECT * FROM users--&password=x");
    expect(union.body).not.toContain('ftpuser / ftp_dump_2024');
    expect(union.body).not.toContain('SQLr00t@2024!');
    expect(union.body).toContain(scenario07Data.credentials.database.pass);
  });

  it('el UNION del lab 06 sigue mostrando sus credenciales y el dump FTP', () => {
    const target = scenario_06.machines.find((m: Machine) => !m.id.includes('attacker'))!;
    const union = buildSyntheticResponse(target, 'POST', '/login', "username=' UNION SELECT * FROM users--&password=x");
    expect(union.body).toContain('root / SQLr00t@2024!');
    expect(union.body).toContain('ftpuser / ftp_dump_2024');
    expect(union.body).toContain('/srv/ftp/database_dump.sql');
  });

  it('el navegador y Burp emiten la misma metadata para los mismos payloads (CasinoVeo)', () => {
    const target = scenario_07.machines.find(m => !m.id.includes('attacker'))!;
    // Mismo payload vía navegador (CasinoVeoSite) y vía engine directo (Burp):
    // ambas rutas usan buildSyntheticResponse, así que la metadata es idéntica.
    const viaBrowser = browserLogin(target, "' OR '1'='1");
    const viaBurp = buildSyntheticResponse(target, 'POST', '/login', "username=' OR '1'='1&password=x");
    expect(viaBrowser.foundVulnerability).toEqual(viaBurp.foundVulnerability);
    expect(viaBrowser.httpResponse!.body).toBe(viaBurp.body);
  });
});
