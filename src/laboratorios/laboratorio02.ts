// Scenario 2 — Web OSINT & SSH Compromise Lab
// Datos específicos para este escenario

import { buildScenario, createFile, createLinuxFileSystem } from './templates';
import type { Scenario } from '../types';

// Datos específicos del escenario Web OSINT & SSH Compromise
const scenario02Data = {
  id: 'scenario-02',
  name: 'Web OSINT & SSH Compromise',
  // Metadata for LandingPage cards
  tagline: 'Gather OSINT from a website, enumerate usernames and compromise SSH access.',
  taglineEs: 'Recolecta OSINT de un sitio web, enumera usuarios y compromete el acceso SSH.',
  description: 'Web reconnaissance combined with SSH attacks. Perform passive and active information gathering on a web server, followed by brute force and SSH credential compromise for remote access.',
  descriptionEs: 'Reconocimiento web combinado con ataques SSH. Recolectá información pasiva y activa sobre un servidor web, seguido de fuerza bruta y compromiso de credenciales SSH para acceso remoto.',
  tools: ['hydra', 'ssh', 'osint'],
  accentColor: '#fbbf24',
  networkRange: '10.10.10.0/24',
  flags: {
    user: 'ZIL{SSH_USER_ACCESS_GRANTED}',
    root: 'ZIL{WEB_OSINT_SSH_SUCCESS}',
  },
  credentials: {
    user: 'gonzalo',
    pass: 'casablanca',
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
    { id: 1, task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover the hosts on the network', textEs: 'Descubrí los hosts en la red', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 1, hints: { hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, hint2: { en: 'arp-scan 10.10.10.0/24', es: 'arp-scan 10.10.10.0/24' } }, validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 } },
    { id: 2, task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 2, hints: { hint1: { en: 'Use nmap', es: 'Usá nmap' }, hint2: { en: 'nmap -sS -p- --min-rate 5000 <target-ip>', es: 'nmap -sS -p- --min-rate 5000 <ip-objetivo>' } }, validationCriteria: { type: 'scanResults' as const, port: 22 } },
    { id: 3, task: 'Web Reconnaissance', taskEs: 'Reconocimiento Web', text: 'Access the website to identify employees and possible usernames', textEs: 'Accedé al sitio web para identificar empleados y posibles nombres de usuario', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3, hints: { hint1: { en: 'Use the Chrome browser', es: 'Usá el navegador Chrome' }, hint2: { en: 'Click the Chrome button', es: 'Hacé clic en el botón Chrome' } }, validationCriteria: { type: 'custom' as const } },
    { id: 4, task: 'Credential Attack', taskEs: 'Ataque de credenciales', text: 'Perform a credential attack using the discovered username', textEs: 'Realizá un ataque de credenciales usando el nombre de usuario descubierto', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3, hints: { hint1: { en: 'Use hydra for credential attack', es: 'Usá hydra para el ataque de credenciales' }, hint2: { en: 'hydra -l <username> -P /usr/share/wordlists/rockyou.txt <target-ip> ssh', es: 'hydra -l <usuario> -P /usr/share/wordlists/rockyou.txt <ip> ssh' } }, validationCriteria: { type: 'foundCredentials' as const, service: 'ssh' as const, user: 'gonzalo' } },
    { id: 5, task: 'SSH Access', taskEs: 'Acceso por SSH', text: 'Connect via SSH using the found credentials', textEs: 'Conectate por SSH usando las credenciales encontradas', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3, hints: { hint1: { en: 'Use the ssh command', es: 'Usá el comando ssh' }, hint2: { en: 'ssh <username>@<target-ip> <password>', es: 'ssh <usuario>@<ip> <contraseña>' } }, validationCriteria: { type: 'sshLogin' as const, user: 'gonzalo' } },
    { id: 6, task: 'Capture User Flag', taskEs: 'Capturar flag de usuario', text: 'Find and read the user flag to complete the lab', textEs: 'Encontrá y leé la flag de usuario para completar el laboratorio', targetMachineId: 'lab-scenario-02-ssh', discoveryLevel: 3, hints: { hint1: { en: "Check the user's home", es: 'Revisá el home del usuario' }, hint2: { en: 'cat /home/gonzalo/flag.txt', es: 'cat /home/gonzalo/flag.txt' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const } },
  ],
};

// Construir el escenario usando las funciones importadas de templates
export const scenario_02: Scenario = buildScenario({
  id: scenario02Data.id,
  name: scenario02Data.name,
  description: 'Reconocimiento web, enumeración de nombres de usuario y compromiso de SSH usando Hydra.',
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
      createFile('/home/gonzalo/flag.txt', scenario02Data.flags.user),
    ],
  },
  learningSteps: scenario02Data.learningSteps,
});

// Export data for metadata access
export { scenario02Data };