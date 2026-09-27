// ── commands/windows/__tests__/fsWrite.test.ts ────────────────────
// copy, move, del, mkdir y rmdir con permisos (W1).

import { describe, it, expect } from 'vitest';
import { exec, winMachine, nonAdminMachine, HOME } from './fixtures';

describe('cmd mkdir / rmdir', () => {
  it('mkdir crea el directorio', () => {
    const m = winMachine();
    const r = exec('mkdir nuevo', m);
    expect(r.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/nuevo/.dir`)).toBe(true);
    expect(r.filesChanged).toBeDefined();
  });

  it('mkdir sobre directorio existente → error', () => {
    const m = winMachine();
    const r = exec('mkdir Desktop', m);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('ya existe');
  });

  it('rmdir borra directorio vacío', () => {
    const m = winMachine();
    exec('mkdir vacio', m);
    const r = exec('rmdir vacio', m);
    expect(r.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/vacio/.dir`)).toBe(false);
  });

  it('rmdir sobre directorio no vacío → error', () => {
    const m = winMachine();
    const r = exec('rmdir Desktop', m);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no está vacío');
  });

  it('rmdir inexistente → error', () => {
    const r = exec('rmdir fantasma', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar la ruta');
  });
});

describe('cmd copy', () => {
  it('copia archivo a otro nombre', () => {
    const m = winMachine();
    const r = exec('copy Desktop\\flag.txt Desktop\\flag2.txt', m);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('copiado');
    const f = m.files.find(x => x.path === `${HOME}/Desktop/flag2.txt`);
    expect(f?.content).toBe('THM{USER_ACCESS_GRANTED}');
  });

  it('origen inexistente → error', () => {
    const r = exec('copy fantasma.txt Desktop', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar el archivo');
  });

  it('SAM sin permiso → Acceso denegado (no admin)', () => {
    const r = exec(
      'copy C:\\Windows\\System32\\config\\SAM Desktop\\sam.txt',
      nonAdminMachine(),
    );
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });
});

describe('cmd move', () => {
  it('renombra archivo', () => {
    const m = winMachine();
    const r = exec('move Desktop\\flag.txt Desktop\\renombrado.txt', m);
    expect(r.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/Desktop/flag.txt`)).toBe(false);
    expect(m.files.some(f => f.path === `${HOME}/Desktop/renombrado.txt`)).toBe(true);
  });

  it('origen inexistente → error', () => {
    const r = exec('move fantasma.txt Desktop', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar el archivo');
  });
});

describe('cmd del', () => {
  it('elimina archivo propio', () => {
    const m = winMachine();
    exec('copy Desktop\\flag.txt Desktop\\borrar.txt', m);
    const r = exec('del Desktop\\borrar.txt', m);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('eliminado');
    expect(m.files.some(f => f.path === `${HOME}/Desktop/borrar.txt`)).toBe(false);
  });

  it('SAM como no admin → Acceso denegado (parent config sin write)', () => {
    const r = exec('del C:\\Windows\\System32\\config\\SAM', nonAdminMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });

  it('archivo inexistente → error', () => {
    const r = exec('del fantasma.txt', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se encuentra');
  });
});
