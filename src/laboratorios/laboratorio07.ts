// ── laboratorios/laboratorio07.ts ───────────────────────────────────────
// Scenario 7 — Burp Suite: Web Application Pentesting
// La víctima es "CasinoVeo", una parodia de generador de imágenes y videos
// con IA en la nube (el chiste del nombre es "casi no veo": los renders
// salen tan difusos que casi no se ven), con login vulnerable a SQLi. El
// flujo profesional: primero se prueba manualmente en el navegador
// (' → error SQL, ' OR '1'='1 → bypass) y luego se repite/intercepta el
// ataque con Burp Suite (Proxy + Repeater), terminando con UNION SELECT
// para exfiltrar credenciales y la flag.

import { buildScenario, createFile, createLinuxFileSystem, COMMON_PORTS } from './templates';
import type { Scenario } from '../types';

const scenario07Data = {
  id: 'scenario-07',
  name: 'Burp Suite: Web Application Pentesting',
  tagline: 'SQLi manual in the browser, then exploit it like a pro with Burp Suite.',
  taglineEs: 'SQLi manual en el navegador y después explotación profesional con Burp Suite.',
  description: 'Browser testing of "CasinoVeo" (parody AI image & video generator) + Burp Suite (Proxy + Repeater) for SQLi exploitation.',
  descriptionEs: 'Testing en el navegador de "CasinoVeo" (generador parodia de imágenes y videos con IA) + Burp Suite (Proxy + Repeater) para SQLi.',
  tools: ['arp-scan', 'nmap', 'burpsuite'],
  accentColor: '#f97316',
  networkRange: '192.168.50.0/24',
  flags: {
    user: 'ZIL{BURP_REPEATER_MASTER}',
    root: 'ZIL{INTERCEPT_AND_EXPLOIT}',
  },
  credentials: {
    database: { user: 'root', pass: 'BurpSQLi@2024!' },
    webAdmin: { user: 'admin', pass: 'Admin@2024' },
    analyst: { user: 'analyst', pass: 'BurpAnalyst!' },
  },
  targetMachine: {
    id: 'lab-scenario-07-casinoveo',
    hostname: 'casinoveo-web',
    mac: '08:00:27:B8:7F:2A',
    os: 'Ubuntu 20.04 LTS',
    type: 'server',
    ports: [
      COMMON_PORTS.http('Apache httpd 2.4.52'),
      { port: 3306, protocol: 'tcp', state: 'filtered', service: 'mysql', version: 'MySQL 5.7.38' },
    ],
    webServer: 'Apache/2.4.52',
    application: 'CasinoVeo 2.0 - AI Image Generator (login vulnerable)',
    directories: [
      { path: '/', status: 200, description: 'Home page (CasinoVeo landing)' },
      { path: '/login', status: 200, description: 'Login form (VULNERABLE to SQLi)' },
      { path: '/admin', status: 403, description: 'Admin panel (restricted)' },
    ],
  },
  learningSteps: [
    {
      task: 'Network Discovery',
      taskEs: 'Descubrimiento de red',
      text: 'Scan the lab network to find live hosts. Your target is a machine running a web service.',
      textEs: 'Escaneá la red del laboratorio para encontrar hosts activos. Tu objetivo es una máquina que corre un servicio web.',
      discoveryLevel: 1,
      hints: {
        hint1: { en: 'Check your own IP (ip a): the target is on the same subnet as your machine', es: 'Revisá tu propia IP (ip a): el objetivo está en la misma subred que tu máquina' },
        hint2: { en: 'Any host-discovery tool works: arp-scan 192.168.50.0/24, nmap -sn 192.168.50.0/24 or netdiscover -r 192.168.50.0/24', es: 'Sirve cualquier herramienta de descubrimiento: arp-scan 192.168.50.0/24, nmap -sn 192.168.50.0/24 o netdiscover -r 192.168.50.0/24' },
      },
      validationCriteria: { type: 'discoveredHosts' as const, minHosts: 1 },
    },
    {
      task: 'Port Scan',
      taskEs: 'Escaneo de puertos',
      text: 'Scan the target to identify the web service',
      textEs: 'Escaneá el objetivo para identificar el servicio web',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'Use nmap to scan the target', es: 'Usá nmap para escanear el objetivo' },
        hint2: { en: 'nmap -sV <target-ip>', es: 'nmap -sV <ip-objetivo>' },
      },
      validationCriteria: { type: 'scanResults' as const, port: 80 },
    },
    {
      task: 'Browse CasinoVeo',
      taskEs: 'Navegar CasinoVeo',
      text: 'Open the site in the simulated browser (CyberBrowser). The target runs "CasinoVeo", a parody cloud AI image & video generator with a vulnerable login form',
      textEs: 'Abrí el sitio en el navegador simulado (CyberBrowser). El objetivo corre "CasinoVeo", un generador parodia de imágenes y videos con IA en la nube con un formulario de login vulnerable',
      discoveryLevel: 2,
      hints: {
        hint1: { en: 'Open CyberBrowser and navigate to http://<target-ip>/', es: 'Abrí CyberBrowser y navegá a http://<ip-objetivo>/' },
        hint2: { en: 'From the landing page, go to http://<target-ip>/login to reach the form', es: 'Desde la landing, andá a http://<ip-objetivo>/login para llegar al formulario' },
      },
      validationCriteria: { type: 'browserAction' as const, action: 'viewPage' as const, url: '/login' },
    },
    {
      task: 'Test SQLi in the Browser',
      taskEs: 'Probar SQLi en el navegador',
      text: "Test the login form manually: type a single quote (') as username and submit. The 500 page with a SQL syntax error reveals the injection point",
      textEs: 'Probá el formulario de login manualmente: escribí una comilla simple (\') como usuario y envialo. La página 500 con un error de sintaxis SQL revela el punto de inyección',
      discoveryLevel: 3,
      hints: {
        hint1: { en: "In the browser: username ' (or admin') and any password → Enter", es: "En el navegador: usuario ' (o admin') y cualquier contraseña → Enter" },
        hint2: { en: 'A 500 with "You have an error in your SQL syntax" means the input is interpolated straight into the query', es: 'Un 500 con "You have an error in your SQL syntax" significa que el input se interpola directo en la consulta' },
      },
      validationCriteria: { type: 'vulnerabilityFound' as const, vulnId: 'SQLi', status: 'detected' as const },
    },
    {
      task: 'Bypass Auth in the Browser',
      taskEs: 'Bypasear la auth en el navegador',
      text: "Bypass the authentication on the website: username ' OR '1'='1 with any password. The tautology makes the query always true",
      textEs: "Bypaseá la autenticación en el sitio web: usuario ' OR '1'='1 con cualquier contraseña. La tautología hace que la consulta sea siempre verdadera",
      discoveryLevel: 3,
      hints: {
        hint1: { en: "Tautology payload in the browser form: username ' OR '1'='1, password anything", es: "Payload de tautología en el formulario del navegador: usuario ' OR '1'='1, contraseña cualquiera" },
        hint2: { en: 'Once you see the premium dashboard, repeat the attack like a pro: intercept the POST with Burp Suite and exploit it from Repeater', es: 'Cuando veas el dashboard premium, repetí el ataque como un profesional: interceptá el POST con Burp Suite y explotá desde el Repeater' },
      },
      validationCriteria: { type: 'vulnerabilityFound' as const, vulnId: 'SQLi', status: 'confirmed' as const },
    },
    {
      task: 'Intercept With Burp Suite',
      taskEs: 'Interceptar con Burp Suite',
      text: 'Now the professional turn: open Burp Suite, intercept a POST /login request in the Proxy and send it to Repeater',
      textEs: 'Ahora el turno profesional: abrí Burp Suite, interceptá una request POST /login en el Proxy y envíala al Repeater',
      discoveryLevel: 3,
      hints: {
        hint1: { en: 'Proxy tab: method POST, URL http://<target-ip>/login, body username=admin&password=x → Intercept', es: 'Pestaña Proxy: method POST, URL http://<ip-objetivo>/login, body username=admin&password=x → Intercept' },
        hint2: { en: 'Click any history row to load the request into Repeater', es: 'Hacé clic en una fila del historial para cargar la request en el Repeater' },
      },
      validationCriteria: { type: 'httpRequest' as const, url: '/login' },
    },
    {
      task: 'Dump Data With UNION',
      taskEs: 'Extraer datos con UNION',
      text: 'From Repeater, run a UNION-based SQLi: dump the users table to find the MySQL root credentials',
      textEs: 'Desde el Repeater, corré una SQLi basada en UNION: volcá la tabla users para encontrar las credenciales de MySQL root',
      discoveryLevel: 4,
      hints: {
        hint1: { en: "Body: username=' UNION SELECT table_name FROM information_schema.tables--&password=x", es: "Body: username=' UNION SELECT table_name FROM information_schema.tables--&password=x" },
        hint2: { en: "To dump users: username=' UNION SELECT * FROM users-- — the MySQL root credentials appear in the response body", es: "Para volcar users: username=' UNION SELECT * FROM users-- — las credenciales de MySQL root aparecen en el body de la respuesta" },
      },
      validationCriteria: { type: 'foundCredentials' as const, service: 'mysql' as const },
    },
    {
      task: 'Capture the Flag',
      taskEs: 'Capturar la flag',
      text: 'The UNION dump exposes the users table: one row carries the root flag (role "flag"). Find ZIL{...} in the response',
      textEs: 'El volcado del UNION expone la tabla users: una fila guarda la flag de root (role "flag"). Encontrá ZIL{...} en la respuesta',
      discoveryLevel: 4,
      hints: {
        hint1: { en: 'Resend the UNION payload from Repeater — the flag travels inside the users table dump', es: 'Volvé a enviar el payload UNION desde el Repeater — la flag viaja dentro del volcado de la tabla users' },
        hint2: { en: 'Look for the row with role "flag": its password column holds ZIL{INTERCEPT_AND_EXPLOIT}', es: 'Buscá la fila con role "flag": su columna password tiene ZIL{INTERCEPT_AND_EXPLOIT}' },
      },
      validationCriteria: { type: 'fileRead' as const, fileType: 'flag' as const },
    },
  ],
};

