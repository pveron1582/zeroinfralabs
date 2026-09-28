// ── commands/builtin/__tests__/path-prefix-regression.test.ts ─────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Regresión P0.1: los comandos que operan "todo lo que cuelga de un
// directorio" usaban `path.startsWith(dir)` sin frontera, así que tomaban
// de rebote a un hermano con prefijo común:
//
//   /home/user/x/   +   /home/user/xyz/precioso.txt
//   `rm -rf /home/user/x`  → se llevaba también xyz (pérdida de datos)
//
// Ningún lab tiene "undo": el alumno perdía el progreso del escenario.

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_rm } from '../rm';
import { cmd_cp } from '../cp';
import { cmd_mv } from '../mv';
import { cmd_rmdir } from '../rmdir';
import { cmd_chgrp } from '../chgrp';
import { cmd_chown } from '../chown';
import { cmd_chmod } from '../chmod';
import type { CommandContext, FileEntry, Machine } from '../../../types';

const DIR = '/home/user/x';
const SIBLING = '/home/user/xyz';

function makeMachine(): Machine {
  const files: FileEntry[] = [
    { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: `${DIR}/.dir`, content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: `${DIR}/secreto.txt`, content: 'dato de x', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    { path: `${DIR}/sub/.dir`, content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: `${DIR}/sub/oculto.txt`, content: 'dato de x/sub', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    { path: `${SIBLING}/.dir`, content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: `${SIBLING}/precioso.txt`, content: 'NO TOCAR', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/passwd', content: 'root:x:0:0::/root:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    // chgrp valida el grupo contra /etc/group
    { path: '/etc/group', content: 'root:x:0:\nadm:x:4:\nuser:x:1000:\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ];
  return {
    id: 'm1',
    machine_info: { hostname: 'test', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files,
    // El usuario actual es root: los permisos no tapan el bug de rutas.
    found_credentials: [{ file: '', user: 'root', pass: 'root', verified: true }],
  };
}

let machine: Machine;
let ctx: CommandContext;

beforeEach(() => {
  machine = makeMachine();
  ctx = {
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    currentDir: '/home/user',
  };
});

const paths = () => (machine.files || []).map(f => f.path).sort();

describe('rm -rf no se lleva hermanos con prefijo común', () => {
  it('borra el directorio pedido y todo lo suyo', () => {
    const r = cmd_rm.execute(['-rf', DIR], ctx);
    expect(r.isError).not.toBe(true);
    expect(paths()).toEqual([
      '/etc/.dir', '/etc/group', '/etc/passwd', '/home/.dir', '/home/user/.dir',
      `${SIBLING}/.dir`, `${SIBLING}/precioso.txt`, '/tmp/.dir',
    ].sort());
  });

  it('conserva intacto al hermano xyz', () => {
    cmd_rm.execute(['-rf', DIR], ctx);
    const hermano = machine.files?.find(f => f.path === `${SIBLING}/precioso.txt`);
    expect(hermano).toBeDefined();
    expect(hermano?.content).toBe('NO TOCAR');
    expect(machine.files?.some(f => f.path === `${SIBLING}/.dir`)).toBe(true);
  });

  it('no se lleva el padre /home/user ni el subdirectorio hermano', () => {
    // `rm -rf /home/user/x/sub` borra solo `sub`: ni `x` (padre) ni `xyz`.
    cmd_rm.execute(['-rf', `${DIR}/sub`], ctx);
    expect(machine.files?.some(f => f.path === `${DIR}/sub/.dir`)).toBe(false);
    expect(machine.files?.some(f => f.path === `${DIR}/.dir`)).toBe(true);
    expect(machine.files?.some(f => f.path === `${DIR}/secreto.txt`)).toBe(true);
    expect(machine.files?.some(f => f.path === '/home/user/.dir')).toBe(true);
    expect(machine.files?.some(f => f.path === `${SIBLING}/precioso.txt`)).toBe(true);
  });
});

describe('cp -r no copia hermanos con prefijo común', () => {
  it('copia solo el subárbol del origen', () => {
    const r = cmd_cp.execute(['-r', DIR, '/tmp/copia'], ctx);
    expect(r.isError).not.toBe(true);
    const copiados = (machine.files || []).map(f => f.path).filter(p => p.startsWith('/tmp/copia'));
    expect(copiados.sort()).toEqual([
      '/tmp/copia/.dir',
      '/tmp/copia/secreto.txt',
      '/tmp/copia/sub/.dir',
      '/tmp/copia/sub/oculto.txt',
    ]);
    // El hermano sigue donde estaba y NO aparece dentro de la copia
    expect(machine.files?.some(f => f.path === `${SIBLING}/precioso.txt`)).toBe(true);
    expect(copiados.some(p => p.includes('xyz'))).toBe(false);
  });
});

describe('mv no mueve ni borra hermanos con prefijo común', () => {
  it('mueve el subárbol y deja el hermano quieto', () => {
    const r = cmd_mv.execute([DIR, '/tmp/movido'], ctx);
    expect(r.isError).not.toBe(true);
    expect(machine.files?.some(f => f.path === '/tmp/movido/sub/oculto.txt')).toBe(true);
    expect(machine.files?.some(f => f.path === `${DIR}/sub/oculto.txt`)).toBe(false);
    // xyz intacto
    expect(machine.files?.some(f => f.path === `${SIBLING}/precioso.txt`)).toBe(true);
    expect(machine.files?.some(f => f.path === `${SIBLING}/.dir`)).toBe(true);
  });
});

describe('rmdir no confunde un hermano con contenido dentro', () => {
  it('un dir vacío se borra aunque exista un hermano con prefijo', () => {
    const r = cmd_rmdir.execute([SIBLING], ctx);
    // xyz tiene un archivo → no vacío (mensaje correcto, no por el bug)
    expect(r.output).toContain('not empty');

    // Ahora Creamos un dir vacío con hermanoCommon prefix
    machine.files?.push({ path: '/home/user/xv/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 });
    const ok = cmd_rmdir.execute(['/home/user/xv'], ctx);
    expect(ok.isError).not.toBe(true);
    expect(machine.files?.some(f => f.path === '/home/user/xv/.dir')).toBe(false);
  });
});

describe('chmod/chown/chgrp -R no tocan hermanos con prefijo común', () => {
  it('chown -R /home/user/x deja xyz con el owner original', () => {
    machine.files = machine.files?.map(f => ({ ...f, owner: 'user' }));
    cmd_chown.execute(['-R', 'root', DIR], ctx);
    expect(machine.files?.find(f => f.path === `${DIR}/sub/oculto.txt`)?.owner).toBe('root');
    expect(machine.files?.find(f => f.path === `${SIBLING}/precioso.txt`)?.owner).toBe('user');
  });

  it('chgrp -R /home/user/x deja xyz con el group original', () => {
    cmd_chgrp.execute(['-R', 'adm', DIR], ctx);
    expect(machine.files?.find(f => f.path === `${DIR}/secreto.txt`)?.group).toBe('adm');
    expect(machine.files?.find(f => f.path === `${SIBLING}/precioso.txt`)?.group).toBe('user');
  });

  it('chmod -R 700 /home/user/x deja xyz con el modo original', () => {
    cmd_chmod.execute(['-R', '700', DIR], ctx);
    expect(machine.files?.find(f => f.path === `${DIR}/secreto.txt`)?.mode).toBe(0o700);
    expect(machine.files?.find(f => f.path === `${SIBLING}/precioso.txt`)?.mode).toBe(0o644);
  });
});
