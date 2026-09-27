// ── utils/__tests__/winPath.test.ts ───────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM)
// Tests de W0 (PLAN_WINDOWS): rutas Windows, identidad machine.win,
// integración con toCleanFilePath/readVirtualFile y permisos.

import { describe, it, expect } from 'vitest';
import { isWinPath, normalizeWinPath, resolveWinPath, winDisplay } from '../winPath';
import { toCleanFilePath, readVirtualFile } from '../fileRead';
import { getCurrentUser } from '../users';
import { createWindowsFileSystem } from '../../fs-models/fs-windows';
import { withWindowsSampleFiles } from '../../fs-models/__fixtures__/windowsSampleFiles';
import type { Machine } from '../../types';

function winMachine(
  win: Partial<NonNullable<Machine['win']>> = {},
  overrides: Partial<Machine> = {},
): Machine {
  return {
    id: 'win-01',
    machine_info: {
      hostname: 'WIN-SERVER', ip: '10.10.10.20', mac: '00:00:00:00:00:20',
      os: 'Windows Server 2019', status: 'active', type: 'victim', family: 'windows',
    },
    discovery_level: 3,
    scan_results: { ports: [] },
    web_enumeration: { web_server: '', cms: '', directories: [] },
    learning_steps: [],
    files: withWindowsSampleFiles(createWindowsFileSystem()),
    win: { currentUser: 'Administrator', isAdmin: false, computerName: 'WIN-SERVER', ...win },
    ...overrides,
  };
}

describe('isWinPath', () => {
  it('debe detectar formas Windows', () => {
    expect(isWinPath('C:\\Users\\admin')).toBe(true);
    expect(isWinPath('C:/Users/admin')).toBe(true);
    expect(isWinPath('C:')).toBe(true);
    expect(isWinPath('/C:/Users/admin')).toBe(true);
  });

  it('debe rechazar rutas no Windows', () => {
    expect(isWinPath('/root/flag')).toBe(false);
    expect(isWinPath('notes.txt')).toBe(false);
    expect(isWinPath('/')).toBe(false);
    expect(isWinPath('')).toBe(false);
  });
});

describe('normalizeWinPath', () => {
  it('debe convertir backslashes a forma canónica /C:/...', () => {
    expect(normalizeWinPath('C:\\Users\\admin')).toBe('/C:/Users/admin');
    expect(normalizeWinPath('C:/Users/admin')).toBe('/C:/Users/admin');
    expect(normalizeWinPath('/C:/Users/admin')).toBe('/C:/Users/admin');
  });

  it('debe resolver . y .. sin bajar del root de la unidad', () => {
    expect(normalizeWinPath('C:\\Users\\admin\\..\\..\\Windows\\win.ini')).toBe('/C:/Windows/win.ini');
    expect(normalizeWinPath('C:/Users/./admin/./')).toBe('/C:/Users/admin');
    expect(normalizeWinPath('C:\\Windows\\..\\..\\..\\x')).toBe('/C:/x');
  });

  it('debe dejar unitaria la raíz de la unidad y sin trailing slash', () => {
    expect(normalizeWinPath('C:\\')).toBe('/C:');
    expect(normalizeWinPath('/C:/')).toBe('/C:');
    expect(normalizeWinPath('C:\\Users\\admin\\')).toBe('/C:/Users/admin');
  });

  it('debe conservar segmentos .dir (marcadores del FS virtual)', () => {
    expect(normalizeWinPath('C:\\Users\\admin\\.dir')).toBe('/C:/Users/admin/.dir');
  });

  it('debe colapsar dobles separadores', () => {
    expect(normalizeWinPath('C:\\\\Users\\\\admin')).toBe('/C:/Users/admin');
  });
});

