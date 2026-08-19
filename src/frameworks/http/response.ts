// ── frameworks/http/response.ts ───────────────────────────────────
// Generador de respuestas HTTP sintéticas según target + request.
// Extracción de la lógica que estaba en commands/tools/curl.ts para que
// tanto curl como Burp Suite la reutilicen.

import type { Machine, FoundVulnerabilityData, FoundCredentialsData, FileReadData } from '../../types';
import { classifySqli, isCasinoVeo, sqlErrorBody, dashboardBody } from './casinoveo';
import * as casino from './casinoveo';

// ── Páginas HTML sintéticas ────────────────────────────────────────

export function loginPage(): string {
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

export function adminDenied(ip: string): string {
  return `<html>
<head><title>403 Forbidden</title></head>
<body>
  <h1>403 Forbidden</h1>
  <p>You don't have permission to access this page.</p>
  <p>Please login first: <a href="http://${ip}/login">Go to Login</a></p>
</body>
</html>`;
}

export function backupDir(): string {
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

export function homePage(ip: string): string {
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

export function notFound(path: string): string {
  return `<html>
<head><title>404 Not Found</title></head>
<body>
  <h1>404 Not Found</h1>
  <p>The requested URL ${path} was not found on this server.</p>
</body>
</html>`;
}

// Resuelve el body de la página según el path declarado en web_enumeration.
export function getVulnerablePage(target: Machine, path: string): string {
  const dir = target.web_enumeration?.directories?.find(d =>
    d.path === path || d.path.replace(/\/+$/, '') === path.replace(/\/+$/, '')
  );
  if (!dir) return notFound(path);

  const clean = path.replace(/\/+$/, '');
  if (isCasinoVeo(target)) {
    switch (clean) {
      case '/login': return casino.loginPage();
      case '/admin': return casino.adminDenied(target.machine_info.ip);
      default: return casino.homePage(target.machine_info.ip);
    }
  }

  switch (clean) {
    case '/login': return loginPage();
    case '/admin': return adminDenied(target.machine_info.ip);
    case '/backup': return backupDir();
    default: return homePage(target.machine_info.ip);
  }
}

// ── Resultado de una transacción HTTP ──────────────────────────────

export interface SyntheticResponse {
  status: number;
  statusText: string;
  body: string;
  foundVulnerability?: FoundVulnerabilityData;
  foundCredentials?: FoundCredentialsData;
  fileRead?: FileReadData;
}

// Construye la response sintética para una POST contra /login (SQLi).
export function buildLoginResponse(
  target: Machine,
  username: string
): SyntheticResponse {
  const casinoTarget = isCasinoVeo(target);

  if (classifySqli(username) === 'bypass') {
    return {
      status: 200,
      statusText: 'OK',
      body: casinoTarget ? dashboardBody() : `<html>
<head><title>Admin Dashboard</title></head>
<body>
  <h1>Admin Dashboard</h1>
  <p><strong>Success!</strong> SQL injection vulnerability exploited.</p>
  <p>Next Step: Use UNION-based SQL injection to extract database information.</p>
</body>
</html>`,
      foundVulnerability: {
        machineId: target.id,
        vulnId: 'SQLi',
        status: 'confirmed',
      },
    };
  }

  if (/['"]\s*union\s+select/i.test(username)) {
    // Volcado dinámico: credenciales y flags se toman de la máquina objetivo
    // (known_passwords + flags), no están hardcodeadas — cada lab expone lo suyo.
    const rootPass = target.known_passwords?.['root'] ?? 'SQLr00t@2024!';
    const ftpCreds = target.scan_results.ports.find(
      p => p.service?.toLowerCase() === 'ftp' && p.credentials
    )?.credentials;
    const flag = target.flags?.root;

    let rowId = 1;
    const userRows = Object.entries(target.known_passwords ?? {})
      .filter(([u]) => u !== 'root')
      .map(([u]) => `| ${rowId++} | ${u.padEnd(9)} | hash_${u}_x9f2 | ${u}@int.local | user   |`);
    const flagRow = flag
      ? [`| ${rowId} | ${'root'.padEnd(9)} | ${flag} | root@int.local | flag   |`]
      : [];
    const rows = userRows.concat(flagRow);
    if (rows.length === 0) {
      rows.push(`| 1 | ${'admin'.padEnd(9)} | hash_admin_x9f2 | admin@int.local | user   |`);
    }

    const ftpLines = ftpCreds
      ? `\n  <p>[!] FTP backup account: <strong>${ftpCreds.user} / ${ftpCreds.pass}</strong> (dump in /srv/ftp)</p>\n  <p>[!] Database backup exported to /srv/ftp/database_dump.sql — recover it via FTP.</p>`
      : '';
    const flagLine = flag
      ? `\n  <p><strong>[★] root flag: ${flag}</strong></p>`
      : '';

    return {
      status: 200,
      statusText: 'OK',
      body: `<html>
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
+----+-----------+------------------+-----------------+--------+
| id | username  | password         | email           | role   |
+----+-----------+------------------+-----------------+--------+
${rows.join('\n')}
+----+-----------+------------------+-----------------+--------+
  </pre>
  <p>MySQL credentials: root / ${rootPass}</p>${ftpLines}${flagLine}
</body>
</html>`,
      foundCredentials: {
        machineId: target.id,
        user: 'root',
        pass: rootPass,
        file: ftpCreds ? '/srv/ftp/database_dump.sql' : '/var/lib/mysql/users.ibd',
        service: 'mysql',
      },
      fileRead: flag
        ? { path: 'users table (SQL dump)', content: flag, isFlag: true, isNote: false, isPayload: false }
        : undefined,
    };
  }

  if (classifySqli(username) === 'error') {
    return {
      status: 500,
      statusText: 'Internal Server Error',
      body: casino ? sqlErrorBody(username) : `<html>
<head><title>500 Internal Server Error</title></head>
<body>
  <h1>500 Internal Server Error</h1>
  <pre>You have an error in your SQL syntax; check the manual that
corresponds to your MySQL server version for the right syntax to
use near '${username}' at line 1</pre>
  <p><strong>[!] Vulnerabilidad SQLi detectada:</strong> el input se interpola directamente en una consulta SQL sin sanitizar.</p>
  <p>Next Step: Bypass the login with <code>' OR '1'='1</code> or extract data with UNION SELECT.</p>
</body>
</html>`,
      foundVulnerability: {
        machineId: target.id,
        vulnId: 'SQLi',
        status: 'detected',
      },
    };
  }

  return {
    status: 403,
    statusText: 'Forbidden',
    body: `<html>
<head><title>Login Failed</title></head>
<body>
  <h1>Invalid credentials</h1>
  <p>Access denied.</p>
</body>
</html>`,
  };
}

// Resuelve una response synthética para cualquier método/path contra target.
export function buildSyntheticResponse(
  target: Machine,
  method: string,
  path: string,
  body: string | undefined
): SyntheticResponse {
  if (method === 'POST' && body !== undefined) {
    const form = parseSimpleForm(body);
    const username = form['username'] ?? '';
    if (path.replace(/\/+$/, '') === '/login') {
      return buildLoginResponse(target, username);
    }
    // POST a otros paths: fallback genérico 405
    return {
      status: 405,
      statusText: 'Method Not Allowed',
      body: '<html><body><h1>405 Method Not Allowed</h1></body></html>',
    };
  }

  // GET: resolver por path declarado en web_enumeration
  const pageBody = getVulnerablePage(target, path);
  const clean = path.replace(/\/+$/, '');
  let status = 200;
  let statusText = 'OK';
  if (clean === '/admin') {
    status = 403;
    statusText = 'Forbidden';
  } else if (pageBody.includes('404')) {
    status = 404;
    statusText = 'Not Found';
  }
  return { status, statusText, body: pageBody };
}

// ── Helpers ────────────────────────────────────────────────────────

function parseSimpleForm(data: string): Record<string, string> {
  const out: Record<string, string> = {};
  data.split('&').forEach(pair => {
    const [k, ...rest] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}
