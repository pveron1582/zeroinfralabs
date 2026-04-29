// ── commands/__tests__/happyPath-scenario01.test.ts ───────────────
// Happy path tests for Scenario 01: WordPress Vulnerable Lab

import { describe, it, expect } from 'vitest';
import { createAttacker, exec, evolveState, expectSuccess, withLevel, setupBeforeEach } from './happyPathHelpers';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Happy Path: Scenario 01 - WordPress Lab', () => {
  const attacker = createAttacker();
  const wpTarget: Machine = {
    id: 'lab-scenario-01-wp',
    machine_info: {
      hostname: 'vulnerable-wp-lab',
      ip: '192.168.1.11',
      mac: '08:00:27:A1:B2:C3',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu', credentials: { user: 'admin', pass: 'P@ssw0rd123!' } },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
        { port: 3306, protocol: 'tcp', state: 'filtered', service: 'mysql', version: 'unknown' },
      ],
    },
    web_enumeration: {
      web_server: 'Apache/2.4.41',
      cms: 'WordPress 6.0',
      directories: [
        { path: '/', status: 200, description: 'Página principal' },
        { path: '/wp-admin', status: 200, description: 'Panel de administración' },
        { path: '/uploads', status: 200, description: 'Directorio de archivos subidos' },
        { path: '/backup', status: 403, description: 'Copia de seguridad (Acceso denegado)' },
      ],
    },
    learning_steps: [
      { id: 1, task: 'Reconocimiento de red', text: 'Descubrir hosts: arp-scan', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Escanear: nmap -sV', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 2 },
      { id: 3, task: 'Enumeración Web', text: 'Acceder al sitio web', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 2 },
      { id: 4, task: 'Descubrimiento de directorios', text: 'gobuster dir', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 3 },
      { id: 5, task: 'Find Credentials', text: 'Buscar credenciales en el servidor web', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 3 },
      { id: 6, task: 'Compromiso del WP-Admin', text: 'Acceder al panel de admin con credenciales', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 4 },
      { id: 7, task: 'Conexión SSH', text: 'Conectar por SSH como root', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 4 },
      { id: 8, task: 'Capturar flag root', text: 'Leer la flag de root', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 4 },
    ],
    files: [
      { path: '/uploads/config.bak', content: 'DB_USER=admin\nDB_PASS=P@ssw0rd123!', type: 'text' },
    ],
  };

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.1.0/24', attacker, [attacker, wpTarget], 1);
    expectSuccess(result);
    // arp-scan ya no completa misiones - es un comando libre
    expect(result.discoveredHosts).toBeDefined();
    expect(result.discoveredHosts?.some(h => h.ip === '192.168.1.11')).toBe(true);
    expect(result.output).toContain('192.168.1.11');
  });

  it('Paso 2: nmap escanea puertos (requiere reconocimiento previo)', () => {
    const target = withLevel(wpTarget, 1);
    const result = exec('nmap -sV 192.168.1.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    // nmap ya no completa misiones - es un comando libre
    expect(result.scanResults).toBeDefined();
    expect(result.scanResults?.targetIp).toBe('192.168.1.11');
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
  });

  it('Paso 4: gobuster enumera directorios (requiere escaneo previo)', () => {
    const target = withLevel(wpTarget, 2);
    const result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, [attacker, target], 4);
    expectSuccess(result);
    // gobuster ya no completa misiones - es un comando libre
    expect(result.foundDirectories).toBeDefined();
    expect(result.foundDirectories?.directories.some(d => d.path === '/wp-admin')).toBe(true);
    expect(result.output).toContain('/wp-admin');
    expect(result.output).toContain('/uploads');
  });

  it('nmap funciona sin reconocimiento previo (comando libre)', () => {
    // nmap ya no valida discovery_level - es un comando libre
    const result = exec('nmap -sV 192.168.1.11', attacker, [attacker, wpTarget], 2);
    expectSuccess(result);
    expect(result.scanResults).toBeDefined();
  });

  it('gobuster funciona sin nmap previo (comando libre)', () => {
    // gobuster ya no valida discovery_level - es un comando libre
    const target = withLevel(wpTarget, 1);
    const result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, [attacker, target], 4);
    expectSuccess(result);
    expect(result.foundDirectories).toBeDefined();
  });

  it('Golden path: arp-scan → nmap → gobuster sin simular estado', () => {
    let machines: Machine[] = [attacker, wpTarget];

    let result = exec('arp-scan 192.168.1.0/24', attacker, machines, 1);
    // arp-scan ya no completa misiones - verificar metadata
    expect(result.discoveredHosts).toBeDefined();
    machines = evolveState(machines, result);

    result = exec('nmap -sV 192.168.1.11', attacker, machines, 2);
    // nmap ya no completa misiones - verificar metadata
    expect(result.scanResults).toBeDefined();
    expect(result.scanResults?.ports.some(p => p.port === 22)).toBe(true);
    machines = evolveState(machines, result);

    result = exec('gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', attacker, machines, 4);
    // gobuster ya no completa misiones - verificar metadata
    expect(result.foundDirectories).toBeDefined();
    expectSuccess(result);
  });
});
