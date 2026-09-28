// ── commands/__tests__/happyPath-scenario08.test.ts ────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Flujo completo del Lab 08 (webmail SquirrelMail → xrdp → potato),
// misión a misión: recon → webmail → scanner → exploit → nota → RDP →
// mala configuración → escalada → flag.

import { describe, it, expect } from 'vitest';
import { scenario_08, scenario08Data } from '../../laboratorios/laboratorio08';
import { useScenarioStore } from '../../store/scenarioStore';
import { executeCommand, resetMsfState } from '../index';
import { validateMission } from '../../utils/labValidator';
import { setupBeforeEach } from './happyPathHelpers';
import type { CommandResponse } from '../../types';

setupBeforeEach();

const machines = () => scenario_08.machines;
const attacker = () => machines().find(m => m.id.includes('attacker'))!;
const target = () => machines().find(m => m.id === scenario08Data.targetMachine.id)!;

function setActiveMission(missionId: number) {
  useScenarioStore.setState({
    missions: scenario_08.missions.map(m => ({
      ...m,
      status: m.id === missionId ? ('active' as const) : ('pending' as const),
    })),
    currentMissionId: missionId,
  });
}

function active() {
  return useScenarioStore.getState().missions.find(m => m.status === 'active')!;
}

function completeActive() {
  useScenarioStore.getState().completeMission(active().id);
}

/** Comando en el atacante (Kali). */
const onAttacker = (line: string): CommandResponse =>
  executeCommand({
    line, machine: attacker(), allMachines: machines(),
    currentMissionId: active().id, currentDir: '/root',
  });

/** Comando en la víctima Windows, como el usuario local (helpdesk). */
const runOnTarget = (line: string, machine = target()): CommandResponse =>
  executeCommand({
    line, machine, allMachines: machines(),
    currentMissionId: active().id, currentDir: '/C:/Users/helpdesk',
  });

describe('Happy Path: Scenario 08 (webmail SquirrelMail → xrdp → potato)', () => {
  it('misión 1: arp-scan descubre hosts', () => {
    useScenarioStore.setState({ missions: scenario_08.missions, currentMissionId: 1 });
    const r = onAttacker(`arp-scan ${scenario08Data.networkRange}`);
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(2);
  });

  it('misión 2: nmap encuentra 443/tcp (el webmail)', () => {
    setActiveMission(2);
    const r = onAttacker(`nmap -sV ${target().machine_info.ip}`);
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(3);
  });

  it('misión 3:CyberBrowser abre el webmail del objetivo', () => {
    setActiveMission(3);
    // El FakeBrowser emite esta metadata al navegar (no hay DOM en node).
    const browser: CommandResponse = {
      output: '',
      browserAction: {
        action: 'viewPage',
        url: `http://${target().machine_info.ip}/webmail`,
        machineId: target().id,
      },
    };
    expect(validateMission(browser, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(4);
  });

  it('misiones 4+5: aux squirrelmail_version → exploit CVE-2017-7692 abre sesión', () => {
    // Van en el mismo test porque setupBeforeEach resetea el store (y con
    // él msfState) entre tests: el exploit exige el `auxChecked` del scanner.
    setActiveMission(4);
    resetMsfState();
    onAttacker('msfconsole');
    onAttacker('use auxiliary/scanner/http/squirrelmail_version');
    onAttacker(`set RHOSTS ${target().machine_info.ip}`);
    const aux = onAttacker('run');
    expect(aux.output).toContain('SquirrelMail 1.4.22');
    expect(validateMission(aux, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(5);

    onAttacker('back');
    onAttacker('use exploit/multi/http/squirrelmail_cgi_rce');
    onAttacker(`set RHOSTS ${target().machine_info.ip}`);
    const r = onAttacker('exploit');
    expect(r.output).toContain('svc_webmail');
    expect(validateMission(r, active())).toBe(true);
    expect('newMachineId' in r ? r.newMachineId : undefined).toBe(target().id);

    // La sesión NO es SYSTEM: el alumno todavía necesita escalar.
    const st = useScenarioStore.getState().msfState;
    expect(st?.sessionUser).toBe('svc_webmail');
    expect(st?.sessionTargetId).toBe(target().id);
    resetMsfState();
    completeActive();
    expect(active().id).toBe(6);
  });

  it('misión 6: la nota del webmail tiene la clave de helpdesk', () => {
    setActiveMission(6);
    const r = runOnTarget('type C:\\inetpub\\webmail\\attachments\\nota.txt');
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain(scenario08Data.credentials.helpdesk.pass);
    expect(validateMission(r, active())).toBe(true);
    expect('fileRead' in r && r.fileRead?.isNote).toBe(true);
    completeActive();
    expect(active().id).toBe(7);
  });

  it('misión 7: xrdp con esas credenciales abre el escritorio remoto', () => {
    setActiveMission(7);
    const { user, pass } = scenario08Data.credentials.helpdesk;
    const r = onAttacker(`xrdp /v:${target().machine_info.ip} /u:${user} /p:${pass}`);
    expect(r.isError).not.toBe(true);
    expect(validateMission(r, active())).toBe(true);
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc?.service).toBe('rdp');
    expect(fc?.user).toBe(user);
    expect('desktopAction' in r && r.desktopAction?.action).toBe('connect');
    completeActive();
    expect(active().id).toBe(8);
  });

  it('misión 8: leer la config del servicio en C:\\Users\\Public', () => {
    setActiveMission(8);
    const r = runOnTarget('type C:\\Users\\Public\\svc-backup\\svc-backup.ini');
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('LocalSystem');
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(9);
  });

  it('misión 9: potato escala a administrador (privescCompleted)', () => {
    setActiveMission(9);
    const r = runOnTarget('potato');
    expect(validateMission(r, active())).toBe(true);
    expect('privescCompleted' in r ? r.privescCompleted : undefined).toBe(target().id);
    completeActive();
    expect(active().id).toBe(10);
  });

  it('misión 10: type de la flag admin (gated por permisos)', () => {
    setActiveMission(10);

    // Sin privesc: 0600 Administrator → acceso denegado para helpdesk.
    const denied = runOnTarget('type C:\\Users\\Administrator\\flag.txt');
    expect(denied.isError).toBe(true);
    expect(denied.output).toContain('Acceso denegado');
    expect(validateMission(denied, active())).toBe(false);

    // Con privesc_completed (como processCommandResult tras potato): uid 0.
    const elevated = { ...target(), privesc_completed: true };
    const r = runOnTarget('type C:\\Users\\Administrator\\flag.txt', elevated);
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe(scenario08Data.flags.root);
    expect(validateMission(r, active())).toBe(true);
  });

  it('la nota de credenciales NO completa la misión de la config del servicio', () => {
    setActiveMission(8);
    const r = runOnTarget('type C:\\inetpub\\webmail\\attachments\\nota.txt');
    expect('fileRead' in r && r.fileRead?.isNote).toBe(true);
    expect(validateMission(r, active())).toBe(false);
  });
});
