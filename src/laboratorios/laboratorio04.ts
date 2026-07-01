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
        createFile('/var/www/html/flag.txt', 'ZIL{LFI_REVERSE_SHELL_PWNED}'),
      ],
    },
    learningSteps: [
      { task: 'Reconnaissance', taskEs: 'Reconocimiento', text: 'Discover the host on the network', textEs: 'Descubrí el host en la red', discoveryLevel: 1, hints: { hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, hint2: { en: 'arp-scan 192.168.20.0/24', es: 'arp-scan 192.168.20.0/24' } }, validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 } },
      { task: 'Scanning', taskEs: 'Escaneo', text: 'Identify the services running on the target', textEs: 'Identificá los servicios que corren en el objetivo', discoveryLevel: 2, hints: { hint1: { en: 'Use nmap', es: 'Usá nmap' }, hint2: { en: 'nmap -sV 192.168.20.11', es: 'nmap -sV 192.168.20.11' } }, validationCriteria: { type: 'scanResults' as const, port: 80 } },
      { task: 'LFI Discovery', taskEs: 'Descubrimiento LFI', text: 'Test for Local File Inclusion vulnerability', textEs: 'Probá la vulnerabilidad de Inclusión Local de Archivos', discoveryLevel: 3, hints: { hint1: { en: 'Use the browser to test LFI', es: 'Usá el navegador para probar LFI' }, hint2: { en: 'Navigate to the About page and test ../../../../etc/passwd', es: 'Navegá a la página About y probá ../../../../etc/passwd' } }, validationCriteria: { type: 'custom' as const } },
      { task: 'Prepare Payload', taskEs: 'Preparar Payload', text: 'Inspect the reverse shell payload file', textEs: 'Inspeccioná el archivo de la reverse shell', discoveryLevel: 3, hints: { hint1: { en: 'View the payload.php file', es: 'Visualizá el archivo payload.php' }, hint2: { en: 'cat /root/payload.php', es: 'cat /root/payload.php' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'payload' as const } },
      { task: 'Setup Listener', taskEs: 'Configurar Listener', text: 'Prepare a listener to receive the reverse shell', textEs: 'Prepará un listener para recibir la reverse shell', discoveryLevel: 3, hints: { hint1: { en: 'Use netcat', es: 'Usá netcat' }, hint2: { en: 'nc -nlvp 4444', es: 'nc -nlvp 4444' } }, validationCriteria: { type: 'ncListener' as const } },
      { task: 'Remote Code Execution', taskEs: 'Ejecución Remota de Código', text: 'Upload the payload and execute it to get RCE', textEs: 'Subí el payload y ejecutalo para obtener RCE', discoveryLevel: 3, hints: { hint1: { en: 'Upload via /upload.php and execute via /files/', es: 'Subí por /upload.php y ejecutá por /files/' }, hint2: { en: 'Upload at /upload.php, execute at /files/payload.php', es: 'Subí en /upload.php, ejecutá en /files/payload.php' } }, validationCriteria: { type: 'blockingCommand' as const } },
      { task: 'Capture User Flag', taskEs: 'Capturar flag de usuario', text: 'Read the user flag to complete the lab', textEs: 'Leé la flag de usuario para completar el laboratorio', discoveryLevel: 3, hints: { hint1: { en: "Check the current directory", es: 'Revisá el directorio actual' }, hint2: { en: 'cat flag.txt', es: 'cat flag.txt' } }, validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const } },
    ],
  }),
};

export const scenario_04: Scenario = buildScenario(SCENARIO_TEMPLATES_LFI.lfiRce());