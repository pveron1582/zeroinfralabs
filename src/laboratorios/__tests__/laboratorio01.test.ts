// ── laboratorios/__tests__/laboratorio01.test.ts ────────────────────
import { describe, it, expect } from 'vitest';
import { scenario_01, scenario01Data } from '../laboratorio01';

describe('Laboratorio 01 - WordPress Vulnerable Lab', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario01Data).toBeDefined();
    expect(scenario01Data.id).toBe('scenario-01');
    expect(scenario01Data.name).toBe('WordPress Vulnerable Lab');
  });

  it('debe tener credenciales correctas', () => {
    expect(scenario01Data.credentials.wpAdmin).toEqual({
      user: 'admin',
      pass: 'P@ssw0rd123!',
    });
    expect(scenario01Data.credentials.ssh).toEqual({
      user: 'root',
      pass: 'R00t@SSH2024!',
    });
  });

  it('debe tener flags definidas', () => {
    expect(scenario01Data.flags.user).toBe('ZIL{USER_WP_GRANTED}');
    expect(scenario01Data.flags.root).toBe('ZIL{ROOT_WP_ACHIEVED}');
  });

  it('debe tener rango de red correcto', () => {
    expect(scenario01Data.networkRange).toBe('192.168.1.0/24');
  });

  it('debe tener targetMachine con info correcta', () => {
    expect(scenario01Data.targetMachine.hostname).toBe('vulnerable-wp-lab');
    expect(scenario01Data.targetMachine.os).toBe('Ubuntu 20.04 LTS');
    expect(scenario01Data.targetMachine.type).toBe('server');
  });

  it('debe tener puertos SSH, HTTP y MySQL', () => {
    const ports = scenario01Data.targetMachine.ports;
    expect(ports).toHaveLength(3);
    expect(ports[0].service).toBe('ssh');
    expect(ports[0].port).toBe(22);
    expect(ports[1].service).toBe('http');
    expect(ports[1].port).toBe(80);
    expect(ports[2].service).toBe('mysql');
    expect(ports[2].port).toBe(3306);
  });

  it('debe tener directorios web configurados', () => {
    const dirs = scenario01Data.targetMachine.directories;
    expect(dirs.some(d => d.path === '/wp-admin')).toBe(true);
    expect(dirs.some(d => d.path === '/uploads')).toBe(true);
    expect(dirs.some(d => d.path === '/backup')).toBe(true);
  });

  it('debe tener 8 learning steps', () => {
    expect(scenario01Data.learningSteps).toHaveLength(8);

    // Verificar primer paso
    expect(scenario01Data.learningSteps[0].task).toBe('Network Reconnaissance');
    expect(scenario01Data.learningSteps[0].discoveryLevel).toBe(1);

    // Verificar último paso
    expect(scenario01Data.learningSteps[7].task).toBe('Capture Root Flag');
    expect(scenario01Data.learningSteps[7].discoveryLevel).toBe(4);
  });

  it('debe tener hints en ambos idiomas', () => {
    const step = scenario01Data.learningSteps[0]; // Network Reconnaissance
    expect(step.hints?.hint1?.en).toBeDefined();
    expect(step.hints?.hint1?.es).toBeDefined();
    expect(step.hints?.hint2?.en).toBeDefined();
    expect(step.hints?.hint2?.es).toBeDefined();
  });

  it('debe tener WordPress 6.0 como CMS', () => {
    expect(scenario01Data.targetMachine.cms).toBe('WordPress 6.0');
    expect(scenario01Data.targetMachine.webServer).toBe('Apache/2.4.41');
  });

  it('scenario_01 debe estar construido correctamente', () => {
    expect(scenario_01).toBeDefined();
    expect(scenario_01.id).toBe('scenario-01');
    expect(scenario_01.machines).toBeDefined();
    expect(scenario_01.machines.length).toBeGreaterThan(0);
  });
});