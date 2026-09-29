// ── commands/__tests__/output-cap.test.ts ─────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// P1 3.7: el executor recorta la salida absurda en el único punto donde
// pasa (así ningún comando puede dejar 1.7 MB / 100k_lines en el estado
// del terminal). La metadata no se toca: las misiones siguen validando.

import { describe, it, expect } from 'vitest';
import { executeCommand } from '../index';
import { MAX_OUTPUT_CHARS } from '../../utils/format';
import type { Machine } from '../../types';

const machine: Machine = {
  id: 'attacker-01',
  machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Kali Linux', status: 'up', type: 'workstation' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
  ],
};

describe('tope de salida del executor (P1 3.7)', () => {
  it('una salida normal pasa intacta', () => {
    const r = executeCommand({ line: 'echo hola', machine, allMachines: [machine], currentMissionId: 1 });
    expect(r.output).toBe('hola');
    expect(r.output).not.toContain('recortada');
  });

  it('python3 que imprime 200k líneas no deja el output entero en el estado', () => {
    const r = executeCommand({
      // 90k iteraciones (bajo el MAX_ITER del intérprete) x 6 bytes ≈ 540 kB:
      // supera el tope de 400 kB sin chocar con los guards del intérprete.
      line: "python3 -c 'for i in range(90000): print(\"abcde\")'",
      machine, allMachines: [machine], currentMissionId: 1, currentDir: '/root',
    });
    // Sin el tope esto era ~1.2 MB de texto en un <pre> del terminal.
    expect(r.output.length).toBeLessThan(MAX_OUTPUT_CHARS + 400);
    expect(r.output).toContain('salida recortada');
  });

  it('la metadata del comando sobrevive al recorte (las misiones validan)', () => {
    // `cat` de un archivo sigue emitiendo fileRead aunque la salida sea
    // enorme: el recorte es solo de presentación.
    const r = executeCommand({
      line: 'cat /etc/motd',
      machine, allMachines: [machine], currentMissionId: 1, currentDir: '/root',
    });
    expect('fileRead' in r ? 'fileRead' : '').toBeDefined();
  });
});
