// ── laboratorios/__tests__/laboratorio03.test.ts ─────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Regresión del lab EternalBlue: el target es Windows y el FS usa paths /C:/.

import { describe, it, expect } from 'vitest';
import { scenario_03, SCENARIO_TEMPLATES_ETERNAL } from '../laboratorio03';

const cfg = SCENARIO_TEMPLATES_ETERNAL.eternalBlue();
const targetOf = () => scenario_03.machines.find(m => m.id === cfg.targetMachine.id)!;

describe('Laboratorio 03 - EternalBlue MS17-010', () => {
  it('debe exportar datos del escenario', () => {
    expect(cfg.id).toBe('scenario-03');
    expect(cfg.name).toContain('EternalBlue');
    expect(cfg.tagline).toContain('MS17-010');
    expect(cfg.accentColor).toBe('#f87171');
    expect(cfg.networkRange).toBe('172.16.0.0/24');
  });

  it('debe declarar el target como Windows (family + win)', () => {
    expect(cfg.targetMachine.machine_info.os).toContain('Windows 7');
    expect(cfg.targetMachine.machine_info.type).toBe('workstation');
    expect(targetOf().machine_info.family).toBe('windows');
    expect(targetOf().win).toEqual({
      currentUser: 'Administrator',
      isAdmin: true,
      computerName: 'WIN7-TARGET',
    });
  });

  it('debe tener FS base de Windows y la flag en path /C:/ válido', () => {
    const target = targetOf();
    expect(target.files.some(f => f.path === '/C:/.dir')).toBe(true);
    expect(target.files.some(f => f.path === '/C:/Windows/System32/config/SAM')).toBe(true);

    const flag = target.files.find(f => f.path === '/C:/Users/Administrator/Desktop/flag.txt');
    expect(flag).toBeDefined();
    expect(flag?.content).toBe('ZIL{ETERNALBLUE_SYSTEM_PWNED}');
    expect(flag?.owner).toBe('Administrator');
  });

  it('no debe dejar paths Windows con backslash literal', () => {
    const bogus = targetOf().files.filter(f => f.path.includes('\\'));
    expect(bogus).toHaveLength(0);
  });

  it('debe tener SMB abierto y 5 learning steps con criteria', () => {
    const target = targetOf();
    expect(target.scan_results.ports.some(p => p.port === 445 && p.state === 'open')).toBe(true);
    expect(scenario_03.missions).toHaveLength(5);

    const types = scenario_03.missions.map(m => m.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'vulnerabilityFound',
      'exploit',
      'uidChecked',
    ]);
    expect(scenario_03.missions[4].validationCriteria?.isSystem).toBe(true);
  });

  it('scenario_03 construido: attacker + target en la misma red', () => {
    const attacker = scenario_03.machines.find(m => m.id === 'attacker-01');
    const target = targetOf();
    expect(attacker).toBeDefined();
    expect(attacker?.machine_info.ip).toMatch(/^172\.16\.0\./);
    expect(target.machine_info.ip).toMatch(/^172\.16\.0\./);
    expect(scenario_03.network_range).toBe('172.16.0.0/24');
  });

  it('hints en ambos idiomas en cada step', () => {
    for (const step of cfg.learningSteps) {
      expect(step.hints?.hint1?.en).toBeDefined();
      expect(step.hints?.hint1?.es).toBeDefined();
      expect(step.hints?.hint2?.en).toBeDefined();
      expect(step.hints?.hint2?.es).toBeDefined();
    }
  });
});
