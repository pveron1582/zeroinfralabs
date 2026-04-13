// ── commands/__tests__/happyPath-scenario04.test.ts ───────────────
// Happy path tests for Scenario 04: LFI to RCE

import { describe, it, expect } from 'vitest';
import { createAttacker, exec, evolveState, expectSuccess, withLevel, setupBeforeEach } from './happyPathHelpers';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Happy Path: Scenario 04 - LFI to RCE', () => {
  const attacker = createAttacker();
  const lfiTarget: Machine = {
    id: 'lab-scenario-04-lfi',
    machine_info: {
      hostname: 'dev-portal-backup',
      ip: '192.168.20.11',
      mac: '08:00:27:D6:E7:F8',
      os: 'Debian 11 (Bullseye)',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.4p1 Debian' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache/2.4.52 (Debian)' },
      ],
    },
    web_enumeration: {
      web_server: 'Apache/2.4.52',
      cms: 'Custom PHP Portal',
      directories: [
        { path: '/', status: 200, description: 'Página principal' },
        { path: '/upload.php', status: 200, description: 'Subida de archivos' },
      ],
    },
    learning_steps: [
      { id: 1, task: 'Reconocimiento', text: 'arp-scan', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo', text: 'nmap -sV', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 2 },
      { id: 3, task: 'LFI Discovery', text: 'Probar ?page=../../../../etc/passwd', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 3 },
      { id: 4, task: 'Setup Listener', text: 'nc -nlvp 4444', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 3 },
      { id: 5, task: 'Preparar Payload', text: 'Subir payload.php', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 3 },
      { id: 6, task: 'Remote Code Execution', text: '?page=uploads/payload.php', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 4 },
    ],
    files: [
      { path: '/var/www/html/flag.txt', content: 'THM{LFI_REVERSE_SHELL_PWNED}', type: 'text' },
    ],
  };

  const allMachines = [attacker, lfiTarget];

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.20.0/24', attacker, allMachines, 1);
    expectSuccess(result);
    expect(result.output).toContain('192.168.20.11');
    // arp-scan ya no completa misiones - es un comando libre
    expect(result.discoveredHosts).toBeDefined();
    expect(result.discoveredHosts?.some(h => h.ip === '192.168.20.11')).toBe(true);
  });

  it('Paso 2: nmap detecta HTTP en puerto 80', () => {
    const target = withLevel(lfiTarget, 1);
    const result = exec('nmap -sV 192.168.20.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.output).toContain('80/tcp');
    // nmap ya no completa misiones - es un comando libre
    expect(result.scanResults).toBeDefined();
    expect(result.scanResults?.ports.some(p => p.port === 80)).toBe(true);
  });

  it('Paso 4: nc -nlvp activa listener — valida propiedades de blockingCommand', () => {
    const result = exec('nc -nlvp 4444', attacker, allMachines, 4);
    expectSuccess(result);
    // nc ya no completa misiones - es un comando libre
    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.listeningPort).toBe(4444);
  });

  it('nc fuera del contexto LFI no completa ninguna misión', () => {
    const result = exec('nc -nlvp 9999', attacker, [attacker], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBeUndefined();
  });

  it('nc sin puerto debe fallar', () => {
    const result = exec('nc -nlvp', attacker, allMachines, 4);
    expect(result.isError).toBe(true);
    expect(result.blockingCommand).toBeUndefined();
  });

  it('nmap sin reconocimiento previo debe fallar', () => {
    const result = exec('nmap -sV 192.168.20.11', attacker, allMachines, 2);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
  });

  it('Golden path: arp-scan → nmap → nc listener (estado evoluciona naturalmente)', () => {
    let machines: Machine[] = [attacker, lfiTarget];

    let result = exec('arp-scan 192.168.20.0/24', attacker, machines, 1);
    // arp-scan ya no completa misiones
    expect(result.discoveredHosts).toBeDefined();
    machines = evolveState(machines, result);

    result = exec('nmap -sV 192.168.20.11', attacker, machines, 2);
    // nmap ya no completa misiones
    expect(result.scanResults?.ports.some(p => p.port === 80)).toBe(true);
    machines = evolveState(machines, result);

    result = exec('nc -nlvp 4444', attacker, machines, 4);
    // nc ya no completa misiones
    expect(result.blockingCommand?.listeningPort).toBe(4444);
  });
});
