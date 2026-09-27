// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { scenario_08, scenario08Data } from '../laboratorio08';

describe('Laboratorio 08 - EternalBlue + cmd.exe', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario08Data).toBeDefined();
    expect(scenario08Data.id).toBe('scenario-08');
    expect(scenario08Data.name).toBe('EternalBlue + cmd.exe');
    expect(scenario08Data.tagline).toContain('EternalBlue');
    expect(scenario08Data.taglineEs).toContain('EternalBlue');
    expect(scenario08Data.accentColor).toBe('#f87171');
  });

  it('debe tener tools de W4', () => {
    expect(scenario08Data.tools).toContain('arp-scan');
    expect(scenario08Data.tools).toContain('nmap');
    expect(scenario08Data.tools).toContain('metasploit');
    expect(scenario08Data.tools).toContain('winpeas');
    expect(scenario08Data.tools).toContain('mstsc');
  });

  it('debe tener rango de red no usado por otros labs', () => {
    expect(scenario08Data.networkRange).toBe('192.168.60.0/24');
  });

  it('debe tener flag admin y credenciales', () => {
    expect(scenario08Data.flags.root).toBe('ZIL{ETERNALBLUE_POTATO_PWNED}');
    expect(scenario08Data.credentials.admin.user).toBe('Administrator');
    expect(scenario08Data.credentials.admin.pass).toBe('P@ssw0rd123!');
  });

  it('debe tener target Windows 7 con familia windows', () => {
    expect(scenario08Data.targetMachine.hostname).toBe('WIN7-LAB');
    expect(scenario08Data.targetMachine.os).toContain('Windows 7');
    expect(scenario08Data.targetMachine.type).toBe('workstation');
  });

  it('debe tener 7 learning steps con validationCriteria', () => {
    expect(scenario08Data.learningSteps).toHaveLength(7);
    const types = scenario08Data.learningSteps.map(s => s.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'vulnerabilityFound',
      'exploit',
      'foundCredentials',
      'privesc',
      'fileRead',
    ]);
  });

  it('misión 2 debe exigir el puerto 445', () => {
    expect(scenario08Data.learningSteps[1].validationCriteria?.port).toBe(445);
  });

  it('misión 3 debe exigir MS17-010', () => {
    expect(scenario08Data.learningSteps[2].validationCriteria?.vulnId).toBe('MS17-010');
  });

  it('misión 5 debe exigir credenciales de Administrator', () => {
    expect(scenario08Data.learningSteps[4].validationCriteria?.user).toBe('Administrator');
  });

  it('misión 7 debe exigir fileRead de flag', () => {
    expect(scenario08Data.learningSteps[6].validationCriteria?.fileType).toBe('flag');
  });

  it('hints en ambos idiomas en cada step', () => {
    for (const step of scenario08Data.learningSteps) {
      expect(step.hints?.hint1?.en).toBeDefined();
      expect(step.hints?.hint1?.es).toBeDefined();
      expect(step.hints?.hint2?.en).toBeDefined();
      expect(step.hints?.hint2?.es).toBeDefined();
    }
  });

  it('scenario_08 construido: attacker + target windows', () => {
    expect(scenario_08.id).toBe('scenario-08');
    expect(scenario_08.difficulty).toBe('Medium');
    expect(scenario_08.category).toBe('Network');
    expect(scenario_08.network_range).toBe('192.168.60.0/24');
    expect(scenario_08.missions).toHaveLength(7);

    const attacker = scenario_08.machines.find(m => m.id === 'attacker-01');
    const target = scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id);
    expect(attacker).toBeDefined();
    expect(target).toBeDefined();
    expect(target?.machine_info.family).toBe('windows');
    expect(target?.machine_info.ip).toMatch(/^192\.168\.60\./);
    expect(attacker?.machine_info.ip).toMatch(/^192\.168\.60\./);
  });

  it('target: identidad win7user baja y SMB abierto', () => {
    const target = scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id)!;
    expect(target.win).toEqual({ currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' });
    expect(target.scan_results.ports.some(p => p.port === 445)).toBe(true);
    expect(target.scan_results.ports.some(p => p.state === 'open')).toBe(true);
  });

  it('target: flag admin 0600 y Desktop win7user NO es flag', () => {
    const target = scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id)!;
    const adminFlag = target.files.find(f => f.path === '/C:/Users/Administrator/flag.txt');
    expect(adminFlag).toBeDefined();
    expect(adminFlag?.content).toBe('ZIL{ETERNALBLUE_POTATO_PWNED}');

    expect(adminFlag?.owner).toBe('Administrator');
    expect(adminFlag?.mode).toBe(0o600);

    const userDesktop = target.files.find(f => f.path === '/C:/Users/win7user/Desktop/flag.txt');
    expect(userDesktop).toBeDefined();
    expect(userDesktop?.content).not.toMatch(/ZIL\{|THM\{|FLAG\{/);
    expect(userDesktop?.owner).toBe('win7user');
  });

  it('target: notes.txt del usuario contiene credenciales admin (para winPEAS)', () => {
    const target = scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id)!;
    const notes = target.files.find(f => f.path === '/C:/Users/win7user/Documents/notes.txt');
    expect(notes).toBeDefined();
    expect(notes?.content).toContain('Administrator');
    expect(notes?.content).toContain('P@ssw0rd123!');
    expect(notes?.owner).toBe('win7user');
  });

  it('target: dedupe de files prioriza el override del Desktop flag', () => {
    const target = scenario_08.machines.find(m => m.id === scenario08Data.targetMachine.id)!;
    const desktopFlags = target.files.filter(f => f.path === '/C:/Users/win7user/Desktop/flag.txt');
    expect(desktopFlags).toHaveLength(1);
    expect(desktopFlags[0].content).not.toContain('THM{USER_ACCESS_GRANTED}');
  });
});
