import { describe, it, expect } from 'vitest';
import { parseUrl, parseFormData } from '../request';
import { buildSyntheticResponse, buildLoginResponse, getVulnerablePage } from '../response';
import type { Machine } from '../../../types';

function mockWebMachine(ip: string = '192.168.1.10'): Machine {
  return {
    id: 'test-web',
    machine_info: { hostname: 'target', ip, mac: '08:00:27:AA:BB:CC', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 1,
    web_enumeration: {
      web_server: 'Apache/2.4.52',
      cms: 'PHP Portal',
      directories: [
        { path: '/', status: 200, description: 'Home' },
        { path: '/login', status: 200, description: 'Login form' },
        { path: '/admin', status: 403, description: 'Admin' },
        { path: '/backup', status: 200, description: 'Backup dir' },
      ],
    },
    scan_results: { ports: [] },
    learning_steps: [],
    files: [],
  } as Machine;
}

describe('frameworks/http — parseUrl', () => {
  it('debe parsear URL simple', () => {
    const r = parseUrl('http://192.168.1.10/login');
    expect(r?.host).toBe('192.168.1.10');
    expect(r?.port).toBe(80);
    expect(r?.path).toBe('/login');
  });

  it('debe parsear URL con puerto', () => {
    const r = parseUrl('http://192.168.1.10:8080/admin');
    expect(r?.port).toBe(8080);
    expect(r?.path).toBe('/admin');
  });

  it('debe retornar null para URL inválida', () => {
    expect(parseUrl('not-a-url')).toBeNull();
  });

  it('debe defaultear path a /', () => {
    const r = parseUrl('http://192.168.1.10');
    expect(r?.path).toBe('/');
  });
});

describe('frameworks/http — parseFormData', () => {
  it('debe parsear form data simple', () => {
    expect(parseFormData('username=admin&password=x')).toEqual({
      username: 'admin',
      password: 'x',
    });
  });

  it('deba decodificar URL-encoded', () => {
    expect(parseFormData('q=hello%20world')).toEqual({ q: 'hello world' });
  });

  it('debe retornar {} para cadena vacía', () => {
    expect(parseFormData('')).toEqual({});
  });
});

describe('frameworks/http — getVulnerablePage', () => {
  const target = mockWebMachine();

  it('debe retornar login page para /login', () => {
    const page = getVulnerablePage(target, '/login');
    expect(page).toContain('<form');
    expect(page).toContain('action="/login"');
    expect(page).toMatch(/SQL injection/i);
  });

  it('debe retornar 403 page para /admin', () => {
    const page = getVulnerablePage(target, '/admin');
    expect(page).toContain('403 Forbidden');
  });

  it('debe retornar backup dir page para /backup', () => {
    const page = getVulnerablePage(target, '/backup');
    expect(page).toContain('Backup Directory');
  });

  it('debe retornar 404 para path no declarado', () => {
    const page = getVulnerablePage(target, '/nonexistent');
    expect(page).toContain('404 Not Found');
  });
});

describe('frameworks/http — buildLoginResponse (SQLi)', () => {
  const target = mockWebMachine('192.168.50.11');

  it('debe confirmar SQLi con OR tautology', () => {
    const r = buildLoginResponse(target, "' OR '1'='1");
    expect(r.status).toBe(200);
    expect(r.body).toContain('Success');
    expect(r.foundVulnerability?.vulnId).toBe('SQLi');
    expect(r.foundVulnerability?.status).toBe('confirmed');
  });

  it('debe confirmar SQLi con tautology con doble quotes', () => {
    const r = buildLoginResponse(target, '" OR "1"="1');
    expect(r.foundVulnerability?.status).toBe('confirmed');
  });

  it('debe extraer credenciales con UNION SELECT', () => {
    const r = buildLoginResponse(target, "' UNION SELECT * FROM users--");
    expect(r.status).toBe(200);
    expect(r.body).toContain('Database Enumeration');
    expect(r.foundCredentials?.user).toBe('root');
    expect(r.foundCredentials?.service).toBe('mysql');
  });

  it('debe detectar SQLi con un solo quote (500 error)', () => {
    const r = buildLoginResponse(target, "admin'");
    expect(r.status).toBe(500);
    expect(r.body).toContain('SQL syntax');
    expect(r.foundVulnerability?.status).toBe('detected');
  });

  it('debe retornar 403 para credenciales válidas pero no inyección', () => {
    const r = buildLoginResponse(target, 'admin');
    expect(r.status).toBe(403);
    expect(r.body).toContain('Invalid credentials');
    expect(r.foundVulnerability).toBeUndefined();
  });

  it('debe ignorar password en la detección (solo username importa)', () => {
    const r = buildLoginResponse(target, "' OR '1'='1");
    // La detección sucede solo con username — password no se valida.
    expect(r.foundVulnerability).toBeDefined();
  });
});

describe('frameworks/http — buildSyntheticResponse (GET)', () => {
  const target = mockWebMachine();

  it('GET / debe retornar 200 + home', () => {
    const r = buildSyntheticResponse(target, 'GET', '/', undefined);
    expect(r.status).toBe(200);
    expect(r.body).toContain('Secure Web Application');
  });

  it('GET /admin debe retornar 403', () => {
    const r = buildSyntheticResponse(target, 'GET', '/admin', undefined);
    expect(r.status).toBe(403);
  });

  it('GET /nonexistent debe retornar 404', () => {
    const r = buildSyntheticResponse(target, 'GET', '/nonexistent', undefined);
    expect(r.status).toBe(404);
  });
});

describe('frameworks/http — buildSyntheticResponse (POST)', () => {
  const target = mockWebMachine();

  it('POST /login con SQLi bypass debe confirmar vuln', () => {
    const r = buildSyntheticResponse(target, 'POST', '/login', "username=' OR '1'='1&password=x");
    expect(r.status).toBe(200);
    expect(r.foundVulnerability?.status).toBe('confirmed');
  });

  it('POST a path no /login debe retornar 405', () => {
    const r = buildSyntheticResponse(target, 'POST', '/admin', 'data=x');
    expect(r.status).toBe(405);
  });
});

describe('frameworks/http — branding CasinoVeo (Lab 07)', () => {
  const casinoTarget = (): Machine => ({
    ...mockWebMachine('192.168.50.11'),
    id: 'lab-scenario-07-casinoveo',
    machine_info: { ...mockWebMachine('192.168.50.11').machine_info, hostname: 'casinoveo-web' },
    web_enumeration: {
      web_server: 'Apache/2.4.52',
      cms: 'CasinoVeo 2.0 - AI Image Generator (login vulnerable)',
      directories: [
        { path: '/', status: 200, description: 'Home page (CasinoVeo landing)' },
        { path: '/login', status: 200, description: 'Login form (VULNERABLE to SQLi)' },
        { path: '/admin', status: 403, description: 'Admin panel (restricted)' },
      ],
    },
  });

  it('GET / debe mostrar la landing de CasinoVeo', () => {
    const r = buildSyntheticResponse(casinoTarget(), 'GET', '/', undefined);
    expect(r.status).toBe(200);
    expect(r.body).toContain('CasinoVeo');
    expect(r.body).toContain('Casi-No-Veo v2');
  });

  it('GET /login debe mostrar el login de CasinoVeo', () => {
    const r = buildSyntheticResponse(casinoTarget(), 'GET', '/login', undefined);
    expect(r.body).toContain('CasinoVeo');
    expect(r.body).toContain('<form');
  });

  it("comilla simple → 500 con error SQL y branding CasinoVeo", () => {
    const r = buildSyntheticResponse(casinoTarget(), 'POST', '/login', "username=admin'&password=x");
    expect(r.status).toBe(500);
    expect(r.body).toContain('SQL syntax');
    expect(r.body).toContain('CasinoVeo');
    expect(r.foundVulnerability?.status).toBe('detected');
  });

  it("' OR '1'='1 → 200 con bypass y SQLi confirmed", () => {
    const r = buildSyntheticResponse(casinoTarget(), 'POST', '/login', "username=' OR '1'='1&password=x");
    expect(r.status).toBe(200);
    expect(r.body).toContain('Render desbloqueado');
    expect(r.foundVulnerability?.status).toBe('confirmed');
  });

  it('credenciales normales → 403', () => {
    const r = buildSyntheticResponse(casinoTarget(), 'POST', '/login', 'username=admin&password=wrong');
    expect(r.status).toBe(403);
    expect(r.foundVulnerability).toBeUndefined();
  });

  it('UNION debe volcar la tabla users con la flag del lab', () => {
    const t = casinoTarget();
    t.known_passwords = { root: 'BurpSQLi@2024!', admin: 'Admin@2024' };
    t.flags = { root: 'ZIL{INTERCEPT_AND_EXPLOIT}' };
    const r = buildSyntheticResponse(t, 'POST', '/login', "username=' UNION SELECT * FROM users--&password=x");
    expect(r.body).toContain('ZIL{INTERCEPT_AND_EXPLOIT}');
    expect(r.foundCredentials?.pass).toBe('BurpSQLi@2024!');
    expect(r.fileRead?.isFlag).toBe(true);
  });
});
