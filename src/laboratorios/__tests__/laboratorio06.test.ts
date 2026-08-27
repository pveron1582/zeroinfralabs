import { describe, it, expect } from 'vitest';
import { scenario_06, scenario06Data } from '../laboratorio06';

describe('Laboratorio 06 - SQL Injection & Database Exfiltration', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario06Data).toBeDefined();
    expect(scenario06Data.id).toBe('scenario-06');
    expect(scenario06Data.name).toBe('SQL Injection & Database Exfiltration');
    expect(scenario06Data.tagline).toContain('SQL');
    expect(scenario06Data.taglineEs).toContain('SQL');
    expect(scenario06Data.accentColor).toBe('#f59e0b');
  });

  it('debe tener credenciales correctas', () => {
    expect(scenario06Data.credentials.database).toEqual({ user: 'root', pass: 'SQLr00t@2024!' });
    expect(scenario06Data.credentials.ftp).toEqual({ user: 'ftpuser', pass: 'ftp_dump_2024' });
    expect(scenario06Data.credentials.sqlInjection.payload).toBe("' OR '1'='1");
  });

  it('debe tener flags definidas', () => {
    expect(scenario06Data.flags.user).toBe('ZIL{SQL_INJECTION_FOUND}');
    expect(scenario06Data.flags.root).toBe('ZIL{DATABASE_COMPROMISED}');
  });

  it('debe tener rango de red correcto', () => {
    expect(scenario06Data.networkRange).toBe('192.168.40.0/24');
  });

  it('debe tener targetMachine con info correcta', () => {
    expect(scenario06Data.targetMachine.machine_info.hostname).toBe('sql-injection-web');
    expect(scenario06Data.targetMachine.machine_info.os).toBe('Ubuntu 18.04 LTS');
    expect(scenario06Data.targetMachine.machine_info.type).toBe('server');
  });

  it('debe tener puertos FTP, HTTP y MySQL abiertos', () => {
    const ports = scenario06Data.targetMachine.ports;
    expect(ports).toHaveLength(3);
    expect(ports[0].service).toBe('ftp');
    expect(ports[0].port).toBe(21);
    expect(ports[1].service).toBe('http');
    expect(ports[1].port).toBe(80);
    expect(ports[2].service).toBe('mysql');
    expect(ports[2].port).toBe(3306);
  });

  it('debe tener directorios web configurados', () => {
    const dirs = scenario06Data.targetMachine.web_enumeration.directories;
    expect(dirs.length).toBeGreaterThanOrEqual(4);
    expect(dirs.some(d => d.path === '/login')).toBe(true);
    expect(dirs.some(d => d.path === '/backup')).toBe(true);
  });

  it('debe inyectar las credenciales FTP en el puerto 21 vía portCredentials (P1-10)', () => {
    const target = scenario_06.machines.find(m => m.id === 'lab-scenario-06-sqli');
    const ftpPort = target?.scan_results.ports.find(p => p.service === 'ftp');
    expect(ftpPort?.credentials).toEqual({ user: 'ftpuser', pass: 'ftp_dump_2024' });
  });

  it('debe tener 8 learning steps', () => {
    expect(scenario06Data.learningSteps).toHaveLength(8);
    expect(scenario06Data.learningSteps[0].task).toBe('Network Discovery');
    expect(scenario06Data.learningSteps[7].task).toBe('Capture Flag');
  });

  it('debe tener hints en ambos idiomas', () => {
    const step = scenario06Data.learningSteps[0];
    expect(step.hints?.hint1?.en).toBeDefined();
    expect(step.hints?.hint1?.es).toBeDefined();
    expect(step.hints?.hint2?.en).toBeDefined();
    expect(step.hints?.hint2?.es).toBeDefined();
  });

  it('debe tener validationCriteria en cada step', () => {
    const types = scenario06Data.learningSteps.map(s => s.validationCriteria?.type);
    expect(types).toEqual([
      'discoveredHosts',
      'scanResults',
      'vulnerabilityFound',
      'vulnerabilityFound',
      'foundCredentials',
      'ftpLogin',
      'fileDownloaded',
      'fileRead',
    ]);
  });

  it('pasos 3 y 4 deben distinguir detección de explotación por status', () => {
    expect(scenario06Data.learningSteps[2].validationCriteria?.vulnId).toBe('SQLi');
    expect(scenario06Data.learningSteps[2].validationCriteria?.status).toBe('detected');
    expect(scenario06Data.learningSteps[3].validationCriteria?.vulnId).toBe('SQLi');
    expect(scenario06Data.learningSteps[3].validationCriteria?.status).toBe('confirmed');
  });

  it('scenario_06 debe estar construido correctamente', () => {
    expect(scenario_06).toBeDefined();
    expect(scenario_06.id).toBe('scenario-06');
    expect(scenario_06.difficulty).toBe('Medium');
    expect(scenario_06.category).toBe('Web');
    expect(scenario_06.network_range).toBe('192.168.40.0/24');
    expect(scenario_06.missions).toHaveLength(8);
  });

  it('escenario construido debe tener attacker y target', () => {
    const attacker = scenario_06.machines.find(m => m.id === 'attacker-01');
    const target = scenario_06.machines.find(m => m.id === scenario06Data.targetMachine.id);
    expect(attacker).toBeDefined();
    expect(target).toBeDefined();
    expect(target?.scan_results.ports.some(p => p.port === 21)).toBe(true);
    expect(target?.files.some(f => f.path === '/srv/ftp/database_dump.sql')).toBe(true);
    expect(target?.files.some(f => f.path === '/var/www/html/index.php')).toBe(true);
  });
});
