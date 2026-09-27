// ── commands/__tests__/happyPath-scenario08.test.ts ────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Flujo completo del Lab 08 (EternalBlue + cmd.exe) misión a misión.

import { describe, it, expect } from 'vitest';
import { scenario_08, scenario08Data } from '../../laboratorios/laboratorio08';
import { useScenarioStore } from '../../store/scenarioStore';
import { executeCommand, resetMsfState } from '../index';
import { validateMission } from '../../utils/labValidator';
import { setupBeforeEach } from './happyPathHelpers';

setupBeforeEach();

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

describe('Happy Path: Scenario 08 (EternalBlue + cmd.exe)', () => {
  it('misión 1: arp-scan descubre hosts', () => {
    const machines = scenario_08.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;

    useScenarioStore.setState({ missions: scenario_08.missions, currentMissionId: 1 });
    const r = executeCommand({
      line: `arp-scan ${scenario08Data.networkRange}`,
      machine: attacker, allMachines: machines,
      currentMissionId: active().id, currentDir: '/root',
    });
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(2);
  });

  it('misión 2: nmap encuentra 445/tcp', () => {
    const machines = scenario_08.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;

    setActiveMission(2);
    const r = executeCommand({
      line: `nmap -sV ${target.machine_info.ip}`,
      machine: attacker, allMachines: machines,
      currentMissionId: active().id, currentDir: '/root',
    });
    expect(validateMission(r, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(3);
  });

  it('misiones 3+4: aux MS17-010 → exploit EternalBlue abre sesión (newMachineId)', () => {
    const machines = scenario_08.machines;
    const attacker = machines.find(m => m.id.includes('attacker'))!;
    const target = machines.find(m => !m.id.includes('attacker'))!;

    // setupBeforeEach resetea msfState; auxChecked + sesión van en el mismo flujo.
    setActiveMission(3);
    resetMsfState();
    executeCommand({ line: 'msfconsole', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    executeCommand({ line: 'use auxiliary/scanner/smb/smb_ms17_010', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    executeCommand({ line: `set RHOSTS ${target.machine_info.ip}`, machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    const aux = executeCommand({ line: 'run', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    expect(aux.output).toContain('VULNERABLE');
    expect(validateMission(aux, active())).toBe(true);
    completeActive();
    expect(active().id).toBe(4);

    executeCommand({ line: 'back', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    executeCommand({ line: 'use exploit/windows/smb/ms17_010_eternalblue', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    executeCommand({ line: `set RHOSTS ${target.machine_info.ip}`, machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    executeCommand({ line: `set LHOST ${attacker.machine_info.ip}`, machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    const r = executeCommand({ line: 'exploit', machine: attacker, allMachines: machines, currentMissionId: active().id, currentDir: '/root' });
    expect(r.output).toContain('Meterpreter session');
    expect(validateMission(r, active())).toBe(true);
    const nmid = 'newMachineId' in r ? r.newMachineId : undefined;
    expect(nmid).toBe(scenario08Data.targetMachine.id);
    completeActive();
    expect(active().id).toBe(5);
    resetMsfState();
  });

  it('misión 5: winPEAS encuentra credenciales de Administrator', () => {
    const machines = scenario_08.machines;
    const target = machines.find(m => m.id === scenario08Data.targetMachine.id)!;

    setActiveMission(5);
    const r = executeCommand({
      line: 'winpeas',
      machine: target, allMachines: machines,
      currentMissionId: active().id, currentDir: '/C:/Users/win7user',
    });
    expect(r.output).toContain('winPEAS');
    expect(validateMission(r, active())).toBe(true);
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc?.user).toBe('Administrator');
    completeActive();
    expect(active().id).toBe(6);
  });

  it('misión 6: potato escala a administrador (privescCompleted)', () => {
    const machines = scenario_08.machines;
    const target = machines.find(m => m.id === scenario08Data.targetMachine.id)!;

    setActiveMission(6);
    const r = executeCommand({
      line: 'potato',
      machine: target, allMachines: machines,
      currentMissionId: active().id, currentDir: '/C:/Users/win7user',
    });
    expect(validateMission(r, active())).toBe(true);
    const pc = 'privescCompleted' in r ? r.privescCompleted : undefined;
    expect(pc).toBe(target.id);
    completeActive();
    expect(active().id).toBe(7);
  });

  it('misión 7: type de la flag admin (gated por permisos)', () => {
    const machines = scenario_08.machines;
    const target = machines.find(m => m.id === scenario08Data.targetMachine.id)!;

    setActiveMission(7);

    // Sin privesc: 0600 Administrator → acceso denegado para win7user.
    const denied = executeCommand({
      line: 'type C:\\Users\\Administrator\\flag.txt',
      machine: target, allMachines: machines,
      currentMissionId: active().id, currentDir: '/C:/Users/win7user',
    });
    expect(denied.isError).toBe(true);
    expect(denied.output).toContain('Acceso denegado');
    expect(validateMission(denied, active())).toBe(false);

    // Con privesc_completed (como processCommandResult tras potato): uid 0.
    const elevated = { ...target, privesc_completed: true };
    const r = executeCommand({
      line: 'type C:\\Users\\Administrator\\flag.txt',
      machine: elevated, allMachines: machines.map(m => m.id === target.id ? elevated : m),
      currentMissionId: active().id, currentDir: '/C:/Users/win7user',
    });
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe(scenario08Data.flags.root);
    expect(validateMission(r, active())).toBe(true);
    completeActive();
  });

  it('el Desktop de win7user NO completa la misión de flag', () => {
    const machines = scenario_08.machines;
    const target = machines.find(m => m.id === scenario08Data.targetMachine.id)!;
    const mission7 = scenario_08.missions.find(m => m.id === 7)!;

    const r = executeCommand({
      line: 'type Desktop\\flag.txt',
      machine: target, allMachines: machines,
      currentMissionId: 7, currentDir: '/C:/Users/win7user',
    });
    expect(r.isError).not.toBe(true);
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(false);
    expect(validateMission(r, mission7)).toBe(false);
  });
});
