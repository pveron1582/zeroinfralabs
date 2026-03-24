// ── exercises/exercise02.ts ───────────────────────────────────────
// Scenario 2 — SSH Brute Force Lab
// Datos específicos para este escenario

import { buildScenario, COMMON_PORTS, createFile, createLinuxFileSystem } from './templates';
import type { Scenario } from '../types';

// Datos específicos del escenario SSH Brute Force
const scenario02Data = {
  id: 'scenario-02',
  name: 'SSH Brute Force Lab',
  networkRange: '10.10.10.0/24',
  flags: {
    root: 'THM{SSH_BRUTE_FORCE_SUCCESS}',
  },
  credentials: {
    user: 'root',
    pass: 'toor',
  },
  targetMachine: {
    id: 'lab-scenario-02-ssh',
    hostname: 'ssh-target-lab',
    mac: '08:00:27:B2:C3:D4',
    os: 'Ubuntu 22.04 LTS',
    type: 'server',
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu' },
      { port: 8080, protocol: 'tcp', state: 'open', service: 'http-alt', version: 'nginx/1.18.0' },
    ],
    webServer: 'nginx/1.18.0',
    cms: 'none',
    directories: [],
  },
  learningSteps: [
    { task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan <network/cidr>', discoveryLevel: 1 },
    { task: 'Escaneo de puertos', text: 'Identificar servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
    { task: 'Fuerza bruta SSH', text: 'Obtener credenciales: hydra -l root -P rockyou.txt <target-ip> ssh', discoveryLevel: 3 },
    { task: 'Acceso por SSH', text: 'Conectarse: ssh root@<target-ip> <password>', discoveryLevel: 4 },
  ],
};

// Construir el escenario usando las funciones importadas de templates
export const scenario_02: Scenario = buildScenario({
  id: scenario02Data.id,
  name: scenario02Data.name,
  description: 'Escaneo de red y ataque de fuerza bruta por SSH.',
  difficulty: 'Easy',
  category: 'Network',
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
      ...createLinuxFileSystem({ username: 'root' }),
      createFile('/root/flag.txt', scenario02Data.flags.root),
    ],
  },
  learningSteps: scenario02Data.learningSteps,
});