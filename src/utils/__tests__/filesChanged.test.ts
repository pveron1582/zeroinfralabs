// ── utils/__tests__/filesChanged.test.ts ───────────────────────────
// Tests unitarios de la convención `filesChanged` (snapshot completo del
// árbol) y de su materialización. Las regresiones de los bugs reales —
// wget vaciando el FS y el pipeline duplicándolo o perdiendo escrituras de
// los comandos que sólo declaran — viven en
// `src/commands/__tests__/files-changed-behavior.test.ts`.
import { describe, it, expect } from 'vitest';
import { upsertFiles, uniqueFiles, materializeDeclared } from '../filesChanged';
import type { FileEntry } from '../../types';

const file = (path: string, content = ''): FileEntry =>
  ({ path, content, type: 'text', owner: 'root', group: 'root', mode: 0o644 });

describe('upsertFiles (materialización de una declaración)', () => {
  it('el cambio gana: pisa el contenido de un path existente', () => {
    const merged = upsertFiles([file('/root/index.html', 'viejo')], [file('/root/index.html', 'nuevo')]);
    expect(merged).toHaveLength(1);
    expect(merged[0].content).toBe('nuevo');
  });

  it('no pierde escrituras de los comandos que sólo declaran (hashcat -o)', () => {
    // hashcat no muta machine.files in-place: su declaración es la única
    // fuente. Con preferencia "base" el output se perdía.
    const base = [file('/etc/passwd'), file('/root/out.txt', 'hash:resultado viejo\n')];
    const declarado = [...base.slice(0, 1), file('/root/out.txt', 'hash:resultado\n')];
    const merged = upsertFiles(base, declarado);
    expect(merged.find(f => f.path === '/root/out.txt')?.content).toBe('hash:resultado\n');
  });

  it('agrega lo nuevo sin tocar el resto del árbol', () => {
    const passwd = file('/etc/passwd', 'root:x:0:0');
    const merged = upsertFiles([passwd, file('/root/.dir')], [file('/root/index.html', '<h1/>')]);
    expect(merged.map(f => f.path)).toEqual(['/etc/passwd', '/root/.dir', '/root/index.html']);
    expect(merged[0]).toBe(passwd);
  });

  it('preserva el orden de base y agrega los nuevos al final', () => {
    const base = [file('/etc/passwd'), file('/root/.dir'), file('/root/a.txt')];
    const merged = upsertFiles(base, [file('/root/b.txt'), file('/root/a.txt', 'x')]);
    expect(merged.map(f => f.path)).toEqual(['/etc/passwd', '/root/.dir', '/root/a.txt', '/root/b.txt']);
  });

  it('no duplica paths ni muta las entradas originales', () => {
    const base = [file('/root/index.html', 'viejo')];
    const merged = upsertFiles(base, [file('/root/index.html', 'nuevo'), file('/root/index.html', 'final')]);
    expect(merged).toHaveLength(1);
    expect(merged[0].content).toBe('final');
    expect(base[0].content).toBe('viejo');
  });

  it('con base vacía o indefinida funciona igual', () => {
    expect(upsertFiles(undefined, [file('/x')]).map(f => f.path)).toEqual(['/x']);
    expect(upsertFiles([], [])).toEqual([]);
  });
});

describe('materializeDeclared (lo que hace el dispatcher)', () => {
  it('materializa la declaración sobre el árbol in-place', () => {
    const machine = { files: [file('/etc/passwd'), file('/root/out.txt', 'VIEJO')] };
    materializeDeclared(machine, [file('/root/out.txt', 'NUEVO'), file('/usr/bin/nmap', 'ELF')]);
    expect(machine.files.map(f => f.path)).toEqual(['/etc/passwd', '/root/out.txt', '/usr/bin/nmap']);
    expect(machine.files[1].content).toBe('NUEVO');
  });

  it('sin declaración o con un snapshot vacío no toca el árbol', () => {
    const machine = { files: [file('/etc/passwd')] };
    materializeDeclared(machine, undefined);
    materializeDeclared(machine, []);
    expect(machine.files).toHaveLength(1);
  });
});

describe('uniqueFiles', () => {
  it('devuelve el mismo array cuando no hay repetidos', () => {
    const files = [file('/etc/passwd'), file('/root/.dir')];
    expect(uniqueFiles(files)).toBe(files);
  });

  it('quita los repetidos y conserva la última (más nueva) entrada', () => {
    const viejo = file('/root/a.txt', 'hola');
    const nuevo = file('/root/a.txt', 'adios');
    const other = file('/etc/passwd');
    expect(uniqueFiles([viejo, other, nuevo])).toEqual([nuevo, other]);
  });
});
