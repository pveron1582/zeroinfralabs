// ── commands/tools/__tests__/curl.test.ts ────────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_curl } from '../curl';
import type { Machine } from '../../../types';

describe('cmd_curl', () => {
  const createWebMachine = (id: string, ip: string): Machine => ({
    id,
    machine_info: { hostname: 'sql-injection-web', ip, mac: '08:00:27:D5:E6:F7', os: 'Ubuntu 18.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'ProFTPD 1.3.5e' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.29' },
      ]
    },
    web_enumeration: {
      web_server: 'Apache/2.4.29',
      cms: 'PHP 7.2 - Vulnerable Login Form',
      directories: [
        { path: '/', status: 200, description: 'Página de inicio' },
        { path: '/login', status: 200, description: 'Formulario de login' },
        { path: '/admin', status: 403, description: 'Panel de administración' },
        { path: '/backup', status: 200, description: 'Directorio de respaldo' },
      ],
    },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar ayuda con -h', () => {
    const result = cmd_curl.execute(['-h'], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Usage: curl');
  });

  it('debe fallar sin URL', () => {
    const result = cmd_curl.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('no URL specified');
  });

  it('debe rechazar conexiones a hosts sin servicio web', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    target.web_enumeration = undefined as any;
    const result = cmd_curl.execute(['http://192.168.40.11/login'], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Connection refused');
  });

  it('debe obtener el formulario de login con GET', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['http://192.168.40.11/login'], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('HTTP/1.1 200 OK');
    expect(result.output).toContain('Secure Login');
    expect('foundVulnerability' in result).toBe(false);
  });

  it('debe devolver 403 en /admin', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['http://192.168.40.11/admin'], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    expect(result.output).toContain('403 Forbidden');
  });

  it('debe devolver 404 en rutas desconocidas', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['http://192.168.40.11/noexiste'], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    expect(result.output).toContain('404');
  });

  it('debe detectar SQL injection con payload OR 1=1', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', "username=' OR '1'='1&password=x"], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv).toBeDefined();
    expect(fv?.vulnId).toBe('SQLi');
    expect(fv?.status).toBe('confirmed');
    expect(result.output).toContain('Admin Dashboard');
  });

  it('debe detectar SQL injection con or en minúscula', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', "username=' or '1'='1&password=x"], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv).toBeDefined();
    expect(fv?.vulnId).toBe('SQLi');
    expect(fv?.status).toBe('confirmed');
    expect(result.output).toContain('Admin Dashboard');
  });

  it('debe detectar SQL injection con or 1=1-- en minúscula', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', "username=' or 1=1--&password=x"], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv?.status).toBe('confirmed');
    expect(result.output).toContain('Admin Dashboard');
  });

  it('debe detectar SQL injection con comilla simple (error SQL)', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', "username='&password=x"], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    const fv = 'foundVulnerability' in result ? result.foundVulnerability : undefined;
    expect(fv).toBeDefined();
    expect(fv?.vulnId).toBe('SQLi');
    expect(fv?.status).toBe('detected');
    expect(result.output).toContain('500 Internal Server Error');
    expect(result.output).toContain('SQL syntax');
  });

  it('debe detectar SQL injection con payload UNION SELECT', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', "username=' UNION SELECT table_name FROM information_schema.tables--&password=x"], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    const fc = 'foundCredentials' in result ? result.foundCredentials : undefined;
    expect(fc).toBeDefined();
    expect(fc?.service).toBe('mysql');
    expect(fc?.user).toBe('root');
    expect(result.output).toContain('Database Enumeration');
  });

  it('debe rechazar credenciales inválidas sin metadata', () => {
    const target = createWebMachine('target-01', '192.168.40.11');
    const result = cmd_curl.execute(['-X', 'POST', 'http://192.168.40.11/login', '-d', 'username=admin&password=wrong'], {
      allMachines: [target],
      currentMissionId: 1
    } as any);
    expect(result.output).toContain('Invalid credentials');
    expect('foundVulnerability' in result).toBe(false);
    expect('foundCredentials' in result).toBe(false);
  });
});
