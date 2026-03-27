// ── exercises/exercise04.ts ───────────────────────────────────────
// Scenario 4 — LFI to RCE Lab
// Datos y configuración específicos para este escenario

import { buildScenario, COMMON_PORTS, createFile, createWebDirs, createLinuxFileSystem, REVERSE_SHELL_PAYLOAD } from './templates';
import type { Scenario } from '../types';

// Re-exportar resetAttackerCounter desde templates para compatibilidad
export { resetAttackerCounter } from './templates';

// Template específico para LFI to RCE
export const SCENARIO_TEMPLATES_LFI = {
  lfiRce: () => ({
    id: 'scenario-04',
    name: 'LFI to RCE Lab',
    description: 'Explota LFI para ejecutar una shell remota (RCE).',
    difficulty: 'Medium' as const,
    category: 'Web' as const,
    networkRange: '192.168.20.0/24',
    attackerFiles: [createFile('/root/payload.php', REVERSE_SHELL_PAYLOAD.phpSimple, 'text')],
    targetMachine: {
      id: 'lab-scenario-04-lfi',
      machine_info: {
        hostname: 'dev-portal-backup',
        mac: '08:00:27:D6:E7:F8',
        os: 'Debian 11 (Bullseye)',
        status: 'up' as const,
        type: 'server',
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      ports: [
        COMMON_PORTS.http('Apache/2.4.52 (Debian)'),
        COMMON_PORTS.ssh('OpenSSH 8.4p1 Debian'),
      ],
      web_enumeration: {
        web_server: 'Apache/2.4.52',
        cms: 'Custom PHP Portal',
        directories: [
          { path: '/', status: 200, description: 'Página principal' },
          { path: '/upload.php', status: 200, description: 'Subida de archivos' },
        ],
      },
      files: [
        ...createLinuxFileSystem({ username: 'www-data' }),
        createFile('/var/www/html/flag.txt', 'THM{LFI_REVERSE_SHELL_PWNED}'),
      ],
    },
    learningSteps: [
      { task: 'Reconocimiento', text: 'Descubrir host: arp-scan <network/cidr>', discoveryLevel: 1 },
      { task: 'Escaneo', text: 'Escanear servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
      { task: 'LFI Discovery', text: 'Prueba leer archivos: ?page=../../../../etc/passwd', discoveryLevel: 3 },
      { task: 'Setup Listener', text: 'Prepara escucha: nc -nlvp 4444', discoveryLevel: 3 },
      { task: 'Preparar Payload', text: 'Lee payload.php: cat /root/payload.php y sube el contenido en mantenimiento.', discoveryLevel: 3 },
      { task: 'Remote Code Execution', text: 'Ejecuta: ?page=uploads/payload.php', discoveryLevel: 4 },
    ],
  }),
};

export const scenario_04: Scenario = buildScenario(SCENARIO_TEMPLATES_LFI.lfiRce());