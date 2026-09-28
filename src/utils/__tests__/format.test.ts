// ── utils/__tests__/format.test.ts ─────────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Consolidación de formato (P1 3.5): tamaños y fecha virtual tienen UNA
// sola implementación, y `ls -l` y `stat` deben coincidir.

import { describe, it, expect } from 'vitest';
import {
  formatBytes, formatBytesBinary, formatMegabytes, formatLsDate,
  stableTimestamp, hashPath,
} from '../format';
import { homeDirFor, isRoot } from '../users';
import type { User } from '../../types';

describe('formatBytes (estilo ls -h / du -h)', () => {
  it('usa la unidad correcta según el tamaño', () => {
    expect(formatBytes(0)).toBe('0');
    expect(formatBytes(512)).toBe('512');
    expect(formatBytes(1023)).toBe('1023');
    expect(formatBytes(1024)).toBe('1.0K');
    expect(formatBytes(1536)).toBe('1.5K');
    expect(formatBytes(1024 * 1024)).toBe('1.0M');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0G');
    expect(formatBytes(3.4 * 1024 * 1024 * 1024)).toBe('3.4G');
  });

  it('nunca imprime negativos, NaN ni Infinity', () => {
    expect(formatBytes(-1)).toBe('0');
    expect(formatBytes(NaN)).toBe('0');
    expect(formatBytes(Infinity)).toBe('0');
    expect(formatBytesBinary(NaN)).toBe('0.0Ki');
    expect(formatMegabytes(NaN)).toBe('0M');
  });
});

describe('formatBytesBinary (estilo free) y formatMegabytes (estilo df)', () => {
  it('usa Ki/Mi/Gi con base 1024', () => {
    expect(formatBytesBinary(512)).toBe('0.5Ki');
    expect(formatBytesBinary(2 * 1024 * 1024)).toBe('2.0Mi');
    expect(formatBytesBinary(4 * 1024 * 1024 * 1024)).toBe('4.0Gi');
  });

  it('df escala a G recién pasado el GiB', () => {
    expect(formatMegabytes(512)).toBe('512M');
    expect(formatMegabytes(1024)).toBe('1.0G');
    expect(formatMegabytes(20480)).toBe('20.0G');
  });
});

describe('fecha virtual única (ls -l y stat)', () => {
  it('stableTimestamp es determinístico por path', () => {
    expect(stableTimestamp('/etc/passwd')).toBe(stableTimestamp('/etc/passwd'));
    expect(stableTimestamp('/etc/passwd')).not.toBe(stableTimestamp('/etc/shadow'));
  });

  it('formatLsDate deriva del MISMO timestamp que stat', () => {
    // Antes `ls -l` y `stat` hasheaban el path por separado y mostraban
    // fechas distintas para el mismo archivo.
    for (const p of ['/etc/passwd', '/root/flag.txt', '/home/user/a.txt']) {
      const ts = stableTimestamp(p);
      const esperado = `${ts.slice(0, 4)}-${ts.slice(5, 7)}-${ts.slice(8, 10)}`;
      const [, mes, dia] = esperado.split('-');
      const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // `ls -l` patea el día con espacio ("Nov  9 20:53"), no con cero.
      expect(formatLsDate(p), p).toContain(`${meses[Number(mes) - 1]} ${String(Number(dia)).padStart(2, ' ')}`);
      // La hora que muestra `ls -l` es la misma que la de `stat`.
      expect(formatLsDate(p), p).toContain(ts.slice(11, 16));
    }
  });

  it('hashPath es estable y positivo', () => {
    expect(hashPath('/a')).toBe(hashPath('/a'));
    expect(hashPath('/a')).toBeGreaterThanOrEqual(0);
  });
});

describe('homeDirFor (P1 3.5: el bug de /home/root)', () => {
  it('root vive en /root, no en /home/root', () => {
    // El bug: un `ssh root@victim` dejaba el cwd en /home/root porque una
    // de las tres copias de la regla interpolaba sin el caso root.
    expect(homeDirFor('root')).toBe('/root');
    expect(homeDirFor('john')).toBe('/home/john');
    expect(homeDirFor('helpdesk')).toBe('/home/helpdesk');
    expect(homeDirFor(undefined)).toBe('/');
  });
});

describe('isRoot (fuente única)', () => {
  const u = (over: Partial<User>): User => ({
    username: 'x', uid: 1000, gid: 1000, home: '/home/x', shell: '/bin/bash', groups: [1000], ...over,
  });
  it('reconoce root por uid 0 o por nombre', () => {
    expect(isRoot(u({ username: 'root', uid: 0 }))).toBe(true);
    expect(isRoot(u({ username: 'root', uid: 1000 }))).toBe(true);
    expect(isRoot(u({ username: 'john', uid: 1000 }))).toBe(false);
    expect(isRoot(null)).toBe(false);
  });
});
