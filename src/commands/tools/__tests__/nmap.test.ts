// ── commands/tools/__tests__/nmap.test.ts ────────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_nmap } from '../nmap';
import type { Machine } from '../../../types';

describe('cmd_nmap', () => {
  const createMockMachine = (id: string, ip: string, discoveryLevel: number = 0): Machine => ({
    id,
    machine_info: { hostname: 'target', ip, mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
        { port: 443, protocol: 'tcp', state: 'filtered', service: 'https', version: '' },
      ]
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento', text: 'arp-scan', targetMachineId: id, discoveryLevel: 1 },
      { id: 2, task: 'Escaneo', text: 'nmap', targetMachineId: id, discoveryLevel: 2 },
    ],
    files: [],
  });

  // ── Basic validation ──

  it('debe requerir una IP', () => {
    const result = cmd_nmap.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Usage:');
  });

  it('debe requerir reconocimiento previo (discovery_level >= 1)', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 0)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Primero realiza el reconocimiento');
  });

  it('debe escanear puertos si hay reconocimiento previo', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report');
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('OpenSSH');
    expect(result.output).toContain('Apache');
  });

  it('debe mostrar versiones con -sV', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('VERSION');
    expect(result.output).toContain('OpenSSH 8.2');
  });

  it('debe fallar si IP no existe', () => {
    const result = cmd_nmap.execute(['-sV', '192.168.1.99'], {
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Failed to resolve');
  });

  // ── Scan types ──

  it('-sS debe mostrar SYN Stealth Scan', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sS', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('SYN Stealth Scan');
    expect(result.output).toContain('22/tcp');
  });

  it('-sn debe hacer solo ping scan sin puertos', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sn', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Host is up');
    expect(result.output).not.toContain('PORT');
    expect(result.output).toContain('Nmap done');
  });

  it('-sP debe ser equivalente a -sn', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sP', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Host is up');
    expect(result.output).not.toContain('PORT');
  });

  it('-Pn debe saltar el check de discovery', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 0)];
    const result = cmd_nmap.execute(['-Pn', '-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('skipping host discovery');
    expect(result.output).toContain('22/tcp');
  });

  it('-O debe mostrar deteccion de SO', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-O', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('OS details');
    expect(result.output).toContain('Ubuntu');
  });

  // ── Verbosity ──

  it('-v debe mostrar MAC Address y timing', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-v', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('MAC Address');
    expect(result.output).toContain('Initiating');
  });

  it('-vv debe mostrar puertos cerrados (Not shown)', () => {
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
          { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
          { port: 443, protocol: 'tcp', state: 'filtered', service: 'https', version: '' },
          { port: 21, protocol: 'tcp', state: 'closed', service: 'ftp', version: '' },
          { port: 23, protocol: 'tcp', state: 'closed', service: 'telnet', version: '' },
          { port: 25, protocol: 'tcp', state: 'closed', service: 'smtp', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [
        { id: 1, task: 'Reconocimiento', text: 'arp-scan', targetMachineId: 'target-01', discoveryLevel: 1 },
        { id: 2, task: 'Escaneo', text: 'nmap', targetMachineId: 'target-01', discoveryLevel: 2 },
      ],
      files: [],
    };
    const result = cmd_nmap.execute(['-sV', '-vv', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Not shown');
  });

  it('-vvv debe mostrar info de paquetes raw simulados', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-vvv', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('SENT');
    expect(result.output).toContain('RCVD');
  });

  // ── Port specification ──

  it('-p 22,80 debe escanear solo esos puertos', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-p', '22,80', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).not.toContain('443/tcp');
  });

  it('-p 22 debe escanear solo el puerto 22', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-p22', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).not.toContain('80/tcp');
  });

  it('-p 1-100 debe incluir puertos en rango', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-p', '1-100', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
  });

  it('-p- debe escanear todos los puertos', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-p-', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('443/tcp');
  });

  it('-p con puerto cerrado debe mostrarlo como closed', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-p', '22,9999', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('9999/tcp');
    expect(result.output).toContain('closed');
  });

  // ── Output files ──

  it('-oN debe crear archivo con output normal', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const attacker: Machine = {
      id: 'attacker',
      machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali', status: 'up', type: 'workstation' },
      discovery_level: 1,
      scan_results: { ports: [] },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    const result = cmd_nmap.execute(['-sV', '-oN', 'scan.txt', '192.168.1.10'], {
      allMachines: [attacker, ...machines],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report');
  });

  it('-oG debe crear archivo en formato grepable', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const attacker: Machine = {
      id: 'attacker',
      machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali', status: 'up', type: 'workstation' },
      discovery_level: 1,
      scan_results: { ports: [] },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    const result = cmd_nmap.execute(['-sV', '-oG', 'scan.gnmap', '192.168.1.10'], {
      allMachines: [attacker, ...machines],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report');
  });

  // ── Combinations ──

  it('-sS -v -p 22,80 debe combinar flags correctamente', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sS', '-v', '-p', '22,80', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('SYN Stealth Scan');
    expect(result.output).toContain('MAC Address');
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
  });

  it('-sV -vv -O debe combinar version, verbose y OS detection', () => {
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
          { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
          { port: 443, protocol: 'tcp', state: 'filtered', service: 'https', version: '' },
          { port: 21, protocol: 'tcp', state: 'closed', service: 'ftp', version: '' },
          { port: 23, protocol: 'tcp', state: 'closed', service: 'telnet', version: '' },
          { port: 25, protocol: 'tcp', state: 'closed', service: 'smtp', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [
        { id: 1, task: 'Reconocimiento', text: 'arp-scan', targetMachineId: 'target-01', discoveryLevel: 1 },
        { id: 2, task: 'Escaneo', text: 'nmap', targetMachineId: 'target-01', discoveryLevel: 2 },
      ],
      files: [],
    };
    const result = cmd_nmap.execute(['-sV', '-vv', '-O', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('VERSION');
    expect(result.output).toContain('Not shown');
    expect(result.output).toContain('OS details');
  });

  // ── Help ──

  it('--help debe mostrar ayuda', () => {
    const result = cmd_nmap.execute(['--help'], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap 7.92');
    expect(result.output).toContain('SCAN TYPES');
    expect(result.output).toContain('-sS');
    expect(result.output).toContain('-sV');
    expect(result.output).toContain('-sn');
    expect(result.output).toContain('-Pn');
    expect(result.output).toContain('-oN');
    expect(result.output).toContain('-oG');
    expect(result.output).toContain('-v');
    expect(result.output).toContain('-vv');
    expect(result.output).toContain('-vvv');
    expect(result.output).toContain('-O');
    expect(result.output).toContain('-A');
    expect(result.output).toContain('EXAMPLES');
  });

  it('-h debe mostrar ayuda', () => {
    const result = cmd_nmap.execute(['-h'], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap 7.92');
  });
});
