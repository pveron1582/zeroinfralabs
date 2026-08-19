import { describe, it, expect } from 'vitest';
import { scenario_07, scenario07Data } from '../laboratorio07';

describe('Laboratorio 07 - Burp Suite: Web Application Pentesting', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario07Data).toBeDefined();
    expect(scenario07Data.id).toBe('scenario-07');
    expect(scenario07Data.name).toBe('Burp Suite: Web Application Pentesting');
    expect(scenario07Data.tagline).toContain('Burp');
    expect(scenario07Data.taglineEs).toContain('Burp');
    expect(scenario07Data.accentColor).toBe('#f97316');
  });

  it('debe tener credenciales de BD configuradas', () => {
    expect(scenario07Data.credentials.database).toEqual({ user: 'root', pass: 'BurpSQLi@2024!' });
  });

  it('debe tener flags definidas', () => {
    expect(scenario07Data.flags.user).toBe('ZIL{BURP_REPEATER_MASTER}');
    expect(scenario07Data.flags.root).toBe('ZIL{INTERCEPT_AND_EXPLOIT}');
  });

  it('debe tener rango de red correcto', () => {
    expect(scenario07Data.networkRange).toBe('192.168.50.0/24');
  });

  it('debe tener tools que incluyen burpsuite', () => {
    expect(scenario07Data.tools).toContain('burpsuite');
    expect(scenario07Data.tools).toContain('nmap');
    expect(scenario07Data.tools).toContain('arp-scan');
  });

  it('debe tener targetMachine con info correcta', () => {
    expect(scenario07Data.targetMachine.hostname).toBe('casinoveo-web');
    expect(scenario07Data.targetMachine.os).toBe('Ubuntu 20.04 LTS');
    expect(scenario07Data.targetMachine.type).toBe('server');
    expect(scenario07Data.targetMachine.application).toContain('CasinoVeo');
  });

  it('debe tener puertos HTTP y MySQL', () => {
    const ports = scenario07Data.targetMachine.ports;
    expect(ports.length).toBeGreaterThanOrEqual(2);
    expect(ports.some(p => p.service === 'http' && p.port === 80)).toBe(true);
    expect(ports.some(p => p.service === 'mysql')).toBe(true);
  });

  it('debe tener directorios web con /login vulnerable', () => {
    const dirs = scenario07Data.targetMachine.directories;
    expect(dirs.some(d => d.path === '/login')).toBe(true);
    expect(dirs.find(d => d.path === '/login')?.description).toContain('VULNERABLE');
  });

  it('debe tener 8 learning steps', () => {
    expect(scenario07Data.learningSteps).toHaveLength(8);
  });

  it('debe tener hints en ambos idiomas', () => {
    const step = scenario07Data.learningSteps[0];
    expect(step.hints?.hint1?.en).toBeDefined();
    expect(step.hints?.hint1?.es).toBeDefined();
  });

  it('debe tener validationCriteria en cada step', () => {
    const types = scenario07Data.learningSteps.map(s => s.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'browserAction',
      'vulnerabilityFound',
      'vulnerabilityFound',
      'httpRequest',
      'foundCredentials',
      'fileRead',
    ]);
  });

  it('steps 4 y 5 deben validar SQLi detected/confirmed (primero en el navegador)', () => {
    expect(scenario07Data.learningSteps[3].validationCriteria?.vulnId).toBe('SQLi');
    expect(scenario07Data.learningSteps[3].validationCriteria?.status).toBe('detected');
    expect(scenario07Data.learningSteps[4].validationCriteria?.status).toBe('confirmed');
  });

  it('la misión 3 debe requerir visitar el sitio en el navegador', () => {
    const m3 = scenario07Data.learningSteps[2];
    expect(m3.validationCriteria?.type).toBe('browserAction');
    expect(m3.validationCriteria?.url).toBe('/login');
  });

  it('la misión 6 (Burp) debe validar la request POST a /login', () => {
    const m6 = scenario07Data.learningSteps[5];
    expect(m6.validationCriteria?.type).toBe('httpRequest');
    expect(m6.validationCriteria?.url).toBe('/login');
  });

  it('la misión 1 no debe prescribir una herramienta específica (orienta al objetivo)', () => {
    const m1 = scenario07Data.learningSteps[0];
    expect(m1.textEs).not.toMatch(/usando|usá/i);
    expect(m1.hints?.hint1.es).toMatch(/revisá tu propia IP|subred/i);
  });

  it('el target declara flags para el volcado UNION', () => {
    const target = scenario_07.machines.find(m => m.id === scenario07Data.targetMachine.id);
    expect(target?.flags).toEqual(scenario07Data.flags);
  });

  it('scenario_07 debe estar construido correctamente', () => {
    expect(scenario_07).toBeDefined();
    expect(scenario_07.id).toBe('scenario-07');
    expect(scenario_07.difficulty).toBe('Medium');
    expect(scenario_07.category).toBe('Web');
    expect(scenario_07.network_range).toBe('192.168.50.0/24');
    expect(scenario_07.missions).toHaveLength(8);
  });

  it('escenario construido debe tener attacker y target', () => {
    const attacker = scenario_07.machines.find(m => m.id === 'attacker-01');
    const target = scenario_07.machines.find(m => m.id === scenario07Data.targetMachine.id);
    expect(attacker).toBeDefined();
    expect(target).toBeDefined();
    expect(target?.scan_results.ports.some(p => p.port === 80)).toBe(true);
    expect(target?.files.some(f => f.path === '/var/www/html/index.php')).toBe(true);
    expect(target?.files.some(f => f.path === '/var/www/html/config.php')).toBe(true);
  });
});
