// ── commands/tools/curl.ts ─────────────────────────────────────────
// Simulador de peticiones HTTP (curl)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta metadata (vulnerabilidad / credenciales) para que el lab valide.

import type { CommandContext, CommandResponse, Machine, FoundVulnerabilityData, FoundCredentialsData } from '../../types';

const CURL_HELP = `Usage: curl [options] <url>

Options:
  -X <method>    HTTP method (GET, POST)
  -d <data>      Send POST form data (e.g. 'user=admin&pass=123')
  -H <header>    Custom header
  -o <file>      Write output to file
  -i             Include response headers
  -s             Silent mode
  -v             Verbose output
  -L             Follow redirects
  -h             Display this help

Examples:
  curl http://<ip>/login
  curl -X POST http://<ip>/login -d "username=admin&password=x"
  curl http://<ip>/backup`;

interface ParsedUrl {
  host: string;
  port: number;
  path: string;
}

function parseUrl(raw: string): ParsedUrl | null {
  const m = raw.match(/^https?:\/\/([^/:]+)(?::(\d+))?([^?#]*)/i);
  if (!m) return null;
  return {
    host: m[1],
    port: m[2] ? parseInt(m[2], 10) : 80,
    path: m[3] || '/',
  };
}

function parseFormData(data: string): Record<string, string> {
  const out: Record<string, string> = {};
  data.split('&').forEach(pair => {
    const [k, ...rest] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

function loginPage(): string {
  return `<html>
<head><title>Secure Login</title></head>
<body>
  <h1>Secure Login</h1>
  <p>Please enter your credentials</p>
  <form action="/login" method="POST">
    <label>Username: <input type="text" name="username"></label><br>
    <label>Password: <input type="password" name="password"></label><br>
    <input type="submit" value="Login">
  </form>
  <p>Hint: Try SQL injection payloads like ' OR '1'='1</p>
</body>
</html>`;
}

function adminDenied(ip: string): string {
  return `<html>
<head><title>403 Forbidden</title></head>
<body>
  <h1>403 Forbidden</h1>
  <p>You don't have permission to access this page.</p>
  <p>Please login first: <a href="http://${ip}/login">Go to Login</a></p>
</body>
</html>`;
}

function backupDir(): string {
  return `<html>
<head><title>Backup Directory</title></head>
<body>
  <h1>Backup Directory</h1>
  <ul>
    <li><a href="/backup/database_dump.sql">database_dump.sql</a> (2.5 MB)</li>
    <li><a href="/backup/config_backup.tar.gz">config_backup.tar.gz</a> (1.1 MB)</li>
  </ul>
</body>
</html>`;
}

function homePage(ip: string): string {
  return `<html>
<head><title>Secure Web Application</title></head>
<body>
  <h1>Secure Web Application</h1>
  <p>Welcome to our secure login portal</p>
  <ul>
    <li><a href="http://${ip}/login">User Login</a></li>
    <li><a href="http://${ip}/admin">Admin Panel (restricted)</a></li>
  </ul>
  <p>Server: Apache/2.4.29 | Platform: PHP 7.2 | Database: MySQL 5.7</p>
</body>
</html>`;
}

function notFound(path: string): string {
  return `<html>
<head><title>404 Not Found</title></head>
<body>
  <h1>404 Not Found</h1>
  <p>The requested URL ${path} was not found on this server.</p>
</body>
</html>`;
}

function getVulnerablePage(target: Machine, path: string): string {
  const dir = target.web_enumeration?.directories?.find(d =>
    d.path === path || d.path.replace(/\/+$/, '') === path.replace(/\/+$/, '')
  );
  if (!dir) return notFound(path);

  switch (path.replace(/\/+$/, '')) {
    case '/login': return loginPage();
    case '/admin': return adminDenied(target.machine_info.ip);
    case '/backup': return backupDir();
    default: return homePage(target.machine_info.ip);
  }
}

export const cmd_curl = {
  name: 'curl',
  execute: (args: string[], { allMachines }: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) {
      return { output: CURL_HELP };
    }

    let method = 'GET';
    let data: string | undefined;
    let silent = false;
    let verbose = false;
    const rest: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-X') { method = (args[i + 1] || 'GET').toUpperCase(); i++; }
      else if (a === '-d') { data = args[i + 1] ?? ''; i++; }
      else if (a === '-s') { silent = true; }
      else if (a === '-v') { verbose = true; }
      else if (a === '-i' || a === '-L') { /* headers/redirects: solo visual */ }
      else if (a === '-H') { i++; }
      else if (a === '-o') { i++; }
      else if (a.startsWith('-') && a !== '-') { /* otros flags ignorados */ }
      else rest.push(a);
    }

    const url = rest.find(u => u.startsWith('http'));
    if (!url) {
      return { output: 'curl: no URL specified!\nUsage: curl [options] <url>', isError: true };
    }

    const parsed = parseUrl(url);
    if (!parsed) {
      return { output: `curl: (3) URL rejected: Malformed input to a URL function`, isError: true };
    }

    if (data !== undefined && method === 'GET') method = 'POST';

    const target = allMachines.find(m => m.machine_info.ip === parsed.host);
    if (!target || !target.web_enumeration) {
      return { output: `curl: (7) Failed to connect to ${parsed.host} port ${parsed.port}: Connection refused`, isError: true };
    }

    let body: string;
    let statusLine = 'HTTP/1.1 200 OK';
    let foundVulnerability: FoundVulnerabilityData | undefined;
    let foundCredentials: FoundCredentialsData | undefined;

    if (method === 'POST' && data !== undefined) {
      const form = parseFormData(data);
      const username = form['username'] ?? '';

      // SQLi auth bypass: accept common OR-based tautologies, case-insensitive,
      // with optional spaces around operators, single/double quotes, and trailing comment.
      // Require the opening quote (single or double) — bash strips unbalanced
      // quotes from unquoted args, mangling the payload; only inside double
      // quotes does the raw `' or '1'='1` survive intact.
      const sqliBypass = /['"]\s*or\s+['"]?1['"]?\s*=\s*['"]?1['"]?\s*(--|#)?/i;

      if (sqliBypass.test(username)) {
        body = `<html>
<head><title>Admin Dashboard</title></head>
<body>
  <h1>Admin Dashboard</h1>
  <p><strong>Success!</strong> SQL injection vulnerability exploited.</p>
  <p>Next Step: Use UNION-based SQL injection to extract database information.</p>
</body>
</html>`;
        foundVulnerability = {
          machineId: target.id,
          vulnId: 'SQLi',
          status: 'confirmed',
        };
      } else if (/['"]\s*union\s+select/i.test(username)) {
        body = `<html>
<head><title>Database Enumeration</title></head>
<body>
  <h1>Database Enumeration</h1>
  <pre>
+-----------------------+
| information_schema    |
| users                 |
| logs                  |
+-----------------------+
2 rows in set (0.01 sec)
  </pre>
  <p>Table: users</p>
  <pre>
+----+-----------+---------------+-----------------+--------+
| id | username  | password      | email           | role   |
+----+-----------+---------------+-----------------+--------+
|  1 | admin     | a6f62c4f...   | admin@int.local | root   |
|  2 | ftpuser   | ftp_dump_2024 | ftp@int.local   | ftp    |
|  3 | developer | e5f2a9c...   | dev@int.local   | user   |
+----+-----------+---------------+-----------------+--------+
  </pre>
  <p>MySQL credentials: root / SQLr00t@2024!</p>
  <p>[!] FTP backup account: <strong>ftpuser / ftp_dump_2024</strong> (dump in /srv/ftp)</p>
  <p>[!] Database backup exported to /srv/ftp/database_dump.sql — recover it via FTP.</p>
</body>
</html>`;
        foundCredentials = {
          machineId: target.id,
          user: 'root',
          pass: 'SQLr00t@2024!',
          file: '/srv/ftp/database_dump.sql',
          service: 'mysql',
        };
      } else if (username.includes("'")) {
        body = `<html>
<head><title>500 Internal Server Error</title></head>
<body>
  <h1>500 Internal Server Error</h1>
  <pre>You have an error in your SQL syntax; check the manual that
corresponds to your MySQL server version for the right syntax to
use near '${username}' at line 1</pre>
  <p><strong>[!] Vulnerabilidad SQLi detectada:</strong> el input se interpola directamente en una consulta SQL sin sanitizar.</p>
  <p>Next Step: Bypass the login with <code>' OR '1'='1</code> or extract data with UNION SELECT.</p>
</body>
</html>`;
        statusLine = 'HTTP/1.1 500 Internal Server Error';
        foundVulnerability = {
          machineId: target.id,
          vulnId: 'SQLi',
          status: 'detected',
        };
      } else {
        body = `<html>
<head><title>Login Failed</title></head>
<body>
  <h1>Invalid credentials</h1>
  <p>Access denied.</p>
</body>
</html>`;
        statusLine = 'HTTP/1.1 403 Forbidden';
      }
    } else {
      body = getVulnerablePage(target, parsed.path);
      if (parsed.path.replace(/\/+$/, '') === '/admin') statusLine = 'HTTP/1.1 403 Forbidden';
      else if (body.includes('404')) statusLine = 'HTTP/1.1 404 Not Found';
    }

    let output = '';
    if (!silent) {
      if (verbose) {
        output = `*   Trying ${parsed.host}...\n* Connected to ${parsed.host} (${parsed.host}) port ${parsed.port}\n> ${method} ${parsed.path} HTTP/1.1\n> Host: ${parsed.host}\n>\n`;
      }
      if (foundVulnerability) {
        output += `[+] Vulnerabilidad SQLi ${foundVulnerability.status === 'confirmed' ? 'confirmada' : 'detectada'} en http://${parsed.host}${parsed.path}\n\n`;
      } else if (foundCredentials) {
        output += `[+] Credenciales MySQL descubiertas: root / SQLr00t@2024!\n\n`;
      }
      output += `${statusLine}\nContent-Type: text/html\n\n${body}`;
    } else {
      output = body;
    }

    if (foundVulnerability && foundCredentials) {
      return { output, type: 'hybrid', foundVulnerability, foundCredentials };
    }
    if (foundVulnerability) {
      return { output, type: 'vuln', foundVulnerability };
    }
    if (foundCredentials) {
      return { output, type: 'creds', foundCredentials };
    }
    return { output };
  },
};
