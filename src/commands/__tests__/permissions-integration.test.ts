// ── commands/__tests__/permissions-integration.test.ts ─────────────
// Matriz de tests de regresión transversal del sistema de permisos.
// Verifica que los comandos principales respeten el patrón Unix:
// root bypass, user con permiso, user sin permiso, sticky bit, SUID.

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../types';
import { executeCommand } from '../index';

const PASSWD = `root:x:0:0:root:/root:/bin/bash
kali:x:1000:1000:kali:/home/kali:/bin/bash
bob:x:1001:1001:bob:/home/bob:/bin/bash
alice:x:1002:1002:alice:/home/alice:/bin/bash
`;
const GROUP = `root:x:0:
kali:x:1000:
bob:x:1001:
alice:x:1002:
`;

// Máquina víctima con layout típico: dirs root/home/bob/alice/kali + /tmp con sticky
function makeVictim(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'victim',
    machine_info: { hostname: 'victim', ip: '10.0.0.5', mac: '00:00:00:00:00:05', os: 'Linux', status: 'up', type: 'victim' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
      { path: '/root/secret.txt', content: 'top secret', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/kali/.dir', content: '', type: 'text', owner: 'kali', group: 'kali', mode: 0o755 },
      { path: '/home/kali/note.txt', content: 'mine', type: 'text', owner: 'kali', group: 'kali', mode: 0o644 },
      { path: '/home/bob/.dir', content: '', type: 'text', owner: 'bob', group: 'bob', mode: 0o755 },
      { path: '/home/bob/public.txt', content: 'bob public', type: 'text', owner: 'bob', group: 'bob', mode: 0o644 },
      { path: '/home/alice/.dir', content: '', type: 'text', owner: 'alice', group: 'alice', mode: 0o755 },
      { path: '/home/alice/private.txt', content: 'alice private', type: 'text', owner: 'alice', group: 'alice', mode: 0o600 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
      { path: '/tmp/alice_file.txt', content: 'alice tmp file', type: 'text', owner: 'alice', group: 'alice', mode: 0o644 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    ],
    ...overrides,
  };
}

// Helper: invoca un comando asumiendo una identidad específica via credenciales SSH
function execAs(user: string, line: string, machine: Machine, currentDir = '/') {
  const m: Machine = {
    ...machine,
    found_credentials: [{ file: '', user, pass: 'p', verified: true, service: 'ssh' }],
  };
  const r = executeCommand(line, m, [m], 0, undefined, currentDir);
  if (r.filesChanged) machine.files = r.filesChanged;
  return r;
}

describe('Permisos transversales — read (cat)', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('cat: kali puede leer su propio archivo', () => {
    const r = execAs('kali', 'cat /home/kali/note.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('mine');
  });

  it('cat: bob NO puede leer archivo privado de alice (0600)', () => {
    const r = execAs('bob', 'cat /home/alice/private.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('cat: kali NO puede leer secret de root (0600)', () => {
    const r = execAs('kali', 'cat /root/secret.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('cat: root bypasea cualquier permiso', () => {
    const r = execAs('root', 'cat /home/alice/private.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('alice private');
  });
});

describe('Permisos transversales — write (echo >)', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('echo>: kali puede escribir en /home/kali (su dir)', () => {
    const r = execAs('kali', 'echo hola > /home/kali/test.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/home/kali/test.txt')).toBeDefined();
  });

  it('echo>: kali NO puede sobreescribir archivo de bob (0644)', () => {
    const r = execAs('kali', 'echo hola > /home/bob/public.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('echo>: bob NO puede escribir en /usr/bin (0755 root, sin w)', () => {
    const r = execAs('bob', 'echo x > /usr/bin/evil', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('echo>: root puede escribir en cualquier lado', () => {
    const r = execAs('root', 'echo hola > /root/secret.txt', machine);
    expect(r.isError).not.toBe(true);
    const f = machine.files.find(f => f.path === '/root/secret.txt');
    expect(f?.content).toContain('hola');
  });

  it('echo>>: append a archivo ajeno sin w también denegado', () => {
    const r = execAs('kali', 'echo x >> /home/bob/public.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });
});

describe('Permisos transversales — create (touch, mkdir)', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('touch: kali puede crear en /tmp (world-writable con sticky)', () => {
    const r = execAs('kali', 'touch /tmp/k.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/tmp/k.txt')).toBeDefined();
  });

  it('touch: bob NO puede crear en /usr/bin', () => {
    const r = execAs('bob', 'touch /usr/bin/evil', machine);
    expect(r.isError).toBe(true);
  });

  it('mkdir: alice puede crear dir en /home', () => {
    const r = execAs('alice', 'mkdir /home/alice/sub', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/home/alice/sub/.dir')).toBeDefined();
  });

  it('mkdir: alice NO puede crear en /usr/bin', () => {
    const r = execAs('alice', 'mkdir /usr/bin/sub', machine);
    expect(r.isError).toBe(true);
  });
});

describe('Permisos transversales — delete (rm, rmdir) con sticky', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('rm: bob puede borrar su propio archivo', () => {
    const r = execAs('bob', 'rm /home/bob/public.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/home/bob/public.txt')).toBeUndefined();
  });

  it('rm: bob NO puede borrar archivo de alice en /tmp con sticky', () => {
    const r = execAs('bob', 'rm /tmp/alice_file.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Operation not permitted');
  });

  it('rm: alice SÍ puede borrar su propio archivo en /tmp con sticky', () => {
    const r = execAs('alice', 'rm /tmp/alice_file.txt', machine);
    expect(r.isError).not.toBe(true);
  });

  it('rm: root puede borrar archivo de alice en /tmp con sticky (bypass)', () => {
    const r = execAs('root', 'rm /tmp/alice_file.txt', machine);
    expect(r.isError).not.toBe(true);
  });

  it('rmdir: bob NO puede borrar subdir de alice en /tmp con sticky', () => {
    machine.files.push({ path: '/tmp/alice_sub/.dir', content: '', type: 'text', owner: 'alice', group: 'alice', mode: 0o755 });
    const r = execAs('bob', 'rmdir /tmp/alice_sub', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Operation not permitted');
  });
});

describe('Permisos transversales — copy (cp)', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('cp: bob puede leer su propio source', () => {
    const r = execAs('bob', 'cp /home/bob/public.txt /tmp/copy.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/tmp/copy.txt')).toBeDefined();
  });

  it('cp: bob NO puede leer source privado de alice', () => {
    const r = execAs('bob', 'cp /home/alice/private.txt /tmp/x.txt', machine);
    expect(r.output).toContain('Permission denied');
    expect(machine.files.find(f => f.path === '/tmp/x.txt')).toBeUndefined();
  });

  it('cp: bob NO puede sobreescribir archivo de alice en /tmp sin w', () => {
    machine.files.push({ path: '/tmp/alice_existing.txt', content: 'a', type: 'text', owner: 'alice', group: 'alice', mode: 0o644 });
    const r = execAs('bob', 'cp /home/bob/public.txt /tmp/alice_existing.txt', machine);
    expect(r.output).toContain('Permission denied');
    const dest = machine.files.find(f => f.path === '/tmp/alice_existing.txt');
    expect(dest?.content).toBe('a'); // no se sobreescribió
  });

  it('cp: root puede copiar de cualquier source a cualquier dest', () => {
    const r = execAs('root', 'cp /home/alice/private.txt /root/x.txt', machine);
    expect(r.isError).not.toBe(true);
  });
});

describe('Permisos transversales — move (mv) con sticky en source', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('mv: alice puede mover su propio archivo en /tmp a otro lado', () => {
    const r = execAs('alice', 'mv /tmp/alice_file.txt /home/alice/moved.txt', machine);
    expect(r.isError).not.toBe(true);
    expect(machine.files.find(f => f.path === '/home/alice/moved.txt')).toBeDefined();
  });

  it('mv: bob NO puede mover archivo de alice en /tmp (sticky)', () => {
    const r = execAs('bob', 'mv /tmp/alice_file.txt /tmp/stolen.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Operation not permitted');
  });

  it('mv: bob puede mover su propio archivo', () => {
    const r = execAs('bob', 'mv /home/bob/public.txt /tmp/bob_moved.txt', machine);
    expect(r.isError).not.toBe(true);
  });
});

describe('Permisos transversales — ls respeta dir', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('ls: bob NO puede listar /root (0700)', () => {
    const r = execAs('bob', 'ls /root', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('ls: bob puede listar /tmp (1777)', () => {
    const r = execAs('bob', 'ls /tmp', machine);
    expect(r.isError).not.toBe(true);
  });

  it('ls: bob puede listar /home/bob (755, owner=bob)', () => {
    const r = execAs('bob', 'ls /home/bob', machine);
    expect(r.isError).not.toBe(true);
  });

  it('ls: root lista /root sin restricción', () => {
    const r = execAs('root', 'ls /root', machine);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('secret.txt');
  });
});

describe('Permisos transversales — cd respeta dir', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('cd: bob NO puede entrar a /root (0700)', () => {
    const r = execAs('bob', 'cd /root', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('cd: bob puede entrar a /home/bob (755)', () => {
    const r = execAs('bob', 'cd /home/bob', machine);
    expect(r.isError).not.toBe(true);
  });

  it('cd: bob puede entrar a /tmp (1777)', () => {
    const r = execAs('bob', 'cd /tmp', machine);
    expect(r.isError).not.toBe(true);
  });
});

describe('Permisos transversales — nano abre y guarda', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('nano: kali abre archivo propio (readOnly=false)', () => {
    const r = execAs('kali', 'nano /home/kali/note.txt', machine);
    expect(r.isError).not.toBe(true);
    expect((r as any).nanoFile.readOnly).toBeFalsy();
  });

  it('nano: kali abre archivo world-readable de bob en modo read-only', () => {
    const r = execAs('kali', 'nano /home/bob/public.txt', machine);
    expect(r.isError).not.toBe(true);
    expect((r as any).nanoFile.readOnly).toBe(true);
  });

  it('nano: kali NO puede abrir archivo privado de alice (0600)', () => {
    const r = execAs('kali', 'nano /home/alice/private.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('nano: kali crea archivo nuevo en /tmp (world-writable)', () => {
    const r = execAs('kali', 'nano /tmp/new.txt', machine);
    expect(r.isError).not.toBe(true);
    expect((r as any).nanoFile.content).toBe('');
  });

  it('nano: existingSnapshot preserva owner al editar', () => {
    const r = execAs('kali', 'nano /home/kali/note.txt', machine);
    expect((r as any).nanoFile.existingSnapshot).toEqual({
      owner: 'kali', group: 'kali', mode: 0o644,
    });
  });
});

describe('Permisos transversales — chmod/chown restringidos', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('chmod: kali NO puede cambiar permisos de archivo de bob', () => {
    const r = execAs('kali', 'chmod 777 /home/bob/public.txt', machine);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Operation not permitted');
  });

  it('chmod: bob SÍ puede cambiar permisos de su propio archivo', () => {
    const r = execAs('bob', 'chmod 600 /home/bob/public.txt', machine);
    expect(r.isError).not.toBe(true);
    const f = machine.files.find(f => f.path === '/home/bob/public.txt');
    expect(f?.mode).toBe(0o600);
  });

  it('chmod: root puede cambiar permisos de cualquier archivo', () => {
    const r = execAs('root', 'chmod 777 /home/bob/public.txt', machine);
    expect(r.isError).not.toBe(true);
  });

  it('chown: solo root puede cambiar owner', () => {
    const r = execAs('bob', 'chown root /home/bob/public.txt', machine);
    expect(r.isError).toBe(true);
  });
});

describe('Permisos transversales — root bypass universal', () => {
  let machine: Machine;
  beforeEach(() => { machine = makeVictim(); });

  it('root puede leer archivos 0600 ajenos', () => {
    expect(execAs('root', 'cat /home/alice/private.txt', machine).isError).not.toBe(true);
  });

  it('root puede escribir archivos 0644 ajenos', () => {
    const r = execAs('root', 'echo hola > /home/kali/note.txt', machine);
    expect(r.isError).not.toBe(true);
  });

  it('root puede borrar archivos ajenos en /tmp con sticky', () => {
    const r = execAs('root', 'rm /tmp/alice_file.txt', machine);
    expect(r.isError).not.toBe(true);
  });

  it('root puede crear en cualquier directorio', () => {
    expect(execAs('root', 'touch /usr/bin/x', machine).isError).not.toBe(true);
  });

  it('root puede listar /root', () => {
    expect(execAs('root', 'ls /root', machine).isError).not.toBe(true);
  });
});