export const scenario_07: Scenario = buildScenario({
  id: scenario07Data.id,
  name: scenario07Data.name,
  description: scenario07Data.descriptionEs,
  difficulty: 'Medium',
  category: 'Web' as const,
  networkRange: scenario07Data.networkRange,
  targetMachine: {
    id: scenario07Data.targetMachine.id,
    machine_info: {
      hostname: scenario07Data.targetMachine.hostname,
      mac: scenario07Data.targetMachine.mac,
      os: scenario07Data.targetMachine.os,
      status: 'up',
      type: scenario07Data.targetMachine.type,
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    ports: scenario07Data.targetMachine.ports,
    web_enumeration: {
      web_server: scenario07Data.targetMachine.webServer,
      cms: scenario07Data.targetMachine.application,
      directories: scenario07Data.targetMachine.directories,
    },
    files: [
      ...createLinuxFileSystem({ username: 'www-data', extraUsers: [{ username: 'admin', gecos: 'Web Admin' }, { username: 'analyst', gecos: 'Security Analyst' }] }),
      createFile('/var/www/html/index.php', `
<?php
// CasinoVeo 2.0 — Generador de imágenes con IA (login vulnerable)
// El formulario de login concatena el input directo en la query.
$username = isset($_POST['username']) ? $_POST['username'] : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($username && $password) {
  // VULNERABLE: interpolación directa — sin prepared statements.
  $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
  echo "Consultando la base de datos (directamente, sin sanitizar)...";
}
?>
      `.trim(), 'text'),
      createFile('/var/www/html/config.php', `
<?php
// Database configuration — DO NOT EXPOSE
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '${scenario07Data.credentials.database.pass}';
$db_name = 'casinoveo';
?>
      `.trim(), 'text', 'root', 'www-data', 0o640),
      createFile('/home/www-data/flag.txt', scenario07Data.flags.user, 'text', 'www-data', 'www-data', 0o400),
    ],
    known_passwords: {
      root: scenario07Data.credentials.database.pass,
      admin: scenario07Data.credentials.webAdmin.pass,
      analyst: scenario07Data.credentials.analyst.pass,
    },
    // La flag de root viaja en el volcado de la tabla users (UNION-based SQLi):
    // el motor HTTP la incluye en la response y emite fileRead.isFlag.
    flags: scenario07Data.flags,
  },
  learningSteps: scenario07Data.learningSteps,
});

export { scenario07Data };
