// ── laboratorios/laboratorio05.ts ───────────────────────────────────────
// Scenario 5 — FTP Enumeration + Brute Force + Privilege Escalation
// Flujo: nmap → ftp anonymous → get → cat → hydra → ssh → escalada

import type { Scenario } from '../types';
import { buildScenario, createFile, createLinuxFileSystem, COMMON_PORTS } from './templates';

const targetMachine = {
  id: 'lab-scenario-05-target',
  hostname: 'privesc-server',
  mac: '08:00:27:E8:F9:0A',
  os: 'Debian 11 (Bullseye)',
  type: 'server',
  ports: [
    COMMON_PORTS.ftp('vsFTPd 3.0.3'),
    COMMON_PORTS.ssh('OpenSSH 8.2p1 Ubuntu'),
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
    { path: '/home/john/flag1.txt', content: 'ZIL{FTP_ANON_ACCESS}', type: 'text' },
    { path: '/home/john/.bash_history', content: `sudo -l
cat /etc/sudoers
whoami`, type: 'text' },
    { path: '/home/john/.ssh/id_rsa', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2x5z9k8vL...', type: 'text' },
  ],
};

// Datos específicos para el escenario FTP + Brute Force + Privilege Escalation
const scenario05Data = {
  id: 'scenario-05',
  name: 'FTP Enumeration & Privilege Escalation',
  // Metadata for LandingPage cards
  tagline: 'Enumerate via anonymous FTP, brute force SSH and escalate to root via sudo vim.',
  taglineEs: 'Enumerá vía FTP anónimo, fuerza bruta SSH y escalá a root con sudo vim.',
  description: 'Misconfigured FTP service with anonymous access. Discover credentials and privilege escalation vectors to gain root access on the target Linux system.',
  descriptionEs: 'Servicio FTP mal configurado con acceso anónimo. Descubrí credenciales y vectores de escalamiento de privilegios para acceder como root al sistema Linux.',
  tools: ['hydra', 'ftp', 'sudo'],
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
  targetMachine,
  learningSteps: [
    { id: 1, task: 'Host Discovery', taskEs: 'Descubrimiento de host', text: 'Discover the active host on the network', textEs: 'Descubrí el host activo en la red', discoveryLevel: 1, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Use arp-scan to discover hosts', es: 'Usá arp-scan para descubrir hosts' }, hint2: { en: 'arp-scan 10.10.20.0/24', es: 'arp-scan 10.10.20.0/24' } }, validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 } },
    { id: 2, task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Use nmap for port scanning', es: 'Usá nmap para escanear puertos' }, hint2: { en: 'nmap -sS -p- --min-rate 5000 <target-ip>', es: 'nmap -sS -p- --min-rate 5000 <ip-objetivo>' } }, validationCriteria: { type: 'scanResults' as const, port: 21 } },
    { id: 3, task: 'FTP Enumeration', taskEs: 'Enumeración FTP', text: 'Connect to the FTP server anonymously and download the note', textEs: 'Conectate al servidor FTP anónimamente y descargá la nota', discoveryLevel: 2, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Connect via FTP as anonymous and download the note', es: 'Conectate por FTP como anonymous y descargá la nota' }, hint2: { en: 'ftp <ip> → anonymous → ls → get nota.txt → exit → cat nota.txt', es: 'ftp <ip> → anonymous → ls → get nota.txt → exit → cat nota.txt' } }, validationCriteria: { type: 'ftpLogin' as const } },
    { id: 4, task: 'Read FTP Note', taskEs: 'Leer nota FTP', text: 'Read the downloaded note to discover the username', textEs: 'Leé la nota descargada para descubrir el nombre de usuario', discoveryLevel: 2, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Read the note with cat to discover the username mentioned', es: 'Leé la nota con cat para descubrir el usuario mencionado' }, hint2: { en: 'cat nota.txt (Spanish) or cat note.txt (English)', es: 'cat nota.txt (español) o cat note.txt (inglés)' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'note' as const } },
    { id: 5, task: 'SSH Brute Force', taskEs: 'Fuerza bruta SSH', text: 'Use the information from the note to brute force SSH and get credentials', textEs: 'Usá la información de la nota para hacer fuerza bruta por SSH y obtener credenciales', discoveryLevel: 3, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Use hydra for brute force attack', es: 'Usá hydra para el ataque de fuerza bruta' }, hint2: { en: 'hydra -l john -P /usr/share/wordlists/rockyou.txt <ip> ssh', es: 'hydra -l john -P /usr/share/wordlists/rockyou.txt <ip> ssh' } }, validationCriteria: { type: 'foundCredentials' as const, service: 'ssh' as const, user: 'john' } },
    { id: 6, task: 'SSH Access', taskEs: 'Acceso SSH', text: 'Connect via SSH using the found credentials', textEs: 'Conectate por SSH usando las credenciales encontradas', discoveryLevel: 3, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Connect via SSH with credentials', es: 'Conectate por SSH con las credenciales' }, hint2: { en: 'ssh john@<ip>', es: 'ssh john@<ip>' } }, validationCriteria: { type: 'sshLogin' as const, user: 'john' } },
    { id: 7, task: 'Sudo Enumeration', taskEs: 'Enumeración de sudo', text: 'Check your sudo permissions on the system', textEs: 'Verificá tus permisos de sudo en el sistema', discoveryLevel: 3, targetMachineId: targetMachine.id, hints: { hint1: { en: 'Check sudo permissions', es: 'Verificá los permisos de sudo' }, hint2: { en: 'sudo -l', es: 'sudo -l' } }, validationCriteria: { type: 'sudoPrivileges' as const, user: 'john' } },
    { id: 8, task: 'Privilege Escalation', taskEs: 'Escalada de privilegios', text: 'Use vim to escalate and become root', textEs: 'Usá vim para escalar y ser root', discoveryLevel: 4, targetMachineId: targetMachine.id, hints: { hint1: { en: 'You can execute vim in a single command to escalate and become root', es: 'Podes ejecutar vim en un solo comando para escalar y ser root'}, hint2: { en: "sudo vim -c '!bash'", es: "sudo vim -c '!bash'" } }, validationCriteria: { type: 'privesc' as const } },
    { id: 9, task: 'Capture Root Flag', taskEs: 'Capturar flag root', text: 'Read the root flag to complete the lab', textEs: 'Leé la flag de root para completar el laboratorio', discoveryLevel: 4, targetMachineId: targetMachine.id, hints: { hint1: { en: "You're root! Read the flag file", es: '¡Sos root! Leé el archivo de la flag' }, hint2: { en: 'cat /root/flag2.txt', es: 'cat /root/flag2.txt' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const } },
  ],
};

// Template específico para FTP + Privilege Escalation
export const SCENARIO_TEMPLATES = {
  ftpPrivesc: () => ({
    id: scenario05Data.id,
    name: scenario05Data.name,
    description: scenario05Data.descriptionEs,
    difficulty: 'Medium' as const,
    category: 'Web' as const,
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
      ports: scenario05Data.targetMachine.ports.map(p =>
        p.port === 22 ? { ...p, credentials: scenario05Data.credentials } : p
      ),
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
        createFile(`/home/${scenario05Data.credentials.user}/flag1.txt`, scenario05Data.flags.user),
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
