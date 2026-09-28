// ── laboratorios/laboratorio08.ts ───────────────────────────────────────
// Scenario 8 — Webmail SquirrelMail → xrdp → PowerShell → potato
// Windows Server 2019 con Apache/PHP sirviendo SquirrelMail 1.4.22:
//   recon → webmail (CyberBrowser) → scanner msf → exploit CVE-2017-7692
//   → shell como svc_webmail → nota con la clave de helpdesk
//   → xrdp desde Kali → escritorio remoto con PowerShell
//   → descubrimiento del servicio SYSTEM en carpeta escribible
//   → potato → flag de administrador.
// Todo lo que se escala (potato) y todo lo que se valida (misiones) sigue
// siendo de los comandos genéricos: el lab solo declara datos y criteria.

import { buildScenario, createFile, createWindowsFileSystem, COMMON_PORTS } from './templates';
import type { Scenario } from '../types';

// Carpeta del servicio de backup: la mala configuración de permisos.
const BACKUP_DIR = 'C:\\Users\\Public\\svc-backup';

// Cuenta local de soporte: la abre el alumno con xrdp. No es admin
// (win.isAdmin false) → necesita potato para leer la flag. Se declara
// acá (y no dentro de scenario08Data) para que learningSteps pueda
// referenciarla sin referencias circulares.
const HELP_DESK = { user: 'helpdesk', pass: 'Helpdesk2024!' };

