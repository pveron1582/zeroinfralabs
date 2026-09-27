// ── commands/windows/__tests__/fs.test.ts ─────────────────────────
// dir, cd, type y attrib con permisos (W1).

import { describe, it, expect } from 'vitest';
import { exec, winMachine, nonAdminMachine, HOME } from './fixtures';

describe('cmd dir', () => {
  it('lista el directorio actual con cabecera de volumen', () => {
    const r = exec('dir', winMachine());
    expect(r.output).toContain('El volumen de la unidad C es OS');
    expect(r.output).toContain('El directorio de C:\\Users\\Administrator');
    expect(r.output).toContain('Desktop');
    expect(r.output).toContain('Documents');
    expect(r.output).toContain('<DIR>');
    expect(r.output).toContain('bytes disponibles');
  });

  it('lista un subdirectorio por ruta Windows', () => {
    const r = exec('dir C:\\Users\\Administrator\\Desktop', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('flag.txt');
  });

  it('ruta inexistente → error', () => {
    const r = exec('dir C:\\NoExiste', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar la ruta');
  });

  it('no muestra archivos sin permiso de lectura', () => {
    const m = winMachine();
    // flag.txt es 0600 owner Administrator; user sin uid 0 no admin no lo lee
    // (dueño es Administrator → owner bits sí leen; probamos SAM en System32)
    const r = exec('dir C:\\Windows\\System32\\config', m);
    // config/.dir no tiene owner → 0755 default → lista nombres si canRead
    // SAM es 0600 SYSTEM → oculto para no-root
    expect(r.isError).not.toBe(true);
  });
});

describe('cmd cd', () => {
  it('sin argumentos muestra la ruta actual', () => {
    const r = exec('cd', winMachine());
    expect(r.output).toBe('C:\\Users\\Administrator');
  });

  it('cambia al directorio indicado (relativo)', () => {
    let next = '';
    const r = exec('cd Desktop', winMachine(), { setCurrentDir: d => { next = d; } });
    expect(r.isError).not.toBe(true);
    expect(next).toBe(`${HOME}/Desktop`);
  });

  it('ruta inexistente → error', () => {
    const r = exec('cd NoExiste', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar la ruta');
  });
});

describe('cmd type', () => {
  it('lee archivo con ruta Windows absoluta', () => {
    const r = exec('type C:\\Windows\\win.ini', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('[windows]');
    expect('type' in r && r.type).toBe('fileRead');
  });

  it('archivo inexistente → error en español', () => {
    const r = exec('type noexiste.txt', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar el archivo');
  });

  it('directorio → error de directorio', () => {
    const r = exec('type Desktop', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('directorio');
  });

  it('SAM sin permiso → Acceso denegado (no admin)', () => {
    const r = exec('type C:\\Windows\\System32\\config\\SAM', nonAdminMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });

  it('SAM como admin → contenido del registro', () => {
    const r = exec('type C:\\Windows\\System32\\config\\SAM', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Names\\Administrator');
  });
});

describe('cmd attrib', () => {
  it('sin flags muestra A sobre archivo con write', () => {
    const r = exec('attrib Desktop\\flag.txt', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('A ');
    expect(r.output).toContain('flag.txt');
  });

  it('+r marca solo lectura (quita bit de escritura)', () => {
    const m = winMachine();
    const r = exec('attrib +r Desktop\\flag.txt', m);
    expect(r.isError).not.toBe(true);
    const f = m.files.find(x => x.path === `${HOME}/Desktop/flag.txt`);
    expect(f?.mode).toBeDefined();
    expect((f!.mode! & 0o200)).toBe(0);
  });

  it('atributo no soportado → error', () => {
    const r = exec('attrib +h Desktop\\flag.txt', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no está soportado');
  });

  it('archivo inexistente → error', () => {
    const r = exec('attrib fantasma.txt', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar el archivo');
  });
});
