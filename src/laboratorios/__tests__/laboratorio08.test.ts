// ── laboratorios/__tests__/laboratorio08.test.ts ───────────────────
// Lab 08: webmail SquirrelMail → exploit CVE-2017-7692 → shell del
// servicio → nota con credenciales → xrdp → PowerShell → potato → flag.

import { describe, it, expect } from 'vitest';
import { scenario_08, scenario08Data } from '../laboratorio08';
import { validateMission } from '../../utils/labValidator';
import type { CommandResponse } from '../../types';

const target = () => scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id)!;

describe('laboratorio08 (webmail → xrdp → potato)', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario08Data.id).toBe('scenario-08');
    expect(scenario08Data.name).toBeTruthy();
    expect(scenario08Data.tools).toContain('xrdp');
    expect(scenario08Data.tools).toContain('potato');
  });

  it('debe tener rango de red no usado por otros labs', () => {
    expect(scenario_08.network_range).toBe('192.168.60.0/24');
  });

  it('debe tener flag de administrador y credenciales de helpdesk', () => {
    expect(scenario08Data.flags.root).toMatch(/^ZIL\{/);
    expect(scenario08Data.credentials.helpdesk.user).toBe('helpdesk');
    expect(scenario08Data.credentials.helpdesk.pass).toBeTruthy();
  });

  it('debe tener target Windows Server con RDP y webmail', () => {
    expect(scenario08Data.targetMachine.os).toContain('Windows Server');
    const t = target();
    expect(t.machine_info.family).toBe('windows');
    expect(t.machine_info.ip).toMatch(/^192\.168\.60\./);
    expect(t.scan_results.ports.some(p => p.port === 3389 && p.state === 'open')).toBe(true);
    expect(t.scan_results.ports.some(p => p.port === 443 && p.state === 'open')).toBe(true);
  });

  it('debe declarar el CMS squirrelmail (lo leen el browser y el scanner MSF)', () => {
    expect(target().web_enumeration?.cms).toBe('squirrelmail');
    expect(target().web_enumeration?.web_server).toBe('apache');
  });

  it('debe tener 10 learning steps con validationCriteria', () => {
    expect(scenario08Data.learningSteps).toHaveLength(10);
    const types = scenario08Data.learningSteps.map(s => s.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'browserAction',
      'vulnerabilityFound',
      'exploit',
      'fileRead',
      'foundCredentials',
      'fileRead',
      'privesc',
      'fileRead',
    ]);
  });

  it('hints en ambos idiomas en cada step', () => {
    for (const step of scenario08Data.learningSteps) {
      expect(step.hints.hint1.en).toBeTruthy();
      expect(step.hints.hint1.es).toBeTruthy();
      expect(step.hints.hint2.en).toBeTruthy();
      expect(step.hints.hint2.es).toBeTruthy();
    }
  });

  it('scenario_08 construido: attacker + target windows', () => {
    expect(scenario_08.id).toBe('scenario-08');
    expect(scenario_08.difficulty).toBe('Medium');
    expect(scenario_08.category).toBe('Web');
    expect(scenario_08.missions).toHaveLength(10);
    expect(scenario_08.machines.find(m => m.id === 'attacker-01')).toBeDefined();
  });

  it('target: identidad helpdesk de baja privilegio y RDP con credenciales', () => {
    const t = target();
    expect(t.win).toEqual({ currentUser: 'helpdesk', isAdmin: false, computerName: 'WEBMAIL-SRV' });
    const rdp = t.scan_results.ports.find(p => p.port === 3389);
    expect(rdp?.credentials).toEqual(scenario08Data.credentials.helpdesk);
    expect(t.known_passwords?.helpdesk).toBe(scenario08Data.credentials.helpdesk.pass);
  });

  it('target: la nota del webmail tiene la clave de helpdesk y es legible', () => {
    const note = target().files.find(f => f.path === '/C:/inetpub/webmail/attachments/nota.txt');
    expect(note).toBeDefined();
    expect(note?.content).toContain('helpdesk');
    expect(note?.content).toContain(scenario08Data.credentials.helpdesk.pass);
    // Legible por el usuario del escritorio (0644), no 0600.
    expect(note?.mode).toBe(0o644);
  });

  it('target: el servicio de backup corre como LocalSystem desde carpeta escribible', () => {
    const t = target();
    const dir = t.files.find(f => f.path === '/C:/Users/Public/svc-backup/.dir');
    const ini = t.files.find(f => f.path === '/C:/Users/Public/svc-backup/svc-backup.ini');
    expect(dir?.mode).toBe(0o777);
    expect(dir?.owner).toBe('Users');
    expect(ini?.content).toContain('ObjectName=LocalSystem');
    expect(ini?.content).toContain('C:\\Users\\Public\\svc-backup');
    // helpdesk no es admin: sin potato no llega a la flag.
    expect(t.win?.isAdmin).toBe(false);
  });

  it('target: flag de administrador 0600 (helpdesk no la puede leer)', () => {
    const flag = target().files.find(f => f.path === '/C:/Users/Administrator/flag.txt');
    expect(flag?.content).toBe(scenario08Data.flags.root);
    expect(flag?.owner).toBe('Administrator');
    expect(flag?.mode).toBe(0o600);
  });

  it('misión de la config del backup exige leer DENTRO de esa carpeta', () => {
    const step = scenario08Data.learningSteps.find(s => s.task === 'Find the Misconfigured Service')!;
    expect(step.validationCriteria).toMatchObject({
      type: 'fileRead',
      path: 'C:\\Users\\Public\\svc-backup',
    });

    // La nota (otro path) NO completa esa misión: el criterio `path` es
    // lo que hace precisa la misión de "leé la config del servicio".
    const mission = { ...scenario_08.missions[7], validationCriteria: step.validationCriteria };
    const read = (path: string): CommandResponse => ({
      output: '',
      fileRead: { path, machineId: 'm1', isNote: false, isFlag: false, isPayload: false, content: '' },
    });

    expect(validateMission(read('/C:/inetpub/webmail/attachments/nota.txt'), mission)).toBe(false);
    expect(validateMission(read('/C:/Users/Public/svc-backup/svc-backup.ini'), mission)).toBe(true);
  });

  it('misión de la nota exige fileRead de tipo note', () => {
    const step = scenario08Data.learningSteps.find(s => s.task === 'Read the Webmail Attachment Note')!;
    expect(step.validationCriteria).toEqual({ type: 'fileRead', fileType: 'note' });
  });

  it('misión del RDP exige credenciales del servicio rdp para helpdesk', () => {
    const step = scenario08Data.learningSteps.find(s => s.task === 'RDP Session with xrdp')!;
    expect(step.validationCriteria).toEqual({
      type: 'foundCredentials',
      user: 'helpdesk',
      service: 'rdp',
    });
  });
});
