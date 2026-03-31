// Scenario 2 — SSH Brute Force Lab
// Datos específicos para este escenario

import { buildScenario, createFile, createLinuxFileSystem } from './templates';
import type { Scenario } from '../types';

// Datos específicos del escenario SSH Brute Force
const scenario02Data = {
  id: 'scenario-02',
  name: 'SSH Brute Force Lab',
  // Metadata for LandingPage cards
  tagline: 'Launch a brute force attack with Hydra to compromise root SSH access.',
  taglineEs: 'Lanza un ataque de fuerza bruta con Hydra para comprometer acceso SSH root.',
  description: 'Network scanning and SSH brute force attack based on basic OSINT intelligence from a website.',
  descriptionEs: 'Escaneo de red y ataque de fuerza bruta por SSH basado en inteligencia de fuentes abiertas (OSINT) básica en un sitio web.',
  tools: ['arp-scan', 'nmap', 'hydra', 'ssh'],
  accentColor: '#fbbf24',
  networkRange: '10.10.10.0/24',
  flags: {
    user: 'THM{SSH_USER_ACCESS_GRANTED}',
    root: 'THM{SSH_BRUTE_FORCE_SUCCESS}',
  },
  credentials: {
    user: 'gonzalo',
    pass: 'Quier0unaument0',
  },
  targetMachine: {
    id: 'lab-scenario-02-ssh',
    hostname: 'ssh-target-lab',
    mac: '08:00:27:B2:C3:D4',
    os: 'Ubuntu 22.04 LTS',
    type: 'server',
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache/2.4.41' },
    ],
    webServer: 'Apache/2.4.41',
    cms: 'none',
    directories: [
      { path: '/', status: 200, description: 'Consultancy Site' }
    ],
  },
  learningSteps: [
    { id: 1, task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover hosts: arp-scan <network/cidr>', textEs: 'Descubrir hosts: arp-scan <network/cidr>', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 1 },
    { id: 2, task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify services: nmap -sV <target-ip>', textEs: 'Identificar servicios: nmap -sV <target-ip>', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 2 },
    { id: 3, task: 'Web Reconnaissance', taskEs: 'Reconocimiento Web', text: 'Access the website to identify employees and possible users.', textEs: 'Acceder al sitio web para identificar empleados y posibles usuarios.', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3 },
    { id: 4, task: 'SSH Brute Force', taskEs: 'Fuerza bruta SSH', text: 'Get credentials: hydra -l <username> -P /usr/share/wordlists/rockyou.txt <target-ip> ssh', textEs: 'Obtener credenciales: hydra -l <username> -P /usr/share/wordlists/rockyou.txt <target-ip> ssh', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3 },
    { id: 5, task: 'SSH Access', taskEs: 'Acceso por SSH', text: 'Connect: ssh <username>@<target-ip>', textEs: 'Conectarse: ssh <username>@<target-ip>', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 4 },
  ],
};

// Construir el escenario usando las funciones importadas de templates
export const scenario_02: Scenario = buildScenario({
  id: scenario02Data.id,
  name: scenario02Data.name,
  description: 'Escaneo de red y ataque de fuerza bruta por SSH basado en inteligencia de fuentes abiertas (OSINT) básica en un sitio web.',
  difficulty: 'Easy',
  category: 'Web', // Cambiado a Web para habilitar el navegador
  networkRange: scenario02Data.networkRange,
  targetMachine: {
    id: scenario02Data.targetMachine.id,
    machine_info: {
      hostname: scenario02Data.targetMachine.hostname,
      mac: scenario02Data.targetMachine.mac,
      os: scenario02Data.targetMachine.os,
      status: 'up',
      type: scenario02Data.targetMachine.type,
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    ports: [
      { ...scenario02Data.targetMachine.ports[0], credentials: scenario02Data.credentials },
      scenario02Data.targetMachine.ports[1],
    ],
    web_enumeration: {
      web_server: scenario02Data.targetMachine.webServer,
      cms: scenario02Data.targetMachine.cms,
      directories: scenario02Data.targetMachine.directories,
    },
    files: [
      ...createLinuxFileSystem({ username: 'gonzalo' }),
      createFile('/home/gonzalo/user.txt', scenario02Data.flags.user),
    ],
  },
  learningSteps: scenario02Data.learningSteps,
});

// Export data for metadata access
export { scenario02Data };