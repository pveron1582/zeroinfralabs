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
  description: 'Web enumeration, directory discovery and WordPress compromise.',
  descriptionEs: 'Enumeración web, descubrimiento de directorios y compromiso de WordPress.',
  tools: ['arp-scan', 'nmap', 'gobuster', 'ssh'],
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
    { task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover the active hosts on the network', textEs: 'Descubrí los hosts activos en la red', discoveryLevel: 1, hints: { hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, hint2: { en: 'arp-scan 192.168.1.0/24', es: 'arp-scan 192.168.1.0/24' } } },
    { task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, hints: { hint1: { en: 'Use nmap', es: 'Usá nmap' }, hint2: { en: 'nmap -sV <target-ip>', es: 'nmap -sV <ip-objetivo>' } } },
    { task: 'Web Enumeration', taskEs: 'Enumeración Web', text: 'Access the website to enumerate its content', textEs: 'Accedé al sitio web para enumerar su contenido', discoveryLevel: 2, hints: { hint1: { en: 'Use the Firefox browser up', es: 'Usá el navegador Firefox arriba' }, hint2: { en: 'Click the Firefox button and navigate to http://<ip>', es: 'Hacé clic en el botón Firefox y navega a http://<ip>' } } },
    { task: 'Directory Discovery', taskEs: 'Descubrimiento de directorios', text: 'Enumerate hidden directories on the web server', textEs: 'Enumerá los directorios ocultos del servidor web', discoveryLevel: 3, hints: { hint1: { en: 'Use gobuster', es: 'Usá gobuster' }, hint2: { en: 'gobuster dir -u http://<ip> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', es: 'gobuster dir -u http://<ip> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt' } } },
    { task: 'WP-Admin Compromise', taskEs: 'Compromiso WP-Admin', text: 'Find credentials in the uploads directory and access the WordPress admin panel', textEs: 'Encontrá credenciales en el directorio uploads y accedé al panel de admin de WordPress', discoveryLevel: 3, hints: { hint1: { en: 'Look for the backup file in /uploads and navigate to /wp-admin', es: 'Buscá el archivo de backup en /uploads y navega a /wp-admin' }, hint2: { en: '1. Enter http://<ip>/uploads and review credentials\n2. Go to http://<ip>/wp-admin', es: '1. Ingresá a http://<ip>/uploads y revisa credenciales\n2. Anda a http://<ip>/wp-admin' } } },
    { task: 'SSH Connection', taskEs: 'Conexión SSH', text: 'Connect via SSH as root to complete the lab', textEs: 'Conectate por SSH como root para completar el laboratorio', discoveryLevel: 4, hints: { hint1: { en: 'Use the ssh command', es: 'Usá el comando ssh' }, hint2: { en: 'ssh root@<target-ip> R00t@SSH2024!', es: 'ssh root@<ip-objetivo> R00t@SSH2024!' } } },
    { task: 'Capture Root Flag', taskEs: 'Capturar flag root', text: 'Read the root flag to complete the lab', textEs: 'Leé la flag de root para completar el laboratorio', discoveryLevel: 4, hints: { hint1: { en: 'Search in /root', es: 'Buscá en /root' }, hint2: { en: 'cat /root/flag.txt', es: 'cat /root/flag.txt' } } },
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