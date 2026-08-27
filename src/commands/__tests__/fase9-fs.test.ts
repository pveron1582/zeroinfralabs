// ── commands/__tests__/fase9-fs.test.ts ─────────────────────────────
// Tests de la Fase 9 del ROADMAP: sistema de archivos avanzado
// (mount/umount, df/du, ln/symlinks, find, grep -r).

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_mount, cmd_umount } from '../builtin/mount';
import { cmd_df } from '../builtin/df';
import { cmd_du } from '../builtin/du';
import { cmd_ln } from '../builtin/ln';
import { cmd_find } from '../builtin/find';
import { cmd_grep } from '../builtin/pipeline';
import { cmd_ls } from '../builtin/ls';
import { cmd_cat } from '../builtin/cat';
import { executeCommand } from '../index';
import {
  parseFstab, getMounts, mountDevice, resetMounts,
} from '../../frameworks/fs/mounts';
import { resolveSymlink } from '../../utils/fs';
import type { Machine } from '../../types';

const FSTAB = `# /etc/fstab: static file system information.
UUID=12345678-1234-1234-1234-123456789012 /               ext4    errors=remount-ro 0       1
UUID=87654321-4321-4321-4321-210987654321 /boot           ext4    defaults        0       2
/swapfile                                 none            swap    sw              0       0
`;

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/fstab', content: FSTAB, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/admin/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o755 },
      { path: '/home/admin/notes.txt', content: 'user: admin\npass: s3cr3t\n', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 },
      { path: '/mnt/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
      { path: '/tmp/suid_bin', content: 'setuid binary', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/usr/bin/nmap', content: 'nmap', type: 'binary', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/boot/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/boot/grub.cfg', content: 'set default=0\n', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
    ],
    ...overrides,
  };
}

function makeRootMachine(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali Linux 2024.2', status: 'up', type: 'workstation' },
    ...overrides,
  });
}

