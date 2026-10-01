// ── __tests__/python3-fs.test.ts ─────────────────────────────────
// Integración python3 ↔ FS virtual (mejoras-deep §2.4.3). Los tests del
// intérprete stubbean `readFile` y los de python3.test.ts sólo corren
// scripts; acá se cubre el puente real del comando contra `machine.files`:
// findFile → resolveSymlink → canRead, y la metadata `fileRead` que hace
// falta para que correr un script valide misiones igual que `cat`.

import { describe, it, expect } from 'vitest';
import { cmd_python3 } from '../builtin/python3';
import { createAttacker } from './happyPathHelpers';
import type { CommandContext, Machine } from '../../types';

function ctx(machine: Machine, currentDir = '/root'): CommandContext {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir };
}

function attackerConArchivos(extra: Machine['files']): Machine {
  const m = createAttacker();
  return { ...m, files: [...m.files, ...extra] };
}

/**
 * Máquina sin identidad de root: el id no contiene 'attacker' y no hay su_user
 * ni credenciales, así que getCurrentUser cae al usuario fallback (uid 1000)
 * y los permisos Unix se ejercen de verdad (getOwner ⇒ root por defecto).
 */
function usuarioNormal(): Machine {
  const m = createAttacker();
  return { ...m, id: 'target-01', files: [] };
}

describe('python3 ↔ FS virtual: open()', () => {
  it('debe leer un archivo del FS virtual con ruta absoluta', () => {
    const m = attackerConArchivos([
      { path: '/tmp/notas.txt', content: 'linea uno\nlinea dos', type: 'text' },
    ]);

    const r = cmd_python3.execute(['-c', "print(open('/tmp/notas.txt').read())"], ctx(m));

    expect(r.isError).toBeUndefined();
    expect(r.output).toBe('linea uno\nlinea dos');
  });

  it('debe resolver rutas relativas contra el currentDir', () => {
    const m = attackerConArchivos([
      { path: '/tmp/notas.txt', content: 'desde /tmp', type: 'text' },
    ]);

    const r = cmd_python3.execute(['-c', "print(open('notas.txt').read())"], ctx(m, '/tmp'));

    expect(r.output).toBe('desde /tmp');
  });

  it('debe seguir un symlink hasta el archivo destino', () => {
    const m = attackerConArchivos([
      { path: '/tmp/notas.txt', content: 'contenido real', type: 'text' },
      { path: '/tmp/enlace.txt', content: '', type: 'symlink', linkTarget: '/tmp/notas.txt' },
    ]);

    const r = cmd_python3.execute(['-c', "print(open('/tmp/enlace.txt').read())"], ctx(m));

    expect(r.output).toBe('contenido real');
  });

  it('debe negar la lectura de un archivo sin permisos (canRead)', () => {
    const m = usuarioNormal();
    m.files = [
      { path: '/root/flag.txt', content: 'ZIL{demo}', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
    ];

    // El puente devuelve null cuando canRead falla y el intérprete lo
    // traduce a FileNotFoundError (el simulador no distingue Errno 13).
    const r = cmd_python3.execute(['-c', "print(open('/root/flag.txt').read())"], ctx(m));

    expect(r.isError).toBe(true);
    expect(r.output).toContain('FileNotFoundError');
    expect(r.output).toContain('/root/flag.txt');
  });

  it('debe dejar leer archivos legibles por otros (mode 644)', () => {
    const m = usuarioNormal();
    m.files = [
      { path: '/root/publico.txt', content: 'visible', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ];

    const r = cmd_python3.execute(['-c', "print(open('/root/publico.txt').read())"], ctx(m));

    expect(r.output).toBe('visible');
  });
});

describe('python3 ↔ FS virtual: carga de scripts', () => {
  it('debe negar la ejecución de un script sin permiso de lectura', () => {
    const m = usuarioNormal();
    m.files = [
      { path: '/tmp/privado.py', content: "print('hola')", type: 'text', owner: 'root', group: 'root', mode: 0o600 },
    ];

    const r = cmd_python3.execute(['/tmp/privado.py'], ctx(m, '/tmp'));

    expect(r.isError).toBe(true);
    expect(r.output).toBe("python3: can't open file '/tmp/privado.py': [Errno 13] Permission denied");
  });

  it('debe emitir fileRead al correr un script (validación de misiones)', () => {
    const m = attackerConArchivos([
      { path: '/tmp/lectura.py', content: 'print("ZIL{demo}")', type: 'text' },
    ]);

    const r = cmd_python3.execute(['/tmp/lectura.py'], ctx(m));

    expect(r.isError).toBeUndefined();
    expect(r.fileRead).toEqual({
      path: '/tmp/lectura.py',
      machineId: 'attacker-01',
      isNote: false,
      isFlag: true,
      isPayload: false,
      content: 'print("ZIL{demo}")',
    });
  });
});
