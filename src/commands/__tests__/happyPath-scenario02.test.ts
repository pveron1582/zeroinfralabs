// ── commands/__tests__/happyPath-scenario02.test.ts ───────────────
// Happy path tests for Scenario 02: SSH Brute Force Lab

import { describe, it, expect } from 'vitest';
import { createAttacker, exec, evolveState, expectSuccess, withLevel, setupBeforeEach } from './happyPathHelpers';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Happy Path: Scenario 02 - SSH Brute Force', () => {
  const attacker = createAttacker();
  const sshTarget: Machine = {
    id: 'lab-scenario-02-ssh',
    machine_info: {
      hostname: 'ssh-target-lab',
      ip: '10.10.10.10',
      mac: '08:00:27:B2:C3:D4',
      os: 'Ubuntu 22.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu', credentials: { user: 'gonzalo', pass: 'Quier0unaument0' } },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache/2.4.41' },
      ],
    },
    web_enumeration: { web_server: 'Apache/2.4.41', cms: 'none', directories: [{ path: '/', status: 200, description: 'Consultancy Site' }] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'arp-scan', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'nmap -sV', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 2 },
      { id: 3, task: 'Reconocimiento Web', text: 'Acceder al sitio web', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3 },
      { id: 4, task: 'Fuerza bruta SSH', text: 'hydra', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3 },
      { id: 5, task: 'Acceso por SSH', text: 'ssh gonzalo@ip', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 4 },
    ],
    files: [{ path: '/home/gonzalo/user.txt', content: 'THM{SSH_USER_ACCESS_GRANTED}', type: 'text' }],
    possible_ssh_users: ['pedro', 'gonzalo', 'arturo', 'lucia'],
  };

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 10.10.10.0/24', attacker, [attacker, sshTarget], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    expect(result.output).toContain('10.10.10.10');
  });

  it('Paso 2: nmap detecta puerto 22 SSH y 80 HTTP', () => {
    const target = withLevel(sshTarget, 1);
    const result = exec('nmap -sV 10.10.10.10', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
  });

  it('Paso 4: hydra encuentra credenciales de gonzalo', () => {
    const target = { ...withLevel(sshTarget, 3), possible_ssh_users: ['gonzalo'] };
    const result = exec('hydra -l gonzalo -P /usr/share/wordlists/rockyou.txt 10.10.10.10 ssh', attacker, [attacker, target], 4);
    expectSuccess(result);
    expect(result.foundCredentials).toBeDefined();
    expect(result.foundCredentials?.user).toBe('gonzalo');
    expect(result.foundCredentials?.pass).toBe('Quier0unaument0');
    expect(result.completedMissionId).toBe(4);
  });

  it('Paso 5: ssh conecta con gonzalo', () => {
    const target = withLevel(sshTarget, 3);
    const result = exec('ssh gonzalo@10.10.10.10 Quier0unaument0', attacker, [attacker, target], 5);
    expectSuccess(result);
    expect(result.newMachineId).toBe('lab-scenario-02-ssh');
    expect(result.completedMissionId).toBe(5);
  });

  it('Golden path: arp-scan → nmap → hydra → ssh (con gonzalo)', () => {
    let machines: Machine[] = [attacker, sshTarget];

    let result = exec('arp-scan 10.10.10.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    result = exec('nmap -sV 10.10.10.10', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    machines = machines.map(m => m.id === 'lab-scenario-02-ssh' ? { ...m, discovery_level: 3 } : m);

    result = exec('hydra -l gonzalo -P /usr/share/wordlists/rockyou.txt 10.10.10.10 ssh', attacker, machines, 4);
    expect(result.completedMissionId).toBe(4);
    expect(result.foundCredentials?.user).toBe('gonzalo');
    expect(result.foundCredentials?.pass).toBe('Quier0unaument0');
    machines = evolveState(machines, result);

    result = exec('ssh gonzalo@10.10.10.10 Quier0unaument0', attacker, machines, 5);
    expect(result.completedMissionId).toBe(5);
    expect(result.newMachineId).toBe('lab-scenario-02-ssh');
  });
});
