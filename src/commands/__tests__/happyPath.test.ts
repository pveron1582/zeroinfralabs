// ── commands/__tests__/happyPath.test.ts ──────────────────────────
// Happy path tests for each lab scenario
// Simulates the complete user flow from start to finish

import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand, resetMsfState } from '../index';
import type { Machine } from '../../types';

// Reset MSF state before each test to avoid cross-test contamination
beforeEach(() => {
  resetMsfState();
});

// ── Helper: Create attacker machine ──────────────────────────────
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

// ── Helper: Execute command with context ─────────────────────────
const exec = (
  line: string,
  machine: Machine,
  allMachines: Machine[],
  currentMissionId: number
) => executeCommand(line, machine, allMachines, currentMissionId, undefined, '/');

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

  const allMachines = [attacker, wpTarget];

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.1.0/24', attacker, allMachines, 1);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('192.168.1.11');
    expect(result.output).toContain('08:00:27:A1:B2:C3');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap escanea puertos (requiere reconocimiento previo)', () => {
    // Simular que ya se hizo arp-scan (discovery_level = 1)
    const targetAfterScan = { ...wpTarget, discovery_level: 1 };
    const machines = [attacker, targetAfterScan];

    const result = exec('nmap -sV 192.168.1.11', attacker, machines, 2);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('OpenSSH');
    expect(result.output).toContain('Apache');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 4: gobuster enumera directorios (requiere escaneo previo)', () => {
    const targetAfterNmap = { ...wpTarget, discovery_level: 2 };
    const machines = [attacker, targetAfterNmap];

    const result = exec('gobuster dir -u http://192.168.1.11 -w rockyou.txt', attacker, machines, 4);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('/wp-admin');
    expect(result.output).toContain('/uploads');
    expect(result.completedMissionId).toBe(4);
  });

  it('Debe rechazar nmap sin reconocimiento previo', () => {
    const result = exec('nmap -sV 192.168.1.11', attacker, allMachines, 2);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('reconocimiento');
  });

  it('Debe rechazar gobuster sin escaneo previo', () => {
    const targetAfterScan = { ...wpTarget, discovery_level: 1 };
    const machines = [attacker, targetAfterScan];

    const result = exec('gobuster dir -u http://192.168.1.11 -w rockyou.txt', attacker, machines, 4);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('escanea puertos');
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

  const allMachines = [attacker, sshTarget];

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 10.10.10.0/24', attacker, allMachines, 1);
    expect(result.output).toContain('10.10.10.10');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap escanea puertos', () => {
    const target = { ...sshTarget, discovery_level: 1 };
    const result = exec('nmap -sV 10.10.10.10', attacker, [attacker, target], 2);
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('ssh');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 3: hydra encuentra credenciales', () => {
    const target = { ...sshTarget, discovery_level: 2 };
    const result = exec('hydra -l root -P rockyou.txt 10.10.10.10 ssh', attacker, [attacker, target], 3);
    expect(result.output).toContain('login: root');
    expect(result.output).toContain('password: toor');
    expect(result.foundCredentials).toBeDefined();
    expect(result.foundCredentials?.user).toBe('root');
    expect(result.foundCredentials?.pass).toBe('toor');
    expect(result.completedMissionId).toBe(3);
  });

  it('Paso 4: ssh conecta con credenciales correctas', () => {
    const target = { ...sshTarget, discovery_level: 3 };
    const result = exec('ssh root@10.10.10.10 toor', attacker, [attacker, target], 4);
    expect(result.output).toContain('Welcome to');
    expect(result.output).toContain('Ubuntu');
    expect(result.completedMissionId).toBe(4);
    expect(result.newMachineId).toBe('lab-scenario-02-ssh');
  });

  it('Debe rechazar ssh sin fuerza bruta previa', () => {
    const target = { ...sshTarget, discovery_level: 2 };
    const result = exec('ssh root@10.10.10.10 toor', attacker, [attacker, target], 4);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('credenciales');
  });

  it('Debe rechazar credenciales incorrectas', () => {
    const target = { ...sshTarget, discovery_level: 3 };
    const result = exec('ssh root@10.10.10.10 wrongpass', attacker, [attacker, target], 4);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Permission denied');
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

  const allMachines = [attacker, win7Target];

  it('Paso 1: arp-scan descubre Windows 7', () => {
    const result = exec('arp-scan 172.16.0.0/24', attacker, allMachines, 1);
    expect(result.output).toContain('172.16.0.11');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap detecta SMB en puerto 445', () => {
    const target = { ...win7Target, discovery_level: 1 };
    const result = exec('nmap -sV 172.16.0.11', attacker, [attacker, target], 2);
    expect(result.output).toContain('445/tcp');
    expect(result.output).toContain('microsoft-ds');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 3-5: Flujo completo de Metasploit', () => {
    const target = { ...win7Target, discovery_level: 2 };
    const machines = [attacker, target];

    // Iniciar msfconsole
    let result = exec('msfconsole', attacker, machines, 3);
    expect(result.output).toContain('metasploit');

    // Buscar módulo
    result = exec('search ms17', attacker, machines, 3);
    expect(result.output).toContain('Matching Modules');
    expect(result.output).toContain('smb_ms17_010');

    // Seleccionar auxiliary
    result = exec('use 0', attacker, machines, 3);
    expect(result.output).toContain('No payload configured');

    // Configurar RHOSTS
    result = exec('set RHOSTS 172.16.0.11', attacker, machines, 3);
    expect(result.output).toContain('RHOSTS => 172.16.0.11');

    // Ejecutar auxiliary (verificar vulnerabilidad)
    result = exec('run', attacker, machines, 3);
    expect(result.output).toContain('VULNERABLE');
    expect(result.completedMissionId).toBe(3);

    // Volver atrás
    result = exec('back', attacker, machines, 4);

    // Buscar exploit
    result = exec('search ms17', attacker, machines, 4);
    expect(result.output).toContain('eternalblue');

    // Seleccionar exploit
    result = exec('use 1', attacker, machines, 4);

    // Configurar RHOSTS y LHOST
    result = exec('set RHOSTS 172.16.0.11', attacker, machines, 4);
    result = exec('set LHOST 192.168.1.10', attacker, machines, 4);

    // Ejecutar exploit
    result = exec('exploit', attacker, machines, 4);
    expect(result.output).toContain('Meterpreter session');
    expect(result.completedMissionId).toBe(4);

    // Verificar acceso SYSTEM
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

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.20.0/24', attacker, allMachines, 1);
    expect(result.output).toContain('192.168.20.11');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap detecta Apache en puerto 80', () => {
    const target = { ...lfiTarget, discovery_level: 1 };
    const result = exec('nmap -sV 192.168.20.11', attacker, [attacker, target], 2);
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('Apache');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 4: nc -nlvp activa listener (misión resuelta dinámicamente)', () => {
    const result = exec('nc -nlvp 4444', attacker, allMachines, 4);
    expect(result.output).toContain('listening');
    expect(result.output).toContain('4444');
    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.listeningPort).toBe(4444);
    // El id se resuelve buscando el step "Setup Listener", no por hardcode
    expect(result.completedMissionId).toBe(4);
  });

  it('nc fuera del contexto LFI no completa ninguna misión', () => {
    // Simular nc ejecutado en un escenario sin step de listener (ej: SSH Lab)
    const result = exec('nc -nlvp 9999', attacker, [attacker], 1);
    expect(result.output).toContain('listening');
    expect(result.completedMissionId).toBeUndefined();
  });

  it('Debe rechazar nc sin puerto', () => {
    const result = exec('nc -nlvp', attacker, allMachines, 4);
    expect(result.isError).toBe(true);
  });

  it('Debe rechazar nmap sin reconocimiento previo', () => {
    const result = exec('nmap -sV 192.168.20.11', attacker, allMachines, 2);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('reconocimiento');
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
      { id: 5, task: 'Enumeración de sudo', text: 'Listá permisos: sudo -l', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 3 },
      { id: 6, task: 'Escalada de privilegios', text: 'Usá vim para escalar: sudo vim -c \'!bash\'', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 4 },
      { id: 7, task: 'Capturar la flag de root', text: 'Leé la flag: cat /root/root.txt', targetMachineId: 'lab-scenario-05-privesc', discoveryLevel: 4 },
    ],
    files: [
      { path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
      { path: '/root/root.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/developer/user.txt', content: 'ZIL{SSH_ACCESS_DEVELOPER}', type: 'text' },
    ],
  };

  const allMachines = [attacker, privescTarget];

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.30.0/24', attacker, allMachines, 1);
    expect(result.output).toContain('192.168.30.11');
    expect(result.completedMissionId).toBe(1);
  });

  it('Paso 2: nmap escanea puertos', () => {
    const target = { ...privescTarget, discovery_level: 1 };
    const result = exec('nmap -sV 192.168.30.11', attacker, [attacker, target], 2);
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('ssh');
    expect(result.completedMissionId).toBe(2);
  });

  it('Paso 3: hydra encuentra credenciales de developer', () => {
    const target = { ...privescTarget, discovery_level: 2 };
    const result = exec('hydra -l developer -P rockyou.txt 192.168.30.11 ssh', attacker, [attacker, target], 3);
    expect(result.output).toContain('login: developer');
    expect(result.output).toContain('password: dev2024');
    expect(result.foundCredentials?.user).toBe('developer');
    expect(result.completedMissionId).toBe(3);
  });

  it('Paso 4: ssh conecta como developer', () => {
    const target = { ...privescTarget, discovery_level: 3 };
    const result = exec('ssh developer@192.168.30.11 dev2024', attacker, [attacker, target], 4);
    expect(result.output).toContain('Welcome to');
    expect(result.newMachineId).toBe('lab-scenario-05-privesc');
    expect(result.completedMissionId).toBe(4);
  });

  it('Paso 5: sudo -l muestra permisos de vim', () => {
    const target = { ...privescTarget, discovery_level: 3 };
    const result = exec('sudo -l', target, [attacker, target], 5);
    expect(result.output).toContain('developer');
    expect(result.output).toContain('NOPASSWD');
    expect(result.output).toContain('vim');
    expect(result.completedMissionId).toBe(5);
  });

  it('Paso 6: sudo vim -c !bash escala a root', () => {
    const target = { ...privescTarget, discovery_level: 3 };
    const result = exec("sudo vim -c '!bash'", target, [attacker, target], 6);
    expect(result.output).toContain('root');
    expect(result.output).toContain('uid=0');
    expect(result.completedMissionId).toBe(6);
  });

  it('Paso 7: cat /root/root.txt obtiene la flag', () => {
    const target = { ...privescTarget, discovery_level: 4 };
    const result = exec('cat /root/root.txt', target, [attacker, target], 7);
    expect(result.output).toContain('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
    expect(result.completedMissionId).toBe(7);
  });

  it('Debe rechazar ssh sin fuerza bruta previa', () => {
    const target = { ...privescTarget, discovery_level: 2 };
    const result = exec('ssh developer@192.168.30.11 dev2024', attacker, [attacker, target], 3);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('credenciales');
  });
});