const scenario08Data = {
  id: 'scenario-08',
  name: 'Webmail RCE → xrdp → Escalada',
  tagline: 'Exploit a SquirrelMail 1.4.22, reuse the credentials over xrdp and escalate to admin with Potato.',
  taglineEs: 'Explotá SquirrelMail 1.4.22, reutilizá las credenciales por xrdp y escalá a admin con Potato.',
  description: 'A Windows host serving a vulnerable SquirrelMail webmail: get a shell through the webmail RCE, pivot to the desktop over RDP, find a badly configured SYSTEM service and escalate with Potato.',
  descriptionEs: 'Un Windows con un SquirrelMail vulnerable: lográ una shell por el RCE del webmail, pasá al escritorio por RDP, encontrá un servicio SYSTEM mal configurado y escalá con Potato.',
  tools: ['nmap', 'metasploit', 'xrdp', 'potato'],
  accentColor: '#f87171',
  networkRange: '192.168.60.0/24',
  flags: {
    // `root` es la clave que espera Machine.flags (la usa el HTTP sintético
    // para colar la flag en un volcado). Semánticamente acá es la flag del
    // administrador de Windows.
    root: 'ZIL{RDP_POTATO_ESCALATION}',
  },
  credentials: {
    // Cuenta local de soporte: la abre el alumno con xrdp (ver HELP_DESK).
    helpdesk: HELP_DESK,
  },
  targetMachine: {
    id: 'lab-scenario-08-win',
    hostname: 'WEBMAIL-SRV',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows Server 2019 Standard',
    type: 'server',
    ports: [
      COMMON_PORTS.https('Apache httpd 2.4.41'),
      COMMON_PORTS.rdp(),
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
    ],
  },
  learningSteps: [
    {
      task: 'Network Discovery',
      taskEs: 'Descubrimiento de red',
      text: 'Scan the lab network to find live hosts. Your target is a Windows server.',
      textEs: 'Escaneá la red del laboratorio para encontrar hosts activos. Tu objetivo es un servidor Windows.',
      discoveryLevel: 1,
      hints: {
        hint1: { en: 'Check your own IP (ip a): the target is on the same subnet', es: 'Revisá tu propia IP (ip a): el objetivo está en la misma subred' },
        hint2: { en: 'arp-scan 192.168.60.0/24 (or nmap -sn / netdiscover)', es: 'arp-scan 192.168.60.0/24 (o nmap -sn / netdiscover)' },
      },
      validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 },
    },
    {
      task: 'Port Scan the Web Server',
      taskEs: 'Escaneo de puertos del servidor web',
      text: 'Scan the target and identify the HTTPS service (443) that serves the webmail',
      textEs: 'Escaneá el objetivo e identificá el servicio HTTPS (443) que sirve el webmail',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'Use nmap against the target IP', es: 'Usá nmap contra la IP del objetivo' },
        hint2: { en: 'nmap -sV -p- <target-ip> — look for 443/tcp', es: 'nmap -sV -p- <ip-objetivo> — buscá 443/tcp' },
      },
      validationCriteria: { type: 'scanResults' as const, port: 443 },
    },
    {
      task: 'Browse the Webmail',
      taskEs: 'Explorar el webmail',
      text: 'Open the target in CyberBrowser and read the webmail version on the login page',
      textEs: 'Abrí el objetivo en CyberBrowser y leé la versión del webmail en la página de login',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'Navigate to http://<target-ip>/webmail', es: 'Navegá a http://<ip-objetivo>/webmail' },
        hint2: { en: 'The version is printed under the login form', es: 'La versión está debajo del formulario de login' },
      },
      validationCriteria: { type: 'browserAction' as const, action: 'viewPage' as const, url: '/webmail' },
    },
    {
      task: 'Scan the Webmail Version',
      taskEs: 'Escanear la versión del webmail',
      text: 'Confirm with Metasploit that the webmail is vulnerable to CVE-2017-7692',
      textEs: 'Confirmá con Metasploit que el webmail es vulnerable a CVE-2017-7692',
      discoveryLevel: 3,
      hints: {
        hint1: { en: 'msfconsole → use auxiliary/scanner/http/squirrelmail_version', es: 'msfconsole → use auxiliary/scanner/http/squirrelmail_version' },
        hint2: { en: 'set RHOSTS <target-ip> → set RPORT 443 → run', es: 'set RHOSTS <ip-objetivo> → set RPORT 443 → run' },
      },
      validationCriteria: { type: 'vulnerabilityFound' as const, vulnId: 'SquirrelMail 1.4.22' },
    },
    {
      task: 'Exploit the Webmail (CVE-2017-7692)',
      taskEs: 'Explotar el webmail (CVE-2017-7692)',
      text: 'Exploit the sendmail.cf injection to open a command shell on the target',
      textEs: 'Explotá la inyección de sendmail.cf para abrir una shell de comandos en el objetivo',
      discoveryLevel: 3,
      hints: {
        hint1: { en: 'use exploit/multi/http/squirrelmail_cgi_rce', es: 'use exploit/multi/http/squirrelmail_cgi_rce' },
        hint2: { en: 'set RHOSTS <target-ip> → run — the session opens as the webmail service account', es: 'set RHOSTS <ip-objetivo> → run — la sesión abre como la cuenta del servicio de correo' },
      },
      validationCriteria: { type: 'exploit' as const },
    },
    {
      task: 'Read the Webmail Attachment Note',
      taskEs: 'Leer la nota del adjunto del webmail',
      text: 'In the shell, read the note left in the webmail attachments folder: it has local credentials',
      textEs: 'En la shell, leé la nota que quedó en la carpeta de adjuntos del webmail: tiene credenciales locales',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'The note is under C:\\inetpub\\webmail\\attachments', es: 'La nota está en C:\\inetpub\\webmail\\attachments' },
        hint2: { en: 'dir C:\\inetpub\\webmail\\attachments then type nota.txt', es: 'dir C:\\inetpub\\webmail\\attachments y después type nota.txt' },
      },
      validationCriteria: { type: 'fileRead' as const, fileType: 'note' as const },
    },    {
      task: 'RDP Session with xrdp',
      taskEs: 'Sesión RDP con xrdp',
      text: 'From your Kali box, connect to the remote desktop with xrdp using the credentials from the note',
      textEs: 'Desde tu Kali, conectate al escritorio remoto con xrdp usando las credenciales de la nota',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'xrdp /v:<target-ip> /u:helpdesk /p:<password>', es: 'xrdp /v:<ip-objetivo> /u:helpdesk /p:<password>' },
        hint2: { en: 'The desktop opens with a PowerShell terminal you can use from the taskbar', es: 'El escritorio abre con una terminal PowerShell que podés usar desde la barra' },
      },
      validationCriteria: { type: 'foundCredentials' as const, user: HELP_DESK.user, service: 'rdp' },
    },
    {
      task: 'Find the Misconfigured Service',
      taskEs: 'Encontrar el servicio mal configurado',
      text: 'Read the config of the backup service: its binary lives in a folder that regular users can write',
      textEs: 'Leé la config del servicio de backup: su binario vive en una carpeta donde los usuarios pueden escribir',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'List C:\\Users\\Public — the install folder of the backup service is there', es: 'Listá C:\\Users\\Public — ahí está la carpeta de instalación del servicio de backup' },
        hint2: { en: `svc-backup.ini says ObjectName=LocalSystem: that token is what Potato steals`, es: `svc-backup.ini dice ObjectName=LocalSystem: ese token es el que roba Potato` },
      },
      validationCriteria: { type: 'fileRead' as const, fileType: 'any' as const, path: BACKUP_DIR },
    },
    {
      task: 'Escalate With Potato',
      taskEs: 'Escalar con Potato',
      text: 'You are still a standard user: escalate to administrator with Potato, from the PowerShell of the remote desktop',
      textEs: 'Todavía sos un usuario estándar: escalá a administrador con Potato, desde el PowerShell del escritorio remoto',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'Run potato from the PowerShell window of the remote desktop', es: 'Corré potato desde la ventana PowerShell del escritorio remoto' },
        hint2: { en: 'potato steals the SYSTEM token of the service and elevates your session', es: 'potato roba el token SYSTEM del servicio y eleva tu sesión' },
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
  // 'Web' (y no 'Network') porque el CyberBrowser solo emite las acciones de
  // navegación —y valida la misión del webmail— cuando la categoría del
  // lab es Web (ver DesktopTerminal: scenarioHasWeb).
  category: 'Web',
  networkRange: scenario08Data.networkRange,
  // Credenciales del RDP (3389) inyectadas en el puerto; la misma clave
  // vive en known_passwords y en la nota del webmail.
  portCredentials: { 'ms-wbt-server': scenario08Data.credentials.helpdesk },
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
    win: { currentUser: 'helpdesk', isAdmin: false, computerName: 'WEBMAIL-SRV' },
    // La clave de la nota (misma fuente) también la valida el login RDP.
    known_passwords: { [scenario08Data.credentials.helpdesk.user]: scenario08Data.credentials.helpdesk.pass },
    flags: scenario08Data.flags,
    // El CMS lo lee el FakeBrowser para mostrar el webmail y el scanner de
    // Metasploit paraconfirmar la versión: una sola fuente para los dos.
    web_enumeration: { web_server: 'apache', cms: 'squirrelmail', directories: [] },
    files: [
      // FS base neutro de Windows (la plantilla no trae archivos de usuario).
      ...createWindowsFileSystem({ username: 'helpdesk', computerName: 'WEBMAIL-SRV' }),
      // ── Webmail servido desde C:\inetpub\webmail ────────────────────
      createFile('/C:/inetpub/webmail/.dir', '', 'text', 'Administrator', 'Administrators', 0o755),
      createFile('/C:/inetpub/webmail/src/.dir', '', 'text', 'Administrator', 'Administrators', 0o755),
      createFile(
        '/C:/inetpub/webmail/src/login.php',
        "<?php\n// SquirrelMail 1.4.22 - webmail del servidor\nsession_start();\nif (isset($_POST['username'])) { $_SESSION['user'] = $_POST['username']; header('Location: ../src/inbox.php'); }\n?>\n<html><body><form method=\"post\" action=\"login.php\">Webmail — SquirrelMail 1.4.22</form></body></html>",
        'text', 'Administrator', 'Administrators', 0o644,
      ),
      // Adjuntos del webmail: la nota con la clave del usuario local.
      // 0644 a propósito: la cuenta del servicio (y el alumno, ya en la
      // máquina) la puede leer sin escalar.
      createFile('/C:/inetpub/webmail/attachments/.dir', '', 'text', 'Administrator', 'Administrators', 0o755),
      createFile(
        '/C:/inetpub/webmail/attachments/nota.txt',
        `Para: soporte\nDe: IT Service Desk\nAsunto: Credenciales del escritorio remoto\n\nHola,\n\nPara el escritorio remoto usen la cuenta de soporte:\n\n  usuario: ${scenario08Data.credentials.helpdesk.user}\n  clave:   ${scenario08Data.credentials.helpdesk.pass}\n\nLa cuenta corre en un escritorio bloqueado, no en el servidor.\nSaludos,\nIT`,
        'text', 'Administrator', 'Users', 0o644,
      ),
      // ── La mala configuración de permisos ───────────────────────────
      // Carpeta en C:\Users\Public: cualquier usuario autenticado puede
      // escribir. El servicio corre como LocalSystem desde ahí.
      createFile('/C:/Users/Public/.dir', '', 'text', 'Administrators', 'Users', 0o755),
      createFile(
        '/C:/Users/Public/svc-backup/.dir',
        '', 'text', 'Users', 'Users', 0o777,
      ),
      createFile(
        '/C:/Users/Public/svc-backup/svc-backup.ini',
        [
          '[BackupSvc]',
          'Description=Copia de seguridadcorporativa (corre como LocalSystem)',
          'ObjectName=LocalSystem',
          'BinPath=C:\\Users\\Public\\svc-backup\\svc-backup.exe',
          'Start=auto',
          '',
          '; Nota de la instalacion: la carpeta quedo con permisos heredados',
          '; de Users para que el agente pudiera escribir los respaldos.',
          '; NO cambiar: el servicio corre con la cuenta de sistema.',
        ].join('\n'),
        'text', 'Users', 'Users', 0o666,
      ),
      createFile(
        '/C:/Users/Public/svc-backup/svc-backup.exe',
        '[PE binary - svc-backup.exe]', 'binary', 'Users', 'Users', 0o666,
      ),
      // ── Home de helpdesk + flag de administrador ───────────────────
      createFile('/C:/Users/helpdesk/.dir', '', 'text', 'helpdesk', 'Users', 0o755),
      createFile('/C:/Users/helpdesk/Desktop/.dir', '', 'text', 'helpdesk', 'Users', 0o755),
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
