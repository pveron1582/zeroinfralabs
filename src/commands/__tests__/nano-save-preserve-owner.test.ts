// ── commands/__tests__/nano-save-preserve-owner.test.ts ────────────
// Tests that the nano command emits existingSnapshot for the hook to
// preserve owner/group/mode on save. Complements fase4-editors.test.ts.

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../types';
import { executeCommand } from '../index';

let machine: Machine;

beforeEach(() => {
  machine = {
    id: 'victim-save-test',
    machine_info: { hostname: 'victim', ip: '10.0.0.5', mac: '00:00:00:00:00:05', os: 'Linux', status: 'up', type: 'victim' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    found_credentials: [{ file: '', user: 'kali', pass: 'pass', verified: true, service: 'ssh' }],
    files: [
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/kali/.dir', content: '', type: 'text', owner: 'kali', group: 'kali', mode: 0o755 },
      { path: '/home/kali/report.txt', content: 'old content', type: 'text', owner: 'kali', group: 'kali', mode: 0o600 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:kali:/home/kali:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: 'root:x:0:\nkali:x:1000:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    ],
  };
});

describe('nano existingSnapshot', () => {
  it('debe emitir existingSnapshot con owner/group/mode del archivo al abrir existente', () => {
    const r = executeCommand('nano /home/kali/report.txt', machine, [machine], 0, undefined, '/');
    expect(r.isError).not.toBe(true);
    const nf = (r as any).nanoFile;
    expect(nf).toBeDefined();
    expect(nf.path).toBe('/home/kali/report.txt');
    expect(nf.content).toBe('old content');
    expect(nf.existingSnapshot).toEqual({ owner: 'kali', group: 'kali', mode: 0o600 });
  });

  it('NO debe emitir existingSnapshot al abrir buffer nuevo', () => {
    const r = executeCommand('nano /home/kali/new.txt', machine, [machine], 0, undefined, '/');
    expect(r.isError).not.toBe(true);
    const nf = (r as any).nanoFile;
    expect(nf.existingSnapshot).toBeUndefined();
  });

  it('existingSnapshot debe respetar el modo 0600 (no normalizar)', () => {
    const r = executeCommand('nano /home/kali/report.txt', machine, [machine], 0, undefined, '/');
    const snap = (r as any).nanoFile.existingSnapshot;
    expect(snap.mode).toBe(0o600);
  });

  it('existingSnapshot usa defaults si owner/group/mode faltan en FileEntry', () => {
    machine.files.push({
      path: '/home/kali/noowner.txt',
      content: 'x',
      type: 'text',
    });
    const r = executeCommand('nano /home/kali/noowner.txt', machine, [machine], 0, undefined, '/');
    const snap = (r as any).nanoFile.existingSnapshot;
    expect(snap.owner).toBe('root');
    expect(snap.group).toBe('root');
    expect(snap.mode).toBe(0o644);
  });
});

describe('nano readOnly flag', () => {
  it('readOnly=true cuando user no puede escribir el archivo', () => {
    machine.files.push({
      path: '/srv/shared.txt',
      content: 'x',
      type: 'text',
      owner: 'root',
      group: 'kali',
      mode: 0o640,
    });
    const r = executeCommand('nano /srv/shared.txt', machine, [machine], 0, undefined, '/');
    expect((r as any).nanoFile.readOnly).toBe(true);
  });

  it('readOnly=false (o undefined) cuando user puede escribir el archivo', () => {
    const r = executeCommand('nano /home/kali/report.txt', machine, [machine], 0, undefined, '/');
    expect((r as any).nanoFile.readOnly).toBeFalsy();
  });
});
