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

  it('debe funcionar sin reconocimiento previo (comando libre)', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 0)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report');
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

  it('-p con puerto cerrado existente en máquina debe mostrarlo', () => {
    // Crear máquina con puerto 21 closed explícitamente
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:AA:BB:CC', os: 'Ubuntu', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
          { port: 21, protocol: 'tcp', state: 'closed', service: 'ftp', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    const result = cmd_nmap.execute(['-sV', '-p', '22,21', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('21/tcp');
    expect(result.output).toContain('closed');
  });

  it('-p con puerto que no existe en máquina no debe mostrarse', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    // El puerto 9999 no está definido en la máquina, no debe aparecer
    const result = cmd_nmap.execute(['-sV', '-p', '22,9999', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).not.toContain('9999');
  });

  it('-p con sintaxis combinada (puertos individuales + rangos)', () => {
    // Crear máquina con varios puertos
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:AA:BB:CC', os: 'Ubuntu', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
          { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
          { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'Nginx' },
          { port: 3306, protocol: 'tcp', state: 'closed', service: 'mysql', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    // Sintaxis: -p22,80-443,3306 (individual + rango + individual)
    const result = cmd_nmap.execute(['-sV', '-p', '22,80-443,3306', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('443/tcp');
    expect(result.output).toContain('3306/tcp');
  });

  it('debe soportar múltiples flags combinados', () => {
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:AA:BB:CC', os: 'Ubuntu', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
          { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
          { port: 443, protocol: 'tcp', state: 'filtered', service: 'https', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    // Combinación compleja: tipo de escaneo + verbose + OS detection + puertos + --open
    const result = cmd_nmap.execute(['-sV', '-vv', '-O', '-p', '1-1000', '--open', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1
    } as any);

    // Verifica que no hay error
    expect(result.isError).toBeUndefined();
    // Verifica elementos del output verbose
    expect(result.output).toContain('Initiating');
    // Verifica OS detection
    expect(result.output).toContain('OS detection');
    // Solo puertos abiertos (filtrados por --open, 443 es filtered no open)
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).not.toContain('443/tcp');
  });

  it('debe soportar -A (aggressive mode) combinado con -p y -oN', () => {
    const machine: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '08:00:27:AA:BB:CC', os: 'Windows Server 2019', status: 'up', type: 'server' },
      discovery_level: 1,
      scan_results: {
        ports: [
          { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH' },
          { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' },
        ]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [],
    };
    // -A + -p + -oN + --open
    const result = cmd_nmap.execute(['-A', '-p', '22,445', '--open', '-oN', 'scan.txt', '192.168.1.10'], {
      allMachines: [machine],
      currentMissionId: 1,
      currentDir: '/root'
    } as any);

    expect(result.isError).toBeUndefined();
    // Aggressive mode muestra script results
    expect(result.output).toContain('Host script results');
    // Verifica creación de archivo
    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles?.[0]?.path).toBe('/root/scan.txt');
  });

  // ── Output files ──

  it('-oN debe crear archivo en el directorio actual (currentDir)', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oN', 'basic', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/root'
    } as any);

    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles?.length).toBe(1);
    // Debe guardar en /root/basic (sin extensión .txt por defecto)
    expect(result.createdFiles?.[0].path).toBe('/root/basic');
    expect(result.createdFiles?.[0].content).toContain('Nmap scan report');
  });

  it('-oN con nombre de archivo con extension debe guardar correctamente', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oN', 'salida.txt', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/home/user'
    } as any);

    expect(result.createdFiles).toBeDefined();
    // Debe guardar en /home/user/salida.txt
    expect(result.createdFiles?.[0].path).toBe('/home/user/salida.txt');
  });

  it('-oN con path absoluto debe respetar el path', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oN', '/tmp/scan.txt', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/root'
    } as any);

    expect(result.createdFiles).toBeDefined();
    // Path absoluto debe respetarse
    expect(result.createdFiles?.[0].path).toBe('/tmp/scan.txt');
  });

  it('-oG debe crear archivo grepable en directorio actual', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oG', 'scan.gnmap', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/home/user'
    } as any);

    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles?.length).toBe(1);
    // Debe guardar en /home/user/scan.gnmap
    expect(result.createdFiles?.[0].path).toBe('/home/user/scan.gnmap');
    // Contenido debe ser formato grepable
    expect(result.createdFiles?.[0].content).toContain('Host:');
    expect(result.createdFiles?.[0].content).toContain('Ports:');
  });

  it('-oG sin extension debe guardar con nombre exacto', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oG', 'resultado', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/tmp'
    } as any);

    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles?.[0].path).toBe('/tmp/resultado');
  });

  it('-oN y -oG juntos deben crear ambos archivos', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '-oN', 'normal.txt', '-oG', 'grepable.txt', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1,
      currentDir: '/root'
    } as any);

    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles?.length).toBe(2);
    expect(result.createdFiles?.[0].path).toBe('/root/normal.txt');
    expect(result.createdFiles?.[1].path).toBe('/root/grepable.txt');
  });

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

  // ── CIDR Network Scan ──

  it('-sn con CIDR debe escanear toda la red', () => {
    const machines = [
      createMockMachine('target-01', '192.168.1.10', 1),
      createMockMachine('target-02', '192.168.1.20', 1),
    ];
    machines[1].machine_info.hostname = 'target2';
    machines[1].machine_info.mac = '00:0C:29:AA:BB:CC';

    const result = cmd_nmap.execute(['-sn', '192.168.1.0/24'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report for target (192.168.1.10)');
    expect(result.output).toContain('Nmap scan report for target2 (192.168.1.20)');
    expect(result.output).toContain('2 hosts up');
    expect(result.discoveredHosts).toBeUndefined();
  });

  it('-sn con CIDR sin hosts debe reportar 0 hosts', () => {
    const result = cmd_nmap.execute(['-sn', '10.0.0.0/24'], {
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Host seems down');
    expect(result.output).toContain('0 hosts up');
  });

  it('-sn -v con CIDR debe mostrar MAC addresses', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];

    const result = cmd_nmap.execute(['-sn', '-v', '192.168.1.0/24'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Initiating Ping Scan');
    expect(result.output).toContain('MAC Address');
    expect(result.output).toContain('256 hosts');
  });

  it('CIDR inválido debe retornar error', () => {
    const result = cmd_nmap.execute(['-sn', 'invalid-cidr'], {
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('especifica una IP o red válida');
  });
});