describe('resolveWinPath', () => {
  const home = '/C:/Users/Administrator';
  const cwd = '/C:/Users/Administrator/Desktop';

  it('debe resolver absolutas con unidad', () => {
    expect(resolveWinPath('C:\\Windows\\win.ini', cwd, home)).toBe('/C:/Windows/win.ini');
    expect(resolveWinPath('C:/Windows/win.ini', cwd, home)).toBe('/C:/Windows/win.ini');
  });

  it('debe resolver absolutas de la unidad actual (\\Users\\...)', () => {
    expect(resolveWinPath('\\Windows\\System32', cwd, home)).toBe('/C:/Windows/System32');
    expect(resolveWinPath('/Windows/System32', cwd, home)).toBe('/C:/Windows/System32');
  });

  it('debe resolver relativas al cwd', () => {
    expect(resolveWinPath('flag.txt', cwd, home)).toBe('/C:/Users/Administrator/Desktop/flag.txt');
    expect(resolveWinPath('..\\Documents\\notes.txt', cwd, home)).toBe('/C:/Users/Administrator/Documents/notes.txt');
    expect(resolveWinPath('.', cwd, home)).toBe(cwd);
  });

  it('debe resolver ~ al home Windows', () => {
    expect(resolveWinPath('~', cwd, home)).toBe(home);
    expect(resolveWinPath('~\\Documents', cwd, home)).toBe('/C:/Users/Administrator/Documents');
    expect(resolveWinPath('~/Documents', cwd, home)).toBe('/C:/Users/Administrator/Documents');
  });

  it('debe devolver la raíz de la unidad con / o \\', () => {
    expect(resolveWinPath('/', cwd, home)).toBe('/C:');
    expect(resolveWinPath('\\', cwd, home)).toBe('/C:');
  });

  it('debe caer al home si el cwd no es Windows', () => {
    expect(resolveWinPath('flag.txt', '/', home)).toBe('/C:/Users/Administrator/flag.txt');
  });
});

// ── Identidad Windows (getCurrentUser) ────────────────────────────

describe('identidad Windows', () => {
  it('debe usar machine.win: usuario no admin ⇒ uid 1000 y home en /C:/Users', () => {
    const user = getCurrentUser(winMachine({ currentUser: 'Administrator', isAdmin: false }));
    expect(user.username).toBe('Administrator');
    expect(user.uid).toBe(1000);
    expect(user.home).toBe('/C:/Users/Administrator');
    expect(user.shell).toBe('C:\\Windows\\System32\\cmd.exe');
  });

  it('debe tratar Administrators como uid 0 (bypass de permisos)', () => {
    const user = getCurrentUser(winMachine({ currentUser: 'Administrator', isAdmin: true }));
    expect(user.username).toBe('Administrator');
    expect(user.uid).toBe(0);
    expect(user.groups).toContain(0);
  });

  it('debe elevar a admin cuando privesc_completed está activo', () => {
    const user = getCurrentUser(winMachine({ currentUser: 'user', isAdmin: false }, { privesc_completed: true }));
    expect(user.username).toBe('user');
    expect(user.uid).toBe(0);
    expect(user.home).toBe('/C:/Users/user');
  });

  it('debe ignorar machine.win en máquinas Linux (sin regresión)', () => {
    const linux: Machine = {
      id: 'victim-01',
      machine_info: { hostname: 'target', ip: '10.0.0.2', mac: '', os: 'Linux', status: 'active', type: 'victim' },
      discovery_level: 3,
      scan_results: { ports: [] },
      web_enumeration: { web_server: '', cms: '', directories: [] },
      learning_steps: [],
      files: [],
    };
    expect(getCurrentUser(linux).username).toBe('user');
    expect(getCurrentUser(linux).uid).toBe(1000);
  });
});

// ── Integración con fileRead ──────────────────────────────────────