// ═══════════════════════════════════════════════════════════════════
// CROSS-SCENARIO: Comandos básicos
// ═══════════════════════════════════════════════════════════════════
describe('Comandos básicos funcionan en todos los contextos', () => {
  const attacker = createAttacker();

  it('help muestra lista de comandos', () => {
    const result = exec('help', attacker, [attacker], 1);
    expect(result.output).toContain('arp-scan');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('hydra');
    expect(result.output).toContain('ssh');
    expect(result.output).toContain('msfconsole');
  });

  it('whoami muestra root en atacante', () => {
    const result = exec('whoami', attacker, [attacker], 1);
    expect(result.output).toContain('root');
  });

  it('ifconfig muestra IP del atacante', () => {
    const result = exec('ifconfig', attacker, [attacker], 1);
    expect(result.output).toContain('192.168.1.10');
    expect(result.output).toContain('eth0');
  });

  it('clear retorna CLEAR_TERMINAL', () => {
    const result = exec('clear', attacker, [attacker], 1);
    expect(result.output).toBe('CLEAR_TERMINAL');
  });

  it('comando desconocido muestra error', () => {
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
    // Especificar directorio /root para listar archivos dentro de él
    const result = exec('ls /root', attackerWithFiles, [attackerWithFiles], 1);
    expect(result.output).toContain('payload.php');
    expect(result.output).toContain('notes.txt');
  });

  it('cat lee archivo existente', () => {
    const attackerWithFiles = {
      ...attacker,
      files: [
        { path: '/root/flag.txt', content: 'THM{TEST_FLAG}', type: 'text' as const },
      ],
    };
    const result = exec('cat /root/flag.txt', attackerWithFiles, [attackerWithFiles], 1);
    expect(result.output).toContain('THM{TEST_FLAG}');
  });

  it('cat rechaza archivo inexistente', () => {
    const result = exec('cat /root/nonexistent.txt', attacker, [attacker], 1);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file');
  });
});