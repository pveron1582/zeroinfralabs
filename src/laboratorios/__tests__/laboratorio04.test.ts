// ── laboratorios/__tests__/laboratorio04.test.ts ─────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Scenario 4 — LFI to RCE. Los invariantes GENERALES de `known_passwords`
// (/etc/passwd, sin kali, home de cada usuario) ya los cubre
// credentials-by-machine.test.ts: acá va lo específico de este lab —
// payload PHP con placeholders resueltos, escaneo, flag y los criteria
// fileRead/ncListener/blockingCommand que sólo existen acá.

import { describe, it, expect } from 'vitest';
import { scenario_04, SCENARIO_TEMPLATES_LFI } from '../laboratorio04';
import type { Machine } from '../../types';

const cfg = SCENARIO_TEMPLATES_LFI.lfiRce();
const targetOf = (): Machine => scenario_04.machines.find(m => m.id === cfg.targetMachine.id)!;
const attackerOf = (): Machine => scenario_04.machines.find(m => m.id === 'attacker-01')!;

describe('Laboratorio 04 - LFI to RCE', () => {
  it('debe exportar datos del escenario', () => {
    expect(cfg.id).toBe('scenario-04');
    expect(cfg.name).toBe('LFI to RCE Lab');
    expect(cfg.accentColor).toBe('#a78bfa');
    expect(cfg.networkRange).toBe('192.168.20.0/24');
    expect(cfg.difficulty).toBe('Medium');
    expect(cfg.category).toBe('Web');
    expect(cfg.tools).toEqual(['burpsuite', 'curl', 'php-filters']);
    expect(cfg.taglineEs).toContain('LFI');
    expect(scenario_04.id).toBe('scenario-04');
    expect(scenario_04.network_range).toBe('192.168.20.0/24');
    expect(scenario_04.initialMachineId).toBe('attacker-01');
  });

  it('debe montar el target como servidor Debian con http y ssh', () => {
    const target = targetOf();
    expect(target.machine_info.hostname).toBe('dev-portal-backup');
    expect(target.machine_info.os).toContain('Debian 11');
    expect(target.machine_info.type).toBe('server');
    expect(target.scan_results.ports.map(p => p.port).sort((a, b) => a - b)).toEqual([22, 80]);
    expect(target.scan_results.ports.every(p => p.state === 'open')).toBe(true);
    expect(target.web_enumeration.web_server).toBe('Apache/2.4.52');
    expect(target.web_enumeration.cms).toBe('Custom PHP Portal');
  });

  it('debe dejar en el atacante el payload y el escaneo (regresión: sin /root/notas.txt)', () => {
    const attacker = attackerOf();
    const paths = attacker.files.map(f => f.path);
    expect(paths).toContain('/root/payload.php');
    expect(paths).toContain('/root/escaneo.txt');
    expect(paths).not.toContain('/root/notas.txt');

    const payload = attacker.files.find(f => f.path === '/root/payload.php')!;
    expect(payload.content).toContain('fsockopen');
    expect(payload.content).toContain('4444');
    expect(payload.content).toContain(attacker.machine_info.ip);
    // Los placeholders tienen que resolverse: si quedan literales, la
    // reverse shell se sube apuntando a "ATTACKER_IP".
    expect(payload.content).not.toContain('ATTACKER_IP');
    expect(payload.content).not.toContain('LISTENER_PORT');
  });

  it('el escaneo guardado coincide con el target', () => {
    const scan = attackerOf().files.find(f => f.path === '/root/escaneo.txt')!;
    expect(scan.content).toContain('dev-portal-backup');
    expect(scan.content).toContain('22/tcp open  ssh     OpenSSH 8.4p1 Debian');
    expect(scan.content).toContain('80/tcp open  http    Apache/2.4.52 (Debian)');
  });

  it('debe poner la flag del lab en /var/www/html/flag.txt', () => {
    const flag = targetOf().files.find(f => f.path === '/var/www/html/flag.txt');
    expect(flag?.content).toBe('ZIL{LFI_REVERSE_SHELL_PWNED}');
    expect(flag?.owner).toBe('root');
    // La flag no puede estar copiada en la máquina atacante.
    expect(attackerOf().files.some(f => f.content.includes('ZIL{LFI_REVERSE_SHELL_PWNED}'))).toBe(false);
  });

  it('la tabla de passwords del target es root + lucia + ivan', () => {
    expect(targetOf().known_passwords).toEqual({
      root: 'D3bi@nR00t#2024',
      lucia: 'welcome1',
      ivan: 'superman',
    });
    const passwd = targetOf().files.find(f => f.path === '/etc/passwd')?.content ?? '';
    expect(passwd).toContain('lucia');
    expect(passwd).toContain('ivan');
    expect(passwd).not.toContain('kali');
  });

  it('7 pasos con los criteria LFI → RCE', () => {
    expect(cfg.learningSteps).toHaveLength(7);
    expect(cfg.learningSteps.map(s => s.validationCriteria.type)).toEqual([
      'discoveredHosts',
      'scanResults',
      'vulnerabilityFound',
      'fileRead',
      'ncListener',
      'blockingCommand',
      'fileRead',
    ]);
    expect(cfg.learningSteps[2].validationCriteria).toEqual({
      type: 'vulnerabilityFound', vulnId: 'LFI', status: 'detected',
    });
    expect(cfg.learningSteps[3].validationCriteria).toEqual({ type: 'fileRead', fileType: 'payload' });
    expect(cfg.learningSteps[6].validationCriteria).toEqual({ type: 'fileRead', fileType: 'flag' });
    // Nivel de descubrimiento: recon 1, escaneo 2, el resto 3.
    expect(cfg.learningSteps.map(s => s.discoveryLevel)).toEqual([1, 2, 3, 3, 3, 3, 3]);
  });

  it('todos los pasos traen texto e hints en ES y EN', () => {
    for (const step of cfg.learningSteps) {
      expect(step.taskEs).toBeTruthy();
      expect(step.textEs).toBeTruthy();
      expect(step.hints.hint1.en.length).toBeGreaterThan(0);
      expect(step.hints.hint1.es.length).toBeGreaterThan(0);
      expect(step.hints.hint2.en.length).toBeGreaterThan(0);
      expect(step.hints.hint2.es.length).toBeGreaterThan(0);
    }
  });

  it('el escenario construido mapea los 7 pasos a misiones del target', () => {
    expect(scenario_04.missions).toHaveLength(7);
    expect(scenario_04.missions.map(m => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(scenario_04.missions.every(m => m.targetMachineId === cfg.targetMachine.id)).toBe(true);
    expect(scenario_04.missions[0].status).toBe('active');
    expect(scenario_04.missions.slice(1).every(m => m.status === 'pending')).toBe(true);

    const steps = targetOf().learning_steps;
    expect(steps).toHaveLength(7);
    expect(steps.map(s => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(steps.every(s => s.targetMachineId === cfg.targetMachine.id)).toBe(true);
  });

  it('el FS no deja backslashes en ningún path', () => {
    for (const m of scenario_04.machines) {
      expect(m.files.filter(f => f.path.includes('\\'))).toHaveLength(0);
    }
  });
});