describe('toCleanFilePath con rutas Windows', () => {
  const home = '/C:/Users/Administrator';

  it('debe mapear C:\... a la forma canónica del FS', () => {
    expect(toCleanFilePath('C:\\Users\\Administrator\\Desktop\\flag.txt', '/C:', home))
      .toBe('/C:/Users/Administrator/Desktop/flag.txt');
  });

  it('debe resolver relativas desde el cwd Windows', () => {
    expect(toCleanFilePath('notes.txt', '/C:/Users/Administrator/Documents', home))
      .toBe('/C:/Users/Administrator/Documents/notes.txt');
  });

  it('no debe alterar rutas POSIX en máquinas Linux', () => {
    expect(toCleanFilePath('flag.txt', '/root', '/root')).toBe('/root/flag.txt');
    expect(toCleanFilePath('/root/./secret', '/tmp', '/root')).toBe('/root/secret');
    expect(toCleanFilePath('../../etc/passwd', '/home/admin', '/home/admin')).toBe('/etc/passwd');
  });
});

describe('readVirtualFile en máquina Windows', () => {
  it('admin (uid 0) debe leer el SAM a pesar de modo 0600', () => {
    const m = winMachine({ isAdmin: true });
    const admin = getCurrentUser(m);
    const result = readVirtualFile(m, 'C:\\Windows\\System32\\config\\SAM', '/C:/Users/Administrator', admin);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cleanPath).toBe('/C:/Windows/System32/config/SAM');
      expect(result.content).toContain('Administrator');
    }
  });

  it('usuario no admin debe recibir permission-denied en el SAM', () => {
    const m = winMachine({ isAdmin: false });
    const user = getCurrentUser(m);
    const result = readVirtualFile(m, 'C:\\Windows\\System32\\config\\SAM', '/C:/Users/Administrator', user);
    expect(result).toEqual({ ok: false, error: 'permission-denied' });
  });

  it('usuario no admin debe leer su propio flag (es owner) vía ruta relativa', () => {
    const m = winMachine({ currentUser: 'Administrator', isAdmin: false });
    const user = getCurrentUser(m);
    const result = readVirtualFile(m, 'flag.txt', '/C:/Users/Administrator/Desktop', user);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.content).toBe('THM{USER_ACCESS_GRANTED}');
  });

  it('otro usuario no debe leer el flag ajeno (owner Administrator, 0600)', () => {
    const m = winMachine({ currentUser: 'user', isAdmin: false });
    const user = getCurrentUser(m);
    const result = readVirtualFile(
      m, '/C:/Users/Administrator/Desktop/flag.txt', '/C:/Users/user', user,
    );
    expect(result).toEqual({ ok: false, error: 'permission-denied' });
  });

  it('debe devolver not-found para rutas inexistentes', () => {
    const m = winMachine();
    const user = getCurrentUser(m);
    expect(readVirtualFile(m, 'C:\\no\\existe.txt', '/C:', user))
      .toEqual({ ok: false, error: 'not-found' });
  });

  it('debe devolver is-directory al apuntar a un .dir', () => {
    const m = winMachine();
    const user = getCurrentUser(m);
    expect(readVirtualFile(m, 'C:\\Windows', '/C:', user))
      .toEqual({ ok: false, error: 'is-directory' });
  });
});

describe('unidad case-insensitive (cd c:\\ sin ~/.)', () => {
  it('normaliza la unidad a mayúscula', () => {
    expect(normalizeWinPath('c:/Users/Administrator')).toBe('/C:/Users/Administrator');
    expect(normalizeWinPath('/c:/Users')).toBe('/C:/Users');
    expect(normalizeWinPath('C:\\Windows')).toBe('/C:/Windows');
  });

  it('resolveWinPath de una unidad en minúscula cae en /C:', () => {
    expect(resolveWinPath('c:\\', '/C:/Users/Administrator', '/C:/Users/Administrator')).toBe('/C:');
    expect(resolveWinPath('d:/tmp', '/C:/Users', '/C:/Users')).toBe('/D:/tmp');
  });

  it('winDisplay respeta la unidad en mayúscula', () => {
    expect(winDisplay('/c:/Users')).toBe('C:\\Users');
  });
});
