// ── commands/tools/curl.ts ─────────────────────────────────────────
// Simulador de peticiones HTTP (curl).
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta metadata (vulnerabilidad / credenciales) para que el lab valide.
// La lógica de responses vive en frameworks/http/ (compartida con Burp Suite).

import type { CommandContext, CommandResponse, FoundVulnerabilityData, FoundCredentialsData, FileEntry } from '../../types';
import { parseUrl, parseFormData, getVulnerablePage } from '../../frameworks/http';
import { buildLoginResponse } from '../../frameworks/http/response';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir, canEditFile } from '../../utils/permissions';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from '../builtin/umask';

export const CURL_HELP = `Usage: curl [options] <url>

Options:
  -X <method>    HTTP method (GET, POST)
  -d <data>      Send POST form data (e.g. 'user=admin&pass=123')
  -H <header>    Custom header (e.g. -H "X-Forwarded-For: 127.0.0.1")
  -A <agent>     User-Agent string
  -b <cookie>    Cookie data (e.g. -b "PHPSESSID=abc123")
  -u <user:pass> Basic auth credentials
  -k             Insecure: skip TLS verification
  -o <file>      Write output to file
  -i             Include response headers
  -s             Silent mode
  -v             Verbose output
  -L             Follow redirects
  -h             Display this help

Examples:
  curl http://<ip>/login
  curl -X POST http://<ip>/login -d "username=admin&password=x"
  curl http://<ip>/backup
  curl -H "X-Forwarded-For: 127.0.0.1" -b "PHPSESSID=abc" http://<ip>/admin`;

