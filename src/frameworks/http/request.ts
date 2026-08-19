// ── frameworks/http/request.ts ────────────────────────────────────
// Parsing de requests HTTP sintéticas (Burp + curl).

import type { HttpRequestData } from '../../types';

export interface ParsedUrl {
  host: string;
  port: number;
  path: string;
  raw: string;
}

export function parseUrl(raw: string): ParsedUrl | null {
  const m = raw.match(/^https?:\/\/([^/:]+)(?::(\d+))?([^?#]*)/i);
  if (!m) return null;
  return {
    host: m[1],
    port: m[2] ? parseInt(m[2], 10) : 80,
    path: m[3] || '/',
    raw,
  };
}

export function parseFormData(data: string): Record<string, string> {
  const out: Record<string, string> = {};
  data.split('&').forEach(pair => {
    const [k, ...rest] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

// Arma un body de request en texto plano (formato HTTP crudo, estilo Burp).
// Usa CRLF (\r\n) como el HTTP real; el editor raw de Burp Repeater lo muestra
// así y parseRawRequest tolera tanto \r\n como \n.
export function buildRawRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const parsed = parseUrl(url);
  const path = parsed?.path ?? '/';
  const host = parsed?.host ?? '';
  const headerLines = Object.entries({ Host: host, ...headers }).map(
    ([k, v]) => `${k}: ${v}`
  );
  const head = `${method} ${path} HTTP/1.1\r\n${headerLines.join('\r\n')}`;
  return body ? `${head}\r\n\r\n${body}` : `${head}\r\n`;
}

// Convierte una request HTTP cruda (request line + headers + body) de vuelta a
// HttpRequestData. Es el inverso de buildRawRequest, usado por el Repeater
// (edición raw) y el flujo de Intercept (Forward tras editar). Tolera \r\n y \n,
// y el target puede ser path relativo (`/login`) o forma absoluta
// (`http://host/login`). Devuelve null si la primera línea es inválida o falta
// el Host (necesario para reconstruir la URL).
export function parseRawRequest(raw: string): HttpRequestData | null {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const m = (lines[0] ?? '').match(/^(\S+)\s+(\S+)(?:\s+HTTP\/\S+)?$/i);
  if (!m) return null;
  const method = m[1].toUpperCase();
  const target = m[2];

  const headers: Record<string, string> = {};
  let idx = 1;
  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line.trim()) break;
    const c = line.indexOf(':');
    if (c > 0) {
      const k = line.slice(0, c).trim();
      const v = line.slice(c + 1).trim();
      if (k) headers[k] = v;
    }
  }
  const body = lines.slice(idx + 1).join('\n');

  let url: string;
  if (/^https?:\/\//i.test(target)) {
    url = target;
  } else {
    const host = headers['Host'] ?? headers['host'] ?? '';
    if (!host) return null;
    url = `http://${host}${target}`;
  }
  return { method, url, headers, body };
}

// Arma una response HTTP cruda (status + headers + body) estilo Burp.
export function buildRawResponse(
  status: number,
  statusText: string,
  headers: Record<string, string>,
  body: string
): string {
  const headerLines = Object.entries({
    'Content-Type': 'text/html',
    ...headers,
  }).map(([k, v]) => `${k}: ${v}`);
  return `HTTP/1.1 ${status} ${statusText}\r\n${headerLines.join('\r\n')}\r\n\r\n${body}`;
}
