// ── utils/__tests__/fs.test.ts ──────────────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests for filesystem helpers in utils/fs.ts

import { describe, it, expect } from 'vitest';
import type { Machine, FileEntry, User } from '../../types';
import {
  findFile, findDirEntry, findParentDir, resolveParentDirPath,
  isDirectoryEntry, defaultOwnership, buildNewFile, isUnderPath,
} from '../fs';

const PASSWD = `root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:user:/home/user:/bin/bash
`;
const GROUP = `root:x:0:
user:x:1000:
`;

function makeMachine(files: FileEntry[]): Machine {
  return {
    id: 'victim',
    machine_info: { hostname: 't', ip: '10.0.0.1', mac: '00:00:00:00:00:01', os: 'Linux', status: 'active', type: 'victim' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      ...files,
    ],
  };
}

describe('findFile', () => {
  it('encuentra archivo regular por path exacto', () => {
    const m = makeMachine([{ path: '/home/user/file.txt', content: 'x', type: 'text', owner: 'user', group: 'user', mode: 0o644 }]);
    expect(findFile(m, '/home/user/file.txt')?.path).toBe('/home/user/file.txt');
  });

  it('encuentra directorio (entry con /.dir)', () => {
    const m = makeMachine([{ path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 }]);
    expect(findFile(m, '/home/user')?.path).toBe('/home/user/.dir');
  });

  it('retorna null si no existe', () => {
    const m = makeMachine([]);
    expect(findFile(m, '/nope')).toBeNull();
  });

  it('normaliza trailing slash al buscar directorio', () => {
    const m = makeMachine([{ path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 }]);
    expect(findFile(m, '/tmp/')?.path).toBe('/tmp/.dir');
  });
});

describe('findDirEntry', () => {
  it('encuentra .dir de un directorio', () => {
    const m = makeMachine([{ path: '/srv/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 }]);
    expect(findDirEntry(m, '/srv')?.path).toBe('/srv/.dir');
  });

  it('retorna null si el directorio no existe', () => {
    const m = makeMachine([]);
    expect(findDirEntry(m, '/nope')).toBeNull();
  });

  it('no confunde archivo regular con directorio', () => {
    const m = makeMachine([{ path: '/srv/file.txt', content: 'x', type: 'text', owner: 'root', group: 'root', mode: 0o644 }]);
    expect(findDirEntry(m, '/srv')).toBeNull();
  });
});

describe('findParentDir / resolveParentDirPath', () => {
  it('resuelve el directorio padre de un archivo', () => {
    const m = makeMachine([{ path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 }]);
    expect(findParentDir(m, '/home/user/file.txt')?.path).toBe('/home/user/.dir');
    expect(resolveParentDirPath('/home/user/file.txt')).toBe('/home/user');
  });

  it('resuelve la raíz para archivos en raíz', () => {
    const m = makeMachine([{ path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 }]);
    expect(findParentDir(m, '/file.txt')?.path).toBe('/.dir');
    expect(resolveParentDirPath('/file.txt')).toBe('/');
  });
});

describe('isDirectoryEntry', () => {
  it('true si termina en /.dir', () => {
    expect(isDirectoryEntry({ path: '/tmp/.dir', content: '', type: 'text' })).toBe(true);
  });
  it('false para archivo regular', () => {
    expect(isDirectoryEntry({ path: '/tmp/file.txt', content: '', type: 'text' })).toBe(false);
  });
});

describe('defaultOwnership / buildNewFile', () => {
  const user: User = { username: 'user', uid: 1000, gid: 1000, home: '/home/user', shell: '/bin/bash', groups: [1000] };

  it('construye ownership usando el grupo primario del usuario', () => {
    const m = makeMachine([]);
    const own = defaultOwnership(m, user, 0o644);
    expect(own.owner).toBe('user');
    expect(own.group).toBe('user');
    expect(own.mode).toBe(0o644);
  });

  it('buildNewFile produce un FileEntry con todos los campos', () => {
    const m = makeMachine([]);
    const f = buildNewFile('/tmp/new.txt', 'hello', 'text', defaultOwnership(m, user, 0o644));
    expect(f).toEqual({
      path: '/tmp/new.txt',
      content: 'hello',
      type: 'text',
      owner: 'user',
      group: 'user',
      mode: 0o644,
    });
  });

});

// ── isUnderPath (P0.1: rm -rf no debe llevarse hermanos con prefijo) ──
describe('isUnderPath', () => {
  it('reconoce el directorio y sus descendientes', () => {
    expect(isUnderPath('/home/user/x', '/home/user/x')).toBe(true);
    expect(isUnderPath('/home/user/x/.dir', '/home/user/x')).toBe(true);
    expect(isUnderPath('/home/user/x/secreto.txt', '/home/user/x')).toBe(true);
    expect(isUnderPath('/home/user/x/sub/profundo.txt', '/home/user/x')).toBe(true);
  });

  it('NO confunde un hermano que comparte prefijo', () => {
    // Este es el bug: startsWith('/home/user/x') también matchea xyz.
    expect(isUnderPath('/home/user/xyz', '/home/user/x')).toBe(false);
    expect(isUnderPath('/home/user/xyz/secreto.txt', '/home/user/x')).toBe(false);
    expect(isUnderPath('/home/user/x2/.dir', '/home/user/x')).toBe(false);
    expect(isUnderPath('/home/user', '/home/user/x')).toBe(false);
  });

  it('normaliza la barra final y la raíz', () => {
    expect(isUnderPath('/home/user/x/a.txt', '/home/user/x/')).toBe(true);
    expect(isUnderPath('/a/b/c', '/a/b/')).toBe(true);
    expect(isUnderPath('/cualquier/cosa', '/')).toBe(true);
    expect(isUnderPath('/home/user/xyz', '/')).toBe(true);
  });
});