function ctx(machine: Machine) {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

function applyResult(machine: Machine, r: { filesChanged?: Machine['files'] }) {
  if (r.filesChanged) machine.files = r.filesChanged;
}

beforeEach(() => {
  resetMounts();
});

describe('Fase 9 - mount/umount', () => {
  it('mount: lista montajes base + fstab', () => {
    const machine = makeRootMachine();
    const r = cmd_mount.execute([], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('/dev/sda1 on / type ext4');
    expect(r.output).toContain('/boot type ext4');
  });

  it('mount: solo root', () => {
    const machine = makeMachine();
    const r = cmd_mount.execute(['/dev/sdb1', '/mnt/usb'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('only root');
  });

  it('mount: monta un dispositivo en un dir existente', () => {
    const machine = makeRootMachine();
    const r = cmd_mount.execute(['/dev/sdb1', '/mnt'], ctx(machine));
    expect(r.isError).not.toBe(true);
    const mounts = getMounts(machine);
    expect(mounts.some(m => m.mountpoint === '/mnt' && m.device === '/dev/sdb1')).toBe(true);
  });

  it('mount: mount point inexistente falla', () => {
    const machine = makeRootMachine();
    const r = cmd_mount.execute(['/dev/sdb1', '/mnt/nope'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('does not exist');
  });

  it('umount: desmonta un montaje del usuario', () => {
    const machine = makeRootMachine();
    mountDevice(machine, '/dev/sdb1', '/mnt');
    const r = cmd_umount.execute(['/mnt'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(getMounts(machine).some(m => m.mountpoint === '/mnt')).toBe(false);
  });

  it('umount: no puede desmontar montajes del sistema', () => {
    const machine = makeRootMachine();
    const r = cmd_umount.execute(['/'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('cannot unmount system mount');
  });

  it('parseFstab: ignora comentarios y swap', () => {
    const entries = parseFstab(FSTAB);
    expect(entries).toHaveLength(2);
    expect(entries[0].mountpoint).toBe('/');
    expect(entries[1].mountpoint).toBe('/boot');
  });
});

describe('Fase 9 - df/du', () => {
  it('df -h: muestra tabla de discos', () => {
    const machine = makeRootMachine();
    const r = cmd_df.execute(['-h'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('/dev/sda1');
    expect(r.output).toContain('Filesystem');
    expect(r.output).toMatch(/\d+%/);
  });

  it('df: path inexistente falla', () => {
    const machine = makeRootMachine();
    const r = cmd_df.execute(['/mnt/nope'], ctx(machine));
    expect(r.isError).toBe(true);
  });

  it('du -sh: resume el tamaño de un directorio', () => {
    const machine = makeRootMachine();
    const r = cmd_du.execute(['-sh', '/home'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toMatch(/\d+(\.\d+)?[KMG]\t\/home/);
  });

  it('du: directorio inexistente falla', () => {
    const machine = makeRootMachine();
    const r = cmd_du.execute(['/no/such/dir'], ctx(machine));
    expect(r.isError).toBe(true);
  });
});

describe('Fase 9 - ln/symlinks', () => {
  it('ln -s: crea un enlace simbólico', () => {
    const machine = makeRootMachine();
    const r = cmd_ln.execute(['-s', '/etc/passwd', '/home/admin/passwd_link'], ctx(machine));
    expect(r.isError).not.toBe(true);
    applyResult(machine, r);
    const link = machine.files.find(f => f.path === '/home/admin/passwd_link');
    expect(link?.type).toBe('symlink');
    expect(link?.linkTarget).toBe('/etc/passwd');
  });

  it('ln -s: destino inexistente falla', () => {
    const machine = makeRootMachine();
    const r = cmd_ln.execute(['-s', '/no/target', '/home/admin/x'], ctx(machine));
    expect(r.isError).toBe(true);
  });

  it('ln -s: sin -f y el link ya existe falla', () => {
    const machine = makeRootMachine();
    machine.files.push({ path: '/home/admin/dup', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 });
    const r = cmd_ln.execute(['-s', '/etc/passwd', '/home/admin/dup'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('File exists');
  });

  it('ls -l: muestra el enlace como name -> target', () => {
    const machine = makeRootMachine();
    applyResult(machine, cmd_ln.execute(['-s', '/etc/passwd', '/home/admin/passwd_link'], ctx(machine)));
    const r = cmd_ls.execute(['-l', '/home/admin'], ctx(machine));
    expect(r.output).toContain('passwd_link -> /etc/passwd');
    expect(r.output).toContain('lrwxrwxrwx');
  });

  it('cat: sigue el enlace simbólico', () => {
    const machine = makeRootMachine();
    applyResult(machine, cmd_ln.execute(['-s', '/etc/passwd', '/home/admin/passwd_link'], ctx(machine)));
    const r = cmd_cat.execute(['/home/admin/passwd_link'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('root:x:0:0');
  });

  it('resolveSymlink: sigue enlaces relativos y cadenas', () => {
    const machine = makeRootMachine();
    const a = { path: '/home/admin/a', content: 'target-content', type: 'text' as const, owner: 'root', group: 'root', mode: 0o644 };
    machine.files.push(a);
    machine.files.push({ path: '/home/admin/b', content: '/home/admin/a', type: 'symlink' as const, owner: 'root', group: 'root', mode: 0o777, linkTarget: '/home/admin/a' });
    const resolved = resolveSymlink(machine, machine.files.find(f => f.path === '/home/admin/b')!);
    expect(resolved.path).toBe('/home/admin/a');
    expect(resolved.content).toBe('target-content');
  });

  it('executeCommand: ln -s integrado', () => {
    const machine = makeRootMachine();
    const r = executeCommand('ln -s /etc/passwd /home/admin/pwlink', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    applyResult(machine, r);
    expect(machine.files.some(f => f.path === '/home/admin/pwlink' && f.type === 'symlink')).toBe(true);
  });
});

describe('Fase 9 - find', () => {
  it('find -name: busca por patrón', () => {
    const machine = makeRootMachine();
    const r = cmd_find.execute(['/', '-name', '*.txt'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('/home/admin/notes.txt');
  });

  it('find -perm -4000: encuentra SUID', () => {
    const machine = makeRootMachine();
    const r = cmd_find.execute(['/', '-perm', '-4000'], ctx(machine));
    expect(r.output).toContain('/tmp/suid_bin');
  });

  it('find -user: busca por propietario', () => {
    const machine = makeRootMachine();
    const r = cmd_find.execute(['/', '-user', 'admin'], ctx(machine));
    expect(r.output).toContain('/home/admin/notes.txt');
    expect(r.output).not.toContain('/etc/passwd');
  });

  it('find -type d: solo directorios', () => {
    const machine = makeRootMachine();
    const r = cmd_find.execute(['/', '-type', 'd'], ctx(machine));
    expect(r.output).toContain('/home');
    expect(r.output).not.toContain('/etc/passwd');
  });
});

describe('Fase 9 - grep -r', () => {
  it('grep -r: busca recursivo con path:line', () => {
    const machine = makeRootMachine();
    const r = cmd_grep.execute(['-r', 'admin', '/etc'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('/etc/passwd:admin:x:1000');
  });

  it('grep -ri: case insensitive recursivo', () => {
    const machine = makeRootMachine();
    const r = cmd_grep.execute(['-ri', 'PASS', '/home'], ctx(machine));
    expect(r.output).toContain('pass: s3cr3t');
  });
});