export const cmd_curl = {
  name: 'curl',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { allMachines, machine, currentDir } = ctx;
    if (args.includes('-h') || args.includes('--help')) {
      return { output: CURL_HELP };
    }

    let method = 'GET';
    let data: string | undefined;
    let silent = false;
    let verbose = false;
    let insecure = false;
    let basicAuth: string | undefined;
    let cookie: string | undefined;
    let userAgent: string | undefined;
    let outFile: string | null = null;
    const customHeaders: Array<[string, string]> = [];
    const rest: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-X') { method = (args[i + 1] || 'GET').toUpperCase(); i++; }
      else if (a === '-d') { data = args[i + 1] ?? ''; i++; }
      else if (a === '-s') { silent = true; }
      else if (a === '-v') { verbose = true; }
      else if (a === '-k' || a === '--insecure') { insecure = true; }
      else if (a === '-u' || a === '--user') { basicAuth = args[i + 1]; i++; }
      else if (a === '-b' || a === '--cookie') { cookie = args[i + 1]; i++; }
      else if (a === '-A' || a === '--user-agent') { userAgent = args[i + 1]; i++; }
      else if (a === '-i' || a === '-L') { /* headers/redirects: solo visual */ }
      else if (a === '-H' || a === '--header') {
        const raw = args[i + 1] ?? '';
        const sep = raw.indexOf(':');
        if (sep > 0) customHeaders.push([raw.slice(0, sep).trim(), raw.slice(sep + 1).trim()]);
        i++;
      }
      else if (a === '-o') { outFile = args[i + 1] ?? null; i++; }
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
      const resp = buildLoginResponse(target, username);
      body = resp.body;
      statusLine = `HTTP/1.1 ${resp.status} ${resp.statusText}`;
      foundVulnerability = resp.foundVulnerability;
      foundCredentials = resp.foundCredentials;
    } else {
      body = getVulnerablePage(target, parsed.path);
      if (parsed.path.replace(/\/+$/, '') === '/admin') statusLine = 'HTTP/1.1 403 Forbidden';
      else if (body.includes('404')) statusLine = 'HTTP/1.1 404 Not Found';
    }

    // Headers que viajan en httpRequest (visible en Burp Suite)
    const headers: Record<string, string> = { Host: parsed.host };
    for (const [k, v] of customHeaders) headers[k] = v;
    if (userAgent) headers['User-Agent'] = userAgent;
    if (cookie) headers['Cookie'] = headers['Cookie'] ? `${headers['Cookie']}; ${cookie}` : cookie;
    if (basicAuth) {
      const sep = basicAuth.indexOf(':');
      const user = sep === -1 ? basicAuth : basicAuth.slice(0, sep);
      const pass = sep === -1 ? '' : basicAuth.slice(sep + 1);
      headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
    }

    let output = '';
    if (!silent) {
      if (verbose) {
        output = `*   Trying ${parsed.host}...\n* Connected to ${parsed.host} (${parsed.host}) port ${parsed.port}\n`;
        if (insecure) output += `* SSL certificate verify skipped (-k)\n`;
        output += `> ${method} ${parsed.path} HTTP/1.1\n`;
        for (const [k, v] of Object.entries(headers)) output += `> ${k}: ${v}\n`;
        output += `>\n`;
      }
      if (foundVulnerability) {
        output += `[+] Vulnerabilidad SQLi ${foundVulnerability.status === 'confirmed' ? 'confirmada' : 'detectada'} en http://${parsed.host}${parsed.path}\n\n`;
      } else if (foundCredentials) {
        output += `[+] Credenciales MySQL descubiertas: root / ${foundCredentials.pass}\n\n`;
      }
      output += `${statusLine}\nContent-Type: text/html\n\n${body}`;
    } else {
      output = body;
    }

    // Popula httpRequest/httpResponse para que Burp Suite pueda tomar el historial.
    const statusParts = statusLine.split(' ');
    const status = parseInt(statusParts[1] ?? '200', 10);
    const statusText = statusParts.slice(2).join(' ') || 'OK';
    const httpRequest = { method, url, headers, body: data ?? '' };
    const httpResponse = { status, statusText, headers: { 'Content-Type': 'text/html' }, body };

    // -o <file>: persiste el cuerpo en el FS virtual (con permisos + umask)
    let filesChanged: FileEntry[] | undefined;
    let downloadedFile: FileEntry | undefined;
    if (outFile && machine) {
      const user = getCurrentUser(machine);
      const home = user.home ?? '/';
      const targetPath = normalizePath(resolvePath(outFile, currentDir || '/', home));
      const cleanPath = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath;
      const parentDir = findParentDir(machine, cleanPath);
      const existing = findFile(machine, cleanPath);
      if (existing && !canEditFile(machine, existing, user)) {
        return { output: `curl: Can't open '${outFile}': Permission denied`, isError: true, httpRequest, httpResponse };
      }
      if (!existing && !canCreateInDir(machine, parentDir, user)) {
        return { output: `curl: Can't open '${outFile}': Permission denied`, isError: true, httpRequest, httpResponse };
      }
      const ownership = existing
        ? { owner: existing.owner ?? user.username, group: existing.group ?? user.username, mode: existing.mode ?? applyUmask(0o644, ctx.umask ?? 0o022) }
        : defaultOwnership(machine, user, applyUmask(0o644, ctx.umask ?? 0o022));
      downloadedFile = buildNewFile(cleanPath, body, 'text', ownership);
      machine.files = [...machine.files.filter(f => f.path !== cleanPath), downloadedFile];
      filesChanged = [...machine.files];
    }

    const fileMeta = {
      ...(filesChanged && { filesChanged }),
      ...(downloadedFile && { downloadedFile }),
    };

    if (foundVulnerability && foundCredentials) {
      return { output, type: 'hybrid', foundVulnerability, foundCredentials, httpRequest, httpResponse, ...fileMeta };
    }
    if (foundVulnerability) {
      return { output, type: 'vuln', foundVulnerability, httpRequest, httpResponse, ...fileMeta };
    }
    if (foundCredentials) {
      return { output, type: 'creds', foundCredentials, httpRequest, httpResponse, ...fileMeta };
    }
    return { output, httpRequest, httpResponse, ...fileMeta };
  },
};
