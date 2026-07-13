// ── laboratorios/laboratorio01.ts ───────────────────────────────────────
// Scenario 1 — WordPress Vulnerable Lab
// Datos específicos para este escenario

import { buildScenario, COMMON_PORTS, createFile, createLinuxFileSystem } from './templates';
import type { Scenario } from '../types';

// Datos específicos del escenario WordPress
const scenario01Data = {
  id: 'scenario-01',
  name: 'WordPress Vulnerable Lab',
  // Metadata for LandingPage cards
  tagline: 'Enumerate hidden paths, extract credentials and take control of a vulnerable WordPress.',
  taglineEs: 'Enumera rutas ocultas, extrae credenciales y toma control de un WordPress vulnerable.',
  description: 'Realistic WordPress environment with vulnerable plugins and themes. Identify and exploit common CMS vulnerabilities to gain server access, escalate privileges, and extract sensitive database information.',
  descriptionEs: 'Entorno WordPress realista con plugins y temas vulnerables. Identificá y explotá vulnerabilidades comunes en CMS para acceder al servidor, escalar privilegios y extraer información sensible de la base de datos.',
  tools: ['gobuster', 'wpscan', 'hydra'],
  accentColor: '#22d3ee',
  networkRange: '192.168.1.0/24',
  wpVersion: '6.0',
  flags: {
    user: 'ZIL{USER_WP_GRANTED}',
    root: 'ZIL{ROOT_WP_ACHIEVED}',
  },
  credentials: {
    wpAdmin: {
      user: 'admin',
      pass: 'P@ssw0rd123!',
    },
    ssh: {
      user: 'root',
      pass: 'R00t@SSH2024!',
    },
  },
  targetMachine: {
    id: 'lab-scenario-01-wp',
    hostname: 'vulnerable-wp-lab',
    mac: '08:00:27:A1:B2:C3',
    os: 'Ubuntu 20.04 LTS',
    type: 'server',
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
      { port: 3306, protocol: 'tcp', state: 'filtered', service: 'mysql', version: 'unknown' },
    ],
    webServer: 'Apache/2.4.41',
    cms: 'WordPress 6.0',
    directories: [
      { path: '/', status: 200, description: 'Página principal' },
      { path: '/wp-admin', status: 200, description: 'Panel de administración' },
      { path: '/uploads', status: 200, description: 'Directorio de archivos subidos' },
      { path: '/backup', status: 403, description: 'Copia de seguridad (Acceso denegado)' },
    ],
  },
  learningSteps: [
    { task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover the active hosts on the network', textEs: 'Descubrí los hosts activos en la red', discoveryLevel: 1, hints: { hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, hint2: { en: 'arp-scan <network_range>', es: 'arp-scan <rango-de-red>' } }, validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 } },
    { task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, hints: { hint1: { en: 'Use nmap', es: 'Usá nmap' }, hint2: { en: 'nmap -sS -p- --min-rate 5000 <target-ip>', es: 'nmap -sS -p- --min-rate 5000 <ip-objetivo>' } }, validationCriteria: { type: 'scanResults' as const, port: 80 } },
    { task: 'Web Enumeration', taskEs: 'Enumeración Web', text: 'Access the website to enumerate its content', textEs: 'Accedé al sitio web para enumerar su contenido', discoveryLevel: 2, hints: { hint1: { en: 'Open the Chrome browser', es: 'Abrí el navegador Chrome' }, hint2: { en: 'Click the Chrome button in the taskbar and navigate to http://<ip>', es: 'Hacé clic en el botón Chrome en la barra de tareas y navega a http://<ip>' } }, validationCriteria: { type: 'custom' as const } },
    { task: 'Directory Discovery', taskEs: 'Descubrimiento de directorios', text: 'Enumerate hidden directories on the web server', textEs: 'Enumerá los directorios ocultos del servidor web', discoveryLevel: 3, hints: { hint1: { en: 'Use gobuster', es: 'Usá gobuster' }, hint2: { en: 'gobuster dir -u http://<ip> -w <common-wordlist>', es: 'gobuster dir -u http://<ip> -w <wordlist-común>' } }, validationCriteria: { type: 'foundDirectories' as const, directories: ['/uploads'] } },
    { task: 'Find Credentials', taskEs: 'Encontrar credenciales', text: 'Find credentials hidden in the web server', textEs: 'Encontrá credenciales ocultas en el servidor web', discoveryLevel: 3, hints: { hint1: { en: 'Check the /uploads directory in the browser', es: 'Revisá el directorio /uploads en el navegador' }, hint2: { en: 'Navigate to http://<ip>/uploads and look for backup or config files', es: 'Navegá a http://<ip>/uploads y buscá archivos de backup o configuración' } }, validationCriteria: { type: 'custom' as const } },
    { task: 'WP-Admin Compromise', taskEs: 'Compromiso WP-Admin', text: 'Use the credentials to access the WordPress admin panel', textEs: 'Usá las credenciales para acceder al panel de admin de WordPress', discoveryLevel: 3, hints: { hint1: { en: 'Go to the WordPress login page', es: 'Andá a la página de login del WordPress' }, hint2: { en: 'Navigate to http://<ip>/wp-admin and log in with the credentials you found', es: 'Navegá a http://<ip>/wp-admin e iniciá sesión con las credenciales que encontraste' } }, validationCriteria: { type: 'custom' as const } },
    { task: 'SSH Connection', taskEs: 'Conexión SSH', text: 'Connect via SSH as root to complete the lab', textEs: 'Conectate por SSH como root para completar el laboratorio', discoveryLevel: 4, hints: { hint1: { en: 'Use the ssh command with the credentials found in the WP dashboard', es: 'Usá el comando ssh con las credenciales encontradas en el dashboard de WP' }, hint2: { en: 'ssh <user>@<target-ip> — use the SSH password you saw in the WordPress admin panel', es: 'ssh <usuario>@<ip-objetivo> — usá la contraseña SSH que viste en el panel de admin de WordPress' } }, validationCriteria: { type: 'sshLogin' as const, user: 'root' } },
    { task: 'Capture Root Flag', taskEs: 'Capturar flag root', text: 'Read the root flag to complete the lab', textEs: 'Leé la flag de root para completar el laboratorio', discoveryLevel: 4, hints: { hint1: { en: 'Search in /root', es: 'Buscá en /root' }, hint2: { en: 'cat /root/flag.txt', es: 'cat /root/flag.txt' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const } },
  ],
};

// Construir el escenario usando las funciones importadas de templates
export const scenario_01: Scenario = buildScenario({
  id: scenario01Data.id,
  name: scenario01Data.name,
  description: 'Enumeración web, descubrimiento de directorios y compromiso de WordPress.',
  difficulty: 'Medium',
  category: 'Web',
  networkRange: scenario01Data.networkRange,
  targetMachine: {
    id: scenario01Data.targetMachine.id,
    machine_info: {
      hostname: scenario01Data.targetMachine.hostname,
      mac: scenario01Data.targetMachine.mac,
      os: scenario01Data.targetMachine.os,
      status: 'up',
      type: scenario01Data.targetMachine.type,
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    ports: [
      { ...scenario01Data.targetMachine.ports[0], credentials: { user: 'root', pass: scenario01Data.credentials.ssh.pass } },
      scenario01Data.targetMachine.ports[1],
      scenario01Data.targetMachine.ports[2],
    ],
    web_enumeration: {
      web_server: scenario01Data.targetMachine.webServer,
      cms: scenario01Data.targetMachine.cms,
      directories: scenario01Data.targetMachine.directories,
    },
    files: [
      ...createLinuxFileSystem({ username: 'admin' }),
      createFile('/home/admin/.bashrc', '# ~/.bashrc: executed by bash(1) for non-login shells.\n\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\nHISTCONTROL=ignoreboth\nshopt -s histappend\nHISTSIZE=1000\nHISTFILESIZE=2000\nshopt -s checkwinsize\nalias ll=\'ls -l\'\nalias la=\'ls -la\'\nexport PATH="$HOME/bin:$HOME/.local/bin:$PATH"\nexport EDITOR=nano', 'text'),
      createFile('/home/admin/.profile', '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n\t. "$HOME/.bashrc"\n    fi\nfi', 'text'),
      createFile('/home/admin/.bash_history', 'ls -la\npwd\ncat /etc/passwd\nsudo su\nwhoami\nifconfig\nnmap 192.168.1.0/24\ncd /var/www/html\nls -la\ncat config.php\nmysql -u root -p\nexit', 'text'),
      createFile('/home/admin/user.txt', scenario01Data.flags.user),
      createFile('/root/flag.txt', scenario01Data.flags.root),
      createFile('/uploads/config.bak', `
# WordPress Configuration Backup
# Generated: 2024-03-27
# WARNING: Internal use only

## WP Database
DB_NAME = wordpress_db
DB_HOST = localhost

## WordPress Admin Credentials
# Redacted for security? NO, still here:
WP_ADMIN_USER = ${scenario01Data.credentials.wpAdmin.user}
WP_ADMIN_PASS = ${scenario01Data.credentials.wpAdmin.pass}

## Server Paths
WP_ROOT = /var/www/html
      `.trim(), 'text'),
    ],
  },
  learningSteps: scenario01Data.learningSteps,
});

// Export data for metadata access
export { scenario01Data };