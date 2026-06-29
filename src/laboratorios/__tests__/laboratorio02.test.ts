import { describe, it, expect } from 'vitest';
import { scenario_02, scenario02Data } from '../laboratorio02';

describe('Laboratorio 02 - Web OSINT & SSH Compromise', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario02Data).toBeDefined();
    expect(scenario02Data.id).toBe('scenario-02');
    expect(scenario02Data.name).toBe('Web OSINT & SSH Compromise');
    expect(scenario02Data.tagline).toContain('OSINT');
    expect(scenario02Data.taglineEs).toContain('OSINT');
    expect(scenario02Data.accentColor).toBe('#fbbf24');
  });

  it('debe tener credenciales correctas', () => {
    expect(scenario02Data.credentials).toEqual({
      user: 'gonzalo',
      pass: 'casablanca',
    });
  });

  it('debe tener flags definidas', () => {
    expect(scenario02Data.flags.user).toBe('ZIL{SSH_USER_ACCESS_GRANTED}');
    expect(scenario02Data.flags.root).toBe('ZIL{WEB_OSINT_SSH_SUCCESS}');
  });

  it('debe tener rango de red correcto', () => {
    expect(scenario02Data.networkRange).toBe('10.10.10.0/24');
  });

  it('debe tener targetMachine con info correcta', () => {
    expect(scenario02Data.targetMachine.hostname).toBe('ssh-target-lab');
    expect(scenario02Data.targetMachine.os).toBe('Ubuntu 22.04 LTS');
    expect(scenario02Data.targetMachine.type).toBe('server');
  });

  it('debe tener puertos SSH y HTTP abiertos', () => {
    const ports = scenario02Data.targetMachine.ports;
    expect(ports).toHaveLength(2);
    expect(ports[0].service).toBe('ssh');
    expect(ports[0].port).toBe(22);
    expect(ports[1].service).toBe('http');
    expect(ports[1].port).toBe(80);
  });

  it('debe tener directorio web raíz configurado', () => {
    const dirs = scenario02Data.targetMachine.directories;
    expect(dirs).toHaveLength(1);
    expect(dirs[0].path).toBe('/');
    expect(dirs[0].status).toBe(200);
  });

  it('debe tener 6 learning steps', () => {
    expect(scenario02Data.learningSteps).toHaveLength(6);

    expect(scenario02Data.learningSteps[0].task).toBe('Network Reconnaissance');
    expect(scenario02Data.learningSteps[0].discoveryLevel).toBe(1);

    expect(scenario02Data.learningSteps[5].task).toBe('Capture User Flag');
    expect(scenario02Data.learningSteps[5].discoveryLevel).toBe(3);
  });

  it('debe tener hints en ambos idiomas', () => {
    const step = scenario02Data.learningSteps[0];
    expect(step.hints?.hint1?.en).toBeDefined();
    expect(step.hints?.hint1?.es).toBeDefined();
    expect(step.hints?.hint2?.en).toBeDefined();
    expect(step.hints?.hint2?.es).toBeDefined();
  });

  it('debe tener validationCriteria en cada step', () => {
    const types = scenario02Data.learningSteps.map(s => s.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'custom',
      'foundCredentials',
      'sshLogin',
      'fileRead',
    ]);
  });

  it('scenario_02 debe estar construido correctamente', () => {
    expect(scenario_02).toBeDefined();
    expect(scenario_02.id).toBe('scenario-02');
    expect(scenario_02.machines).toBeDefined();
    expect(scenario_02.machines.length).toBeGreaterThan(0);
  });

  it('escenario construido debe tener attacker y target', () => {
    const attacker = scenario_02.machines.find(m => m.id === 'attacker-01');
    expect(attacker).toBeDefined();

    const target = scenario_02.machines.find(m => m.id === 'lab-scenario-02-ssh');
    expect(target).toBeDefined();
    expect(target?.machine_info.hostname).toBe('ssh-target-lab');
  });

  it('target debe tener credenciales SSH en el puerto', () => {
    const target = scenario_02.machines.find(m => m.id === 'lab-scenario-02-ssh');
    const sshPort = target?.scan_results.ports.find(p => p.service === 'ssh');
    expect(sshPort?.credentials).toEqual({
      user: 'gonzalo',
      pass: 'casablanca',
    });
  });

  it('target debe tener flag de usuario en /home/gonzalo/', () => {
    const target = scenario_02.machines.find(m => m.id === 'lab-scenario-02-ssh');
    const flag = target?.files.find(f => f.path === '/home/gonzalo/flag.txt');
    expect(flag).toBeDefined();
    expect(flag?.content).toBe('ZIL{SSH_USER_ACCESS_GRANTED}');
  });
});
