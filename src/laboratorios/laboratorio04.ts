// ── laboratorios/laboratorio04.ts ───────────────────────────────────────
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
    // Metadata for LandingPage cards
    tagline: 'Exploit LFI to read system files, upload a shell and get RCE.',
    taglineEs: 'Explota LFI para leer archivos del sistema, sube una shell y obtén RCE.',
    tools: ['arp-scan', 'nmap', 'curl', 'msfconsole'],
    accentColor: '#a78bfa',
    description: 'Exploit LFI to execute a reverse shell (RCE).',
    descriptionEs: 'Explota LFI para ejecutar una shell remota (RCE).',
    difficulty: 'Medium' as const,
    category: 'Web' as const,
    networkRange: '192.168.20.0/24',
    attackerFiles: [
      createFile('/root/payload.php', REVERSE_SHELL_PAYLOAD.phpSimple, 'text'),
      createFile('/root/notas.txt', 'PASO A PASO LFI TO RCE:\n1. Descubrimiento: arp-scan 192.168.20.0/24\n2. Escaneo: nmap -sV 192.168.20.11\n3. LFI: Probar ?page=../../../../etc/passwd\n4. Reverse Shell: Poner nc -nlvp 4444 y subir el payload.php\n5. Ejecución: Ve a /files/ y haz clic en payload.php o navega a /files/payload.php', 'text'),
      createFile('/root/escaneo.txt', 'Nmap scan report for dev-portal-backup (192.168.20.11)\nHost is up (0.00052s latency).\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.4p1 Debian\n80/tcp open  http    Apache/2.4.52 (Debian)\n|_http-title: DevPortal\n\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel', 'text'),
    ],
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
        directories: [],
      },
      files: [
        ...createLinuxFileSystem({ username: 'www-data' }),
        createFile('/var/www/html/flag.txt', 'THM{LFI_REVERSE_SHELL_PWNED}'),
      ],
    },
    learningSteps: [
      { task: 'Reconnaissance', taskEs: 'Reconocimiento', text: 'Discover host: arp-scan <network/cidr>', textEs: 'Descubrir host: arp-scan <network/cidr>', discoveryLevel: 1 },
      { task: 'Scanning', taskEs: 'Escaneo', text: 'Scan services: nmap -sV <target-ip>', textEs: 'Escanear servicios: nmap -sV <target-ip>', discoveryLevel: 2 },
      { task: 'LFI Discovery', taskEs: 'Descubrimiento LFI', text: 'Test reading server files. Go to the site and navigate to "About". Delete only about.php and enter ../../../../etc/passwd', textEs: 'Prueba leer archivos del server. Ingresa al sitio y ve a "Acerca de". Borra solo about.php e ingresa ../../../../etc/passwd', discoveryLevel: 3 },
      { task: 'Prepare Payload', taskEs: 'Preparar Payload', text: 'Inspect the file for the reverse shell: cat /root/payload.php', textEs: 'Inspecciona el archivo para la reverse shell: cat /root/payload.php', discoveryLevel: 3 },
      { task: 'Setup Listener', taskEs: 'Configurar Listener', text: 'Prepare the listener in your terminal: nc -nlvp 4444', textEs: 'Prepara la escucha en tu terminal: nc -nlvp 4444', discoveryLevel: 3 },
      { task: 'Remote Code Execution', taskEs: 'Ejecución Remota de Código', text: 'Upload the file at /upload.php and execute it through the file manager at /files/payload.php or by clicking on the file at /files', textEs: 'Sube el archivo en /upload.php y ejecútalo mediante el gestor de archivos en /files/payload.php o haciendo clic en el archivo en /files', discoveryLevel: 4 },
    ],
  }),
};

export const scenario_04: Scenario = buildScenario(SCENARIO_TEMPLATES_LFI.lfiRce());