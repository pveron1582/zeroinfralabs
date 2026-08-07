// ── commands/__tests__/ls-permissions.test.ts ──────────────────────
// Tests for ls permission enforcement: ls on a dir without `x` for the
// current user must return "Permission denied". When in short format,
// entries without `r` (per file) must be filtered out.

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../types';
import { executeCommand } from '../index';

let machine: Machine;

beforeEach(() => {
  machine = {
    id: 'victim-ls-perms',
    machine_info: { hostname: 'victim', ip: '10.0.0.10', mac: '00:00:00:00:00:0a', os: 'Linux', status: 'up', type: 'victim' },
    discovery_level: 4,
    scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9', credentials: { user: 'bob', pass: 'p' } }] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
      { path: '/root/secret.txt', content: 'top secret', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/bob/.dir', content: '', type: 'text', owner: 'bob', group: 'bob', mode: 0o755 },
      { path: '/home/bob/note.txt', content: 'mine', type: 'text', owner: 'bob', group: 'bob', mode: 0o644 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
      { path: '/tmp/world.txt', content: 'public', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nbob:x:1001:1001:bob:/home/bob:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: 'root:x:0:\nbob:x:1001:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
  };
});

describe('ls permisos sobre el directorio target', () => {
  it('bob NO puede listar /root (0700)', () => {
    const r = executeCommand('ls /root', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('bob PUEDE listar /home/bob (755, owner=bob)', () => {
    const r = executeCommand('ls /home/bob', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBeUndefined();
    expect(r.output).toContain('note.txt');
  });

  it('bob PUEDE listar /tmp (1777, world-writable)', () => {
    const r = executeCommand('ls /tmp', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBeUndefined();
    expect(r.output).toContain('world.txt');
  });

  it('bob NO puede listar /root con -l', () => {
    const r = executeCommand('ls -l /root', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('root puede listar /root sin restricción', () => {
    machine.su_user = 'root';
    const r = executeCommand('ls /root', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBeUndefined();
    expect(r.output).toContain('secret.txt');
  });
});

describe('ls formato corto filtra entries sin permiso de lectura', () => {
  it('bob lista /home/bob y ve sus propios archivos', () => {
    const r = executeCommand('ls /home/bob', machine, [machine], 0, undefined, '/');
    expect(r.output).toContain('note.txt');
  });

  it('directorio listado se devuelve aunque esté vacío (permiso ok)', () => {
    machine.files.push({ path: '/empty/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 });
    const r = executeCommand('ls /empty', machine, [machine], 0, undefined, '/');
    expect(r.isError).toBeUndefined();
  });
});
