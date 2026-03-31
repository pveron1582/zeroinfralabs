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
    user: 'THM{USER_WP_GRANTED}',
    root: 'THM{ROOT_WP_ACHIEVED}',
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
    { task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover active hosts: arp-scan <network/cidr>', textEs: 'Descubrir hosts activos: arp-scan <network/cidr>', discoveryLevel: 1 },
    { task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Scan ports: nmap -sV <target-ip>', textEs: 'Escanear puertos: nmap -sV <target-ip>', discoveryLevel: 2 },
    { task: 'Web Enumeration', taskEs: 'Enumeración Web', text: 'Access the website from the Firefox button above.', textEs: 'Acceder al sitio web desde el botón de Firefox arriba.', discoveryLevel: 2 },
    { task: 'Directory Discovery', taskEs: 'Descubrimiento de directorios', text: 'Enumerate routes: gobuster dir -u http://<target-ip> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', textEs: 'Enumerar rutas: gobuster dir -u http://<target-ip> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', discoveryLevel: 3 },
    { task: 'WP-Admin Compromise', taskEs: 'Compromiso WP-Admin', text: 'Find credentials in /uploads and access /wp-admin.', textEs: 'Buscar credenciales en /uploads y acceder a /wp-admin.', discoveryLevel: 4 },
    { task: 'SSH Connection', taskEs: 'Conexión SSH', text: 'Connect via SSH as root to complete the lab: ssh root@<target-ip> R00t@SSH2024!', textEs: 'Conectarse por SSH como root para completar el laboratorio: ssh root@<target-ip> R00t@SSH2024!', discoveryLevel: 4 },
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