// ── commands/__tests__/files-changed-behavior.test.ts ──────────────
// Regresiones de comportamiento de la convención `filesChanged` (ver
// reglas estáticas en `files-changed-contract.test.ts` y la convención
// completa en `src/utils/filesChanged.ts`).
//
// El invariante que chequea cada test: el snapshot aplicado por el store
// conserva todo lo que había (salvo un borrado explícito) y nunca repite un
// path. Eso caza deltas construidos de cualquier forma, sin importar en qué
// archivo se armen — que es lo que las reglas estáticas no alcanzan a ver.

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { cmd_wget } from '../tools/wget';
import { executeCommand } from '../index';
import { setMachineFiles } from '../../store/slices/machineMutations';
import type { Machine } from '../../types';
import { apply, ctxFor, mkKali, mkTarget, pathsOf } from './filesChangedFixtures';

const run = (line: string, kali: Machine, target = mkTarget()) =>
  executeCommand({ line, ...ctxFor(kali, [kali, target]) });

describe('filesChanged: regresiones', () => {
  it('wget no vacía el FS: agrega lo descargado y conserva el árbol', () => {
    const kali = mkKali();
    const resp = cmd_wget.execute(['http://10.10.10.11/'], ctxFor(kali, [kali, mkTarget()]));
    expect(resp.isError).toBe(false);
    expect(resp.filesChanged).toBeDefined();

    const after = apply(kali, resp.filesChanged!);
    const paths = pathsOf(after);
    expect(paths).toContain('/root/index.html');
    // 7 originales + 1 descargado. Con el delta viejo quedaba 1.
    expect(after.files).toHaveLength(8);
    expect(new Set(paths).size).toBe(paths.length);
    expect(after.files.find(f => f.path === '/root/flag.txt')?.content).toBe('FLAG{test}\n');
  });

  it('un pipeline con dos segmentos que escriben no duplica el árbol', () => {
    const kali = mkKali();
    const resp = run('echo hola > /root/a.txt | tee /root/b.txt', kali);
    expect(resp.isError).toBeFalsy();
    expect(resp.filesChanged).toBeDefined();

    // El snapshot que sale del executor ya es un árbol válido (no la
    // concatenación de los dos snapshots: eso daba 11 entradas).
    const declared = resp.filesChanged!.map(f => f.path);
    expect(new Set(declared).size).toBe(declared.length);

    const after = apply(kali, resp.filesChanged!);
    expect(declared).toEqual(
      expect.arrayContaining(['/root/a.txt', '/root/b.txt', '/root/flag.txt', '/root/.dir', '/etc/passwd'])
    );
    expect(after.files).toHaveLength(9); // 7 originales + a.txt + b.txt
  });

  it('pipeline con un declarante sin mutación (hashcat -o): no pierde la escritura', () => {
    // hashcat no toca machine.files: su snapshot es la única fuente. Si el
    // materializado del pipeline lo perdiera, out.txt quedaría con
    // "RESULTADO VIEJO" y el potfile ni siquiera aparecería.
    const kali = mkKali();
    const resp = run('hashcat -m 0 hash.txt rockyou.txt -o /root/out.txt | tee /root/intento.txt', kali);
    expect(resp.filesChanged).toBeDefined();

    const after = apply(kali, resp.filesChanged!);
    expect(pathsOf(after)).toEqual(
      expect.arrayContaining(['/root/out.txt', '/root/intento.txt', '/root/.hashcat/hashcat.potfile'])
    );
    expect(after.files.find(f => f.path === '/root/out.txt')?.content).toBe(
      '5d41402abc4b2a76b9719d911017c592:hello\n'
    );
    const declared = resp.filesChanged!.map(f => f.path);
    expect(new Set(declared).size).toBe(declared.length);
  });

  it('redirección no pisa la declaración del comando (crontab -e > log)', () => {
    // crontab sólo DECLARA los spool dirs + el crontab; la escritura del
    // `>` venía después y pisaba el filesChanged entero (se perdían).
    const kali = mkKali();
    const resp = run('crontab -e > /root/salida.txt', kali);
    expect(resp.filesChanged).toBeDefined();

    const after = apply(kali, resp.filesChanged!);
    expect(pathsOf(after)).toEqual(
      expect.arrayContaining([
        '/root/salida.txt',
        '/var/spool/cron/crontabs/root',
        '/root/flag.txt',
      ])
    );
  });

  it('setMachineFiles deduplica un snapshot mal formado (última entrada gana)', () => {
    const kali = mkKali();
    const dup: Machine['files'] = [...kali.files, { ...kali.files[2], content: 'FLAG{editada}\n' }];
    const after = apply(kali, dup);
    expect(after.files).toHaveLength(7);
    expect(after.files.find(f => f.path === '/root/flag.txt')?.content).toBe('FLAG{editada}\n');
  });

  it('setMachineFiles no vacía el árbol con un snapshot vacío', () => {
    const kali = mkKali();
    const maquinas = [kali];
    const after = setMachineFiles(maquinas, kali.id, []);
    expect(after).toBe(maquinas); // ni siquiera crea otro array
    expect(after[0].files).toHaveLength(7);
  });
});

// ── Barrido genérico: cualquier escritura conserva lo anterior ───────
// Caza deltas construidos de cualquier forma en cualquier archivo.
describe('filesChanged: barrido de comandos FS', () => {
  const PASOS: { cmd: string; borra?: string }[] = [
    { cmd: 'touch /root/nuevo.txt' },
    { cmd: 'echo hola > /root/escrito.txt' },
    { cmd: 'mkdir /root/carpetita' },
    { cmd: 'ln -s /etc/passwd /root/enlace' },
    { cmd: 'chmod 600 /root/flag.txt' },
    { cmd: 'curl -o /root/bajada.html http://10.10.10.11/' },
    { cmd: 'wget http://10.10.10.11/' },
    { cmd: 'echo por-pipe | tee /root/tuberia.txt' },
    { cmd: 'crontab -e' },
    { cmd: 'dpkg -i /root/nmap.deb' },
    { cmd: 'rm /root/nuevo.txt', borra: '/root/nuevo.txt' },
  ];

  it('cada paso conserva todo el árbol anterior y no repite paths', () => {
    const target = mkTarget();
    let kali = mkKali();

    for (const paso of PASOS) {
      const resp = run(paso.cmd, kali, target);
      // Escribir sin declarar es exactamente la regla 1, en runtime.
      expect(resp.filesChanged, `${paso.cmd} no declaró filesChanged`).toBeDefined();

      const declared = resp.filesChanged!.map(f => f.path);
      expect(new Set(declared).size, `${paso.cmd} declaró paths repetidos`).toBe(declared.length);

      const antes = pathsOf(kali);
      kali = apply(kali, resp.filesChanged!);
      const despues = pathsOf(kali);
      expect(new Set(despues).size, `${paso.cmd} duplicó el árbol`).toBe(despues.length);
      for (const p of antes) {
        if (p !== paso.borra) {
          expect(despues, `${paso.cmd} perdió ${p}`).toContain(p);
        }
      }
      if (paso.borra) expect(despues).not.toContain(paso.borra);
    }

    expect(pathsOf(kali)).toEqual(
      expect.arrayContaining([
        '/root/index.html',
        '/root/bajada.html',
        '/root/enlace',
        '/root/tuberia.txt',
        '/usr/bin/nmap', // declarado por dpkg, sin mutación in-place
      ])
    );
  });
});
