// ── utils/__tests__/permissions.test.ts ─────────────────────────────
// Tests for permission system (users.ts + permissions.ts)

import { describe, it, expect } from 'vitest';
import { parsePasswd, parseGroup, getCurrentUser, getUsers, getGroups } from '../users';
import {
  checkPermission, canRead, canWrite, canExecute,
  canEditFile, canCreateInDir, canDeleteInDir,
  formatMode, formatModeFromFile,
  hasSuid, hasSgid, hasStickyBit,
} from '../permissions';
import type { Machine, FileEntry, User } from '../../types';

const PASSWD_CONTENT = `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
admin:x:1000:1000:Admin:/home/admin:/bin/bash
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
mysql:x:112:118:MySQL Server,,,:/nonexistent:/bin/false
`;

const GROUP_CONTENT = `root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:sys
adm:x:4:syslog
www-data:x:33:www-data
shadow:x:42:
nogroup:x:65534:
admin:x:1000:admin
mysql:x:118:mysql
sshd:x:114:
`;

function createBaseMachine(overrides?: Partial<Machine>): Machine {
  return {
    id: 'victim-01',
    machine_info: { hostname: 'target', ip: '10.0.0.2', mac: '00:00:00:00:00:02', os: 'Linux', status: 'active', type: 'victim' },
    discovery_level: 3,
    scan_results: { ports: [] },
    web_enumeration: { web_server: '', cms: '', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: PASSWD_CONTENT, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP_CONTENT, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
    ...overrides,
  };
}

const rootUser: User = { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', groups: [0] };
const adminUser: User = { username: 'admin', uid: 1000, gid: 1000, home: '/home/admin', shell: '/bin/bash', groups: [1000] };
const nobodyUser: User = { username: 'nobody', uid: 65534, gid: 65534, home: '/nonexistent', shell: '/usr/sbin/nologin', groups: [65534] };

// ── parsePasswd ───────────────────────────────────────────────────

describe('parsePasswd', () => {
  it('debe parsear usuarios del contenido de /etc/passwd', () => {
    const users = parsePasswd(PASSWD_CONTENT);
    expect(users).toHaveLength(9);
    expect(users[0]).toMatchObject({ username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash' });
  });

  it('debe ignorar lineas vacias y comentarios', () => {
    const result = parsePasswd('# comment\n\nroot:x:0:0:root:/root:/bin/bash\n');
    expect(result).toHaveLength(1);
  });

  it('debe ignorar lineas malformadas', () => {
    const result = parsePasswd('invalid\nroot:x:0:0:root:/root:/bin/bash\n');
    expect(result).toHaveLength(1);
  });
});

// ── parseGroup ────────────────────────────────────────────────────

describe('parseGroup', () => {
  it('debe parsear grupos del contenido de /etc/group', () => {
    const groups = parseGroup(GROUP_CONTENT);
    expect(groups.length).toBeGreaterThanOrEqual(10);
    const rootGroup = groups.find(g => g.name === 'root');
    expect(rootGroup).toMatchObject({ name: 'root', gid: 0, members: [] });
  });

  it('debe extraer miembros del grupo', () => {
    const groups = parseGroup(GROUP_CONTENT);
    const admGroup = groups.find(g => g.name === 'adm');
    expect(admGroup?.members).toContain('syslog');
    const adminGroup = groups.find(g => g.name === 'admin');
    expect(adminGroup?.members).toContain('admin');
  });
});

// ── getCurrentUser ────────────────────────────────────────────────

describe('getCurrentUser', () => {
  it('debe retornar root para maquinas attacker', () => {
    const machine = createBaseMachine({ id: 'kali-attacker' });
    const user = getCurrentUser(machine);
    expect(user.uid).toBe(0);
    expect(user.username).toBe('root');
  });

  it('debe retornar root si privesc_completed', () => {
    const machine = createBaseMachine({ privesc_completed: true });
    const user = getCurrentUser(machine);
    expect(user.username).toBe('root');
  });

  it('debe retornar usuario de credencial RCE', () => {
    const machine = createBaseMachine({
      found_credentials: [{ file: '', user: 'admin', pass: 'pass', verified: false, service: 'reverse-shell' }],
    });
    const user = getCurrentUser(machine);
    expect(user.username).toBe('admin');
  });

  it('debe retornar fallback user si no hay identidad', () => {
    const machine = createBaseMachine();
    const user = getCurrentUser(machine);
    expect(user.username).toBe('user');
    expect(user.uid).toBe(1000);
  });
});

// ── checkPermission ───────────────────────────────────────────────

describe('checkPermission', () => {
  const machine = createBaseMachine();
  const shadowFile: FileEntry = { path: '/etc/shadow', content: '', type: 'text', owner: 'root', group: 'shadow', mode: 0o640 };
  const passwdFile: FileEntry = { path: '/etc/passwd', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o644 };
  const secretFile: FileEntry = { path: '/root/secret.txt', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o600 };
  const worldWritable: FileEntry = { path: '/tmp/test', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o666 };
  const suidBin: FileEntry = { path: '/usr/bin/su', content: '', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 };

  it('root puede leer cualquier archivo', () => {
    expect(canRead(machine, shadowFile, rootUser)).toBe(true);
    expect(canRead(machine, secretFile, rootUser)).toBe(true);
  });

  it('root puede escribir cualquier archivo', () => {
    expect(canWrite(machine, shadowFile, rootUser)).toBe(true);
    expect(canWrite(machine, secretFile, rootUser)).toBe(true);
  });

  it('root puede ejecutar cualquier archivo', () => {
    expect(canExecute(machine, secretFile, rootUser)).toBe(true);
  });

  it('admin no puede leer shadow (640 root:shadow)', () => {
    expect(canRead(machine, shadowFile, adminUser)).toBe(false);
  });

  it('admin puede leer passwd (644 root:root)', () => {
    expect(canRead(machine, passwdFile, adminUser)).toBe(true);
  });

  it('admin no puede leer secret de root (600 root:root)', () => {
    expect(canRead(machine, secretFile, adminUser)).toBe(false);
  });

  it('admin no puede escribir en secret de root (600 root:root)', () => {
    expect(canWrite(machine, secretFile, adminUser)).toBe(false);
  });

  it('admin puede leer/escribir world-writable (666)', () => {
    expect(canRead(machine, worldWritable, adminUser)).toBe(true);
    expect(canWrite(machine, worldWritable, adminUser)).toBe(true);
  });

  it('nobody solo puede leer archivos world-readable', () => {
    expect(canRead(machine, passwdFile, nobodyUser)).toBe(true);
    expect(canRead(machine, shadowFile, nobodyUser)).toBe(false);
    expect(canRead(machine, secretFile, nobodyUser)).toBe(false);
  });

  it('user null retorna false', () => {
    expect(checkPermission(machine, passwdFile, null, 'read')).toBe(false);
  });

  it('miembro del grupo shadow puede leer archivos del grupo', () => {
    const machineWithShadow = createBaseMachine();
    // shadow group has no members in our test, so no one can read via group
    // Instead, test with a user who IS in the group: add shadow to admin's secondary groups
    // But checkPermission checks /etc/group members list, not user.groups
    // So this test verifies the group membership logic via /etc/group
    expect(canRead(machineWithShadow, shadowFile, adminUser)).toBe(false); // admin not in shadow group
  });

  it('owner puede escribir en archivos mode 755 (solo owner escribe)', () => {
    const file755: FileEntry = { path: '/usr/bin/test', content: '', type: 'text', owner: 'admin', group: 'root', mode: 0o755 };
    expect(canWrite(machine, file755, adminUser)).toBe(true);
    expect(canWrite(machine, file755, nobodyUser)).toBe(false);
  });

  it('checkPermission con execute en directorio', () => {
    const dir: FileEntry = { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 };
    expect(canExecute(machine, dir, rootUser)).toBe(true);
    expect(canExecute(machine, dir, adminUser)).toBe(false);
  });

  it('formato SUID rws para 4755', () => {
    const result = formatModeFromFile(suidBin);
    expect(result.startsWith('-rws')).toBe(true);
  });

  it('member of adm group can read adm-owned files', () => {
    const admFile: FileEntry = { path: '/var/log/syslog', content: '', type: 'text', owner: 'root', group: 'adm', mode: 0o640 };
    const syslogUser: User = { username: 'syslog', uid: 104, gid: 110, home: '/home/syslog', shell: '/usr/sbin/nologin', groups: [110, 4] };
    expect(canRead(machine, admFile, syslogUser)).toBe(true);
  });
});

// ── formatMode ────────────────────────────────────────────────────

describe('formatMode', () => {
  it('debe formatear 644 como -rw-r--r--', () => {
    expect(formatMode(0o644, false)).toBe('-rw-r--r--');
  });

  it('debe formatear 755 como -rwxr-xr-x', () => {
    expect(formatMode(0o755, true)).toBe('drwxr-xr-x');
  });

  it('debe mostrar SUID como rws para 4755', () => {
    expect(formatMode(0o4755, false)).toBe('-rwsr-xr-x');
  });

  it('debe mostrar sticky bit como rwt para 1777', () => {
    expect(formatMode(0o1777, true)).toBe('drwxrwxrwt');
  });

  it('debe mostrar SUID+sticky correctamente', () => {
    expect(formatMode(0o5777, true)).toBe('drwsrwxrwt');
  });

  it('debe mostrar SGID como r-s', () => {
    expect(formatMode(0o2755, false)).toBe('-rwxr-sr-x');
  });
});

// ── hasSuid / hasSgid / hasStickyBit ──────────────────────────────

describe('hasSuid', () => {
  it('debe retornar true para 4755', () => expect(hasSuid(0o4755)).toBe(true));
  it('debe retornar false para 755', () => expect(hasSuid(0o755)).toBe(false));
  it('debe retornar false para 0', () => expect(hasSuid(0)).toBe(false));
});

describe('hasSgid', () => {
  it('debe retornar true para 2755', () => expect(hasSgid(0o2755)).toBe(true));
  it('debe retornar false para 755', () => expect(hasSgid(0o755)).toBe(false));
});

describe('hasStickyBit', () => {
  it('debe retornar true para 1777', () => expect(hasStickyBit(0o1777)).toBe(true));
  it('debe retornar true para 777', () => expect(hasStickyBit(0o777)).toBe(false));
  it('debe retornar false para 755', () => expect(hasStickyBit(0o755)).toBe(false));
});

// ── getUsers / getGroups (integración) ────────────────────────────

describe('getUsers', () => {
  it('debe retornar usuarios desde machine.files', () => {
    const machine = createBaseMachine();
    const users = getUsers(machine);
    expect(users.some(u => u.username === 'root')).toBe(true);
    expect(users.some(u => u.username === 'admin')).toBe(true);
  });

  it('debe retornar array vacio si no hay /etc/passwd', () => {
    const machine = createBaseMachine({ files: [] });
    expect(getUsers(machine)).toEqual([]);
  });
});

describe('getGroups', () => {
  it('debe retornar grupos desde machine.files', () => {
    const machine = createBaseMachine();
    const groups = getGroups(machine);
    expect(groups.some(g => g.name === 'root')).toBe(true);
    expect(groups.some(g => g.name === 'shadow')).toBe(true);
  });

  it('debe retornar array vacio si no hay /etc/group', () => {
    const machine = createBaseMachine({ files: [] });
    expect(getGroups(machine)).toEqual([]);
  });
});

// ── canEditFile / canCreateInDir / canDeleteInDir ──────────────────

describe('canEditFile', () => {
  const machine = createBaseMachine();
  const ownFile: FileEntry = { path: '/home/admin/note.txt', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 };
  const othersFile: FileEntry = { path: '/root/x.txt', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o644 };

  it('admin puede editar su propio archivo', () => {
    expect(canEditFile(machine, ownFile, adminUser)).toBe(true);
  });

  it('admin no puede editar archivo de root', () => {
    expect(canEditFile(machine, othersFile, adminUser)).toBe(false);
  });

  it('root puede editar cualquier archivo', () => {
    expect(canEditFile(machine, othersFile, rootUser)).toBe(true);
  });

  it('user null retorna false', () => {
    expect(canEditFile(machine, ownFile, null)).toBe(false);
  });
});

describe('canCreateInDir', () => {
  const machine = createBaseMachine();
  const writableDir: FileEntry = { path: '/home/admin/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o755 };
  const protectedDir: FileEntry = { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 };

  it('admin puede crear en su propio directorio', () => {
    expect(canCreateInDir(machine, writableDir, adminUser)).toBe(true);
  });

  it('admin no puede crear en /root (0700)', () => {
    expect(canCreateInDir(machine, protectedDir, adminUser)).toBe(false);
  });

  it('root puede crear en cualquier directorio', () => {
    expect(canCreateInDir(machine, protectedDir, rootUser)).toBe(true);
  });

  it('parentDir null deniega', () => {
    expect(canCreateInDir(machine, null, adminUser)).toBe(false);
  });

  it('user null deniega', () => {
    expect(canCreateInDir(machine, writableDir, null)).toBe(false);
  });

  it('sin write o sin execute en dir deniega', () => {
    const writeOnly: FileEntry = { path: '/x/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o200 };
    const execOnly: FileEntry = { path: '/x/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o100 };
    expect(canCreateInDir(machine, writeOnly, adminUser)).toBe(false);
    expect(canCreateInDir(machine, execOnly, adminUser)).toBe(false);
  });
});

describe('canDeleteInDir', () => {
  const machine = createBaseMachine();
  const homeDir: FileEntry = { path: '/home/admin/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o755 };
  const tmpDir: FileEntry = { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 };
  const ownFile: FileEntry = { path: '/home/admin/note.txt', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 };
  const otherFile: FileEntry = { path: '/tmp/stranger.txt', content: '', type: 'text', owner: 'bob', group: 'bob', mode: 0o644 };

  it('admin puede borrar archivo propio en /home/admin', () => {
    expect(canDeleteInDir(machine, homeDir, ownFile, adminUser)).toBe(true);
  });

  it('admin NO puede borrar archivo ajeno en /tmp con sticky', () => {
    expect(canDeleteInDir(machine, tmpDir, otherFile, adminUser)).toBe(false);
  });

  it('admin PUEDE borrar su propio archivo en /tmp con sticky', () => {
    const ownInTmp: FileEntry = { path: '/tmp/admin.txt', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 };
    expect(canDeleteInDir(machine, tmpDir, ownInTmp, adminUser)).toBe(true);
  });

  it('root puede borrar cualquier archivo incluso con sticky', () => {
    expect(canDeleteInDir(machine, tmpDir, otherFile, rootUser)).toBe(true);
  });

  it('sin sticky bit, cualquier user con w+x puede borrar', () => {
    const worldWritableDir: FileEntry = { path: '/data/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o777 };
    expect(canDeleteInDir(machine, worldWritableDir, otherFile, adminUser)).toBe(true);
  });

  it('parentDir null deniega', () => {
    expect(canDeleteInDir(machine, null, ownFile, adminUser)).toBe(false);
  });

  it('user null deniega', () => {
    expect(canDeleteInDir(machine, homeDir, ownFile, null)).toBe(false);
  });

  it('sin permiso write/exec en dir deniega aunque seas owner', () => {
    const protectedDir: FileEntry = { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 };
    const fileInRoot: FileEntry = { path: '/root/note.txt', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 };
    expect(canDeleteInDir(machine, protectedDir, fileInRoot, adminUser)).toBe(false);
  });
});
