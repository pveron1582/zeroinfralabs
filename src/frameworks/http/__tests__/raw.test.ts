// ── frameworks/http/__tests__/raw.test.ts ───────────────────────────
// buildRawRequest / parseRawRequest: serialización y parseo de requests HTTP
// crudas estilo Burp (Repeater + flujo de Intercept).

import { describe, it, expect } from 'vitest';
import { buildRawRequest, parseRawRequest } from '../request';

describe('frameworks/http — buildRawRequest', () => {
  it('debe serializar GET con Host y CRLF', () => {
    const raw = buildRawRequest('GET', 'http://192.168.1.10/login', {}, '');
    expect(raw).toBe('GET /login HTTP/1.1\r\nHost: 192.168.1.10\r\n');
  });

  it('debe incluir headers extra y body separado por línea en blanco', () => {
    const raw = buildRawRequest('POST', 'http://192.168.1.10/login', { 'Content-Type': 'application/x-www-form-urlencoded' }, 'username=admin&password=x');
    expect(raw).toContain('POST /login HTTP/1.1\r\nHost: 192.168.1.10\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nusername=admin&password=x');
  });

  it('debe mantener el puerto en el Host', () => {
    const raw = buildRawRequest('GET', 'http://192.168.1.10:8080/admin', {}, '');
    expect(raw).toBe('GET /admin HTTP/1.1\r\nHost: 192.168.1.10\r\n');
  });

  it('debe defaultear path a /', () => {
    const raw = buildRawRequest('GET', 'http://192.168.1.10', {}, '');
    expect(raw.startsWith('GET / HTTP/1.1\r\n')).toBe(true);
  });
});

describe('frameworks/http — parseRawRequest', () => {
  it('debe parsear una request cruda con \n', () => {
    const req = parseRawRequest('POST /login HTTP/1.1\nHost: 192.168.1.10\nContent-Type: application/x-www-form-urlencoded\n\nusername=admin&password=x');
    expect(req).toEqual({
      method: 'POST',
      url: 'http://192.168.1.10/login',
      headers: { Host: '192.168.1.10', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'username=admin&password=x',
    });
  });

  it('debe parsear una request cruda con \r\n (estilo Burp)', () => {
    const req = parseRawRequest('GET / HTTP/1.1\r\nHost: 10.0.0.5\r\n\r\n');
    expect(req?.method).toBe('GET');
    expect(req?.url).toBe('http://10.0.0.5/');
    expect(req?.body).toBe('');
  });

  it('debe aceptar URL absoluta en la request line', () => {
    const req = parseRawRequest('GET http://192.168.1.10/admin HTTP/1.1\r\nHost: 192.168.1.10\r\n\r\n');
    expect(req?.url).toBe('http://192.168.1.10/admin');
  });

  it('debe retornar null si la primera línea no es una request line válida', () => {
    expect(parseRawRequest('')).toBeNull();
    expect(parseRawRequest('GET')).toBeNull();
    expect(parseRawRequest('GET /path')).toBeNull();
  });

  it('debe retornar null si falta el Host (no se puede reconstruir la URL)', () => {
    expect(parseRawRequest('GET /login HTTP/1.1\r\n\r\n')).toBeNull();
  });

  it('debe ignorar el protocolo HTTP en la request line si falta', () => {
    const req = parseRawRequest('GET /login\r\nHost: 192.168.1.10\r\n\r\n');
    expect(req?.method).toBe('GET');
    expect(req?.url).toBe('http://192.168.1.10/login');
  });
});

describe('frameworks/http — roundtrip raw', () => {
  it('serializar → parsear debe preservar method/url/body', () => {
    const original = {
      method: 'POST',
      url: 'http://192.168.1.10/login',
      headers: { Host: '192.168.1.10' },
      body: "username=' OR '1'='1&password=x",
    };
    const raw = buildRawRequest(original.method, original.url, original.headers, original.body);
    const parsed = parseRawRequest(raw);
    expect(parsed).toEqual(original);
  });

  it('el parseo debe tolerar headers con espacios alrededor del ":"', () => {
    const req = parseRawRequest('GET /login HTTP/1.1\r\nHost : 192.168.1.10\r\n\r\n');
    expect(req?.headers['Host']).toBe('192.168.1.10');
  });
});