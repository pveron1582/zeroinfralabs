// ── commands/builtin/__tests__/cat.test.ts ───────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_cat } from '../cat';
import type { Machine } from '../../../types';

describe('cmd_cat', () => {
  const createMockMachine = (files: any[] = [], id = 'test-01'): Machine => ({
    id,
    machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files,
  });

  it('debe mostrar error si no se especifica archivo', () => {
    const machine = createMockMachine([]);
    const result = cmd_cat.execute([], { machine } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: cat');
  });

  it('debe mostrar contenido de archivo existente', () => {
    const machine = createMockMachine([
      { path: '/home/user/flag.txt', content: 'THM{TEST_FLAG}', type: 'text' },
    ]);
    const result = cmd_cat.execute(['flag.txt'], { machine } as any);

    expect(result.output).toBe('THM{TEST_FLAG}');
    expect(result.isError).toBeUndefined();
  });

  it('debe manejar path con ./', () => {
    const machine = createMockMachine([
      { path: '/home/user/config.txt', content: 'CONFIG_DATA', type: 'text' },
    ]);
    const result = cmd_cat.execute(['./config.txt'], { machine } as any);

    expect(result.output).toBe('CONFIG_DATA');
  });

  it('debe mostrar error si archivo no existe', () => {
    const machine = createMockMachine([]);
    const result = cmd_cat.execute(['nonexistent.txt'], { machine } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file');
  });

  it('debe reportar fileRead y possibleUsers al leer note.txt (escenario 05)', () => {
    const machine = createMockMachine([
      { path: '/root/note.txt', content: 'To: john\nURGENT', type: 'text' },
    ]);
    const result = cmd_cat.execute(['note.txt'], { machine } as any);

    expect(result.output).toContain('john');
    // cat ya no completa misiones - es un comando libre
    expect(result.fileRead).toBeDefined();
    expect(result.fileRead?.isNote).toBe(true);
    // possibleUsers es lo que Terminal.tsx escucha y vuelca en
    // Machine.possible_ssh_users (visible en EnumerationPanel)
    expect(result.possibleUsers).toBeDefined();
    expect(result.possibleUsers?.users).toContain('john');
  });
});

// ── Regression tests for laboratorio 05 ───────────────────────────
// Bug: al hacer `cat nota.txt` desde la máquina atacante, el machineId
// de possibleUsers quedaba en el atacante, así que el EnumerationPanel
// del target nunca mostraba a `john` como Possible SSH User.
describe('cmd_cat - resolución de machineId (lab 05)', () => {
  const noteContentEs = `Para: john
De: Equipo de Seguridad
Fecha: 2024-03-15

URGENTE: John, el sistema de monitoreo reportó que tu contraseña de SSH es extremadamente débil y vulnerable a ataques de fuerza bruta.

Por favor, cambiala cuanto antes a una contraseña más segura. El equipo de seguridad recomienda usar al menos 12 caracteres con mayúsculas, minúsculas y números.

Nota: Esta nota se deja aquí en el FTP anónimo temporalmente hasta que configuremos un sistema de tickets más seguro.`;

  const noteContentEn = `To: john
From: Security Team
Date: 2024-03-15

URGENT: John, the monitoring system reported that your SSH password is extremely weak and vulnerable to brute force attacks.

Please change it as soon as possible to a more secure password. The security team recommends using at least 12 characters with uppercase, lowercase, and numbers.

Note: This note is left here on anonymous FTP temporarily until we configure a more secure ticketing system.`;

  const createAttacker = (): Machine => ({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.10.20.1', mac: '00:11:22:33:44:55', os: 'Kali', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/root/nota.txt', content: noteContentEs, type: 'text' },
      { path: '/root/note.txt', content: noteContentEn, type: 'text' },
    ],
  });

  const createTarget = (): Machine => ({
    id: 'lab-scenario-05-target',
    machine_info: { hostname: 'privesc-server', ip: '10.10.20.50', mac: '08:00:27:E8:F9:0A', os: 'Debian 11', status: 'up', type: 'server' },
    discovery_level: 3,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/srv/ftp/nota.txt', content: noteContentEs, type: 'text' },
    ],
  });

  it('cuando cat corre en el atacante, possibleUsers.machineId debe apuntar al target del lab', () => {
    const attacker = createAttacker();
    const target = createTarget();
    const allMachines = [attacker, target];

    const result = cmd_cat.execute(['nota.txt'], { machine: attacker, allMachines } as any);

    expect(result.possibleUsers).toBeDefined();
    expect(result.possibleUsers?.machineId).toBe('lab-scenario-05-target');
    expect(result.possibleUsers?.machineId).not.toBe('attacker-01');
    expect(result.possibleUsers?.users).toContain('john');
  });

  it('cuando cat corre en el atacante con la nota en inglés, debe capturar john', () => {
    const attacker = createAttacker();
    const target = createTarget();
    const allMachines = [attacker, target];

    const result = cmd_cat.execute(['note.txt'], { machine: attacker, allMachines } as any);

    expect(result.possibleUsers).toBeDefined();
    expect(result.possibleUsers?.machineId).toBe('lab-scenario-05-target');
    expect(result.possibleUsers?.users).toContain('john');
  });

  it('no-regresión: cuando cat corre en el target, machineId sigue siendo el target', () => {
    const attacker = createAttacker();
    const target = createTarget();
    const allMachines = [attacker, target];

    const result = cmd_cat.execute(['nota.txt'], { machine: target, allMachines } as any);

    expect(result.possibleUsers).toBeDefined();
    expect(result.possibleUsers?.machineId).toBe('lab-scenario-05-target');
    expect(result.possibleUsers?.users).toContain('john');
  });

  it('el regex robusto debe filtrar falsos positivos (equipo, seguridad, esta, root)', () => {
    const target = createTarget();
    const allMachines = [createAttacker(), target];

    // El contenido de la nota real menciona "Equipo", "Seguridad", "esta"
    // — ninguno debe aparecer como usuario SSH.
    const result = cmd_cat.execute(['nota.txt'], { machine: target, allMachines } as any);

    expect(result.possibleUsers).toBeDefined();
    const users = result.possibleUsers?.users || [];
    expect(users).toContain('john');
    expect(users).not.toContain('equipo');
    expect(users).not.toContain('seguridad');
    expect(users).not.toContain('esta');
  });

  it('si allMachines no está disponible, possibleUsers cae al machine.id del atacante (no rompe)', () => {
    const attacker = createAttacker();

    // Simulamos el caso edge donde el contexto no provee allMachines
    const result = cmd_cat.execute(['nota.txt'], { machine: attacker } as any);

    expect(result.possibleUsers).toBeDefined();
    // Fallback: machine.id del atacante, no se rompe
    expect(result.possibleUsers?.machineId).toBe('attacker-01');
    expect(result.possibleUsers?.users).toContain('john');
  });
});
