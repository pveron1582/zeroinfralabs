// ── commands/tools/curl.ts ─────────────────────────────────────────
// Simulador de peticiones HTTP (curl).
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta metadata (vulnerabilidad / credenciales) para que el lab valide.
// La lógica de responses vive en frameworks/http/ (compartida con Burp Suite).

import type { CommandContext, CommandResponse, FoundVulnerabilityData, FoundCredentialsData } from '../../types';
import { parseUrl, parseFormData, getVulnerablePage } from '../../frameworks/http';
import { buildLoginResponse } from '../../frameworks/http/response';

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

    let output = '';
    if (!silent) {
      if (verbose) {
        output = `*   Trying ${parsed.host}...\n* Connected to ${parsed.host} (${parsed.host}) port ${parsed.port}\n> ${method} ${parsed.path} HTTP/1.1\n> Host: ${parsed.host}\n>\n`;
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
    const httpRequest = { method, url, headers: { Host: parsed.host }, body: data ?? '' };
    const httpResponse = { status, statusText, headers: { 'Content-Type': 'text/html' }, body };

    if (foundVulnerability && foundCredentials) {
      return { output, type: 'hybrid', foundVulnerability, foundCredentials, httpRequest, httpResponse };
    }
    if (foundVulnerability) {
      return { output, type: 'vuln', foundVulnerability, httpRequest, httpResponse };
    }
    if (foundCredentials) {
      return { output, type: 'creds', foundCredentials, httpRequest, httpResponse };
    }
    return { output, httpRequest, httpResponse };
  },
};
