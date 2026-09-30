// ── frameworks/metasploit/__tests__/msfBaseCommands.test.ts ────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Segunda mitad de `executeBaseCommand`: `info`, `show <tipo>`, `options`,
// `unset` y la resolución de `use` por nombre parcial. Todo eso estaba sin
// cubrir (msfBase.ts medía 68% stmts / 56% funcs): los tests previos solo
// pasaban por help, search, use-por-número, set, back, clear y sessions.
//
// Se mantiene en un archivo aparte de msfBase.test.ts para no pasarse de
// las 300 líneas que marca la convención del proyecto.

import { describe, it, expect } from 'vitest';
import { executeBaseCommand } from '../orchestrators/msfBase';
import type { MsfState } from '../core/msfTypes';
import type { Machine, CommandContext } from '../../../types';

const ctx: CommandContext = {
  machine: {
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Windows 7', status: 'up', type: 'server' },
    discovery_level: 2,
    scan_results: { ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  } as Machine,
  allMachines: [],
  currentMissionId: 1,
  currentDir: '/root',
};

const state = (over: Partial<MsfState> = {}): MsfState => ({
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
  ...over,
});

/** Ejecuta y exige respuesta (si devuelve null, el comando no está en base). */
const run = (cmd: string, args: string[], s: MsfState) => {
  const r = executeBaseCommand(cmd, args, s, ctx);
  expect(r, `${cmd} ${args.join(' ')} devolvió null`).not.toBeNull();
  return r!;
};

describe('executeBaseCommand - info', () => {
  it('sin módulo avisa que hay que cargar uno primero', () => {
    const r = run('info', [], state());
    expect(r.output).toContain("No module selected. Use 'use <module>' first.");
  });

  it('con módulo muestra la ficha, el rango y sus opciones con required', () => {
    const r = run('info', [], state({ module: 'exploit/windows/smb/ms17_010_eternalblue' }));
    expect(r.output).toContain('MS17-010 EternalBlue SMB RCE');
    expect(r.output).toContain('Module: exploit/windows/smb/ms17_010_eternalblue');
    expect(r.output).toContain('Rank: average');
    expect(r.output).toContain('Module options (exploit/windows/smb/ms17_010_eternalblue)');
    // Formato de columna: nombre | valor | required (RHOSTS/LHOST = yes).
    expect(r.output).toMatch(/RHOSTS\s+yes/);
    expect(r.output).toMatch(/LHOST\s+yes/);
    expect(r.output).toMatch(/LPORT\s+4444\s+no/);
  });

  it('info mezcla los defaults del módulo con las opciones ya seteadas', () => {
    const r = run('info', [], state({
      module: 'auxiliary/scanner/smb/smb_ms17_010',
      options: { RHOSTS: '10.10.10.7' },
    }));
    // El valor seteado en estado va en la columna de "Current Setting".
    expect(r.output).toMatch(/RHOSTS\s+10\.10\.10\.7\s+yes/);
    // RPORT=445 viene de MODULE_DEFAULTS, no del estado.
    expect(r.output).toMatch(/RPORT\s+445\s+no/);
  });
});

describe('executeBaseCommand - show', () => {
  it('show exploits lista los exploits del framework', () => {
    const r = run('show', ['exploits'], state());
    expect(r.output).toContain('Exploits');
    expect(r.output).toContain('exploit/windows/smb/ms17_010_eternalblue');
    expect(r.output).not.toContain('auxiliary/scanner/smb/smb_ms17_010');
  });

  it('show auxiliary lista los auxiliares', () => {
    const r = run('show', ['auxiliary'], state());
    expect(r.output).toContain('Auxiliary');
    expect(r.output).toContain('auxiliary/scanner/http/squirrelmail_version');
    expect(r.output).not.toContain('exploit/windows/smb/ms17_010_eternalblue');
  });

  it('show payloads lista los payloads', () => {
    const r = run('show', ['payloads'], state());
    expect(r.output).toContain('Compatible Payloads');
    expect(r.output).toContain('payload/windows/x64/meterpreter/reverse_tcp');
  });

  it('show sin destino válido lista las opciones válidas', () => {
    const r = run('show', ['cosas'], state());
    expect(r.output).toContain('Valid show options: exploits, auxiliary, payloads, options');
  });

  it('show sin argumentos cae a la misma ayuda', () => {
    const r = run('show', [], state());
    expect(r.output).toContain('Valid show options');
  });
});

describe('executeBaseCommand - options', () => {
  it('sin módulo avisa que no hay módulo seleccionado', () => {
    const r = run('options', [], state());
    expect(r.output).toContain('No module selected.');
  });

  it('con módulo lista defaults + opciones seteadas con su required', () => {
    const r = run('options', [], state({
      module: 'exploit/windows/smb/ms17_010_eternalblue',
      options: { RHOSTS: '192.168.1.11' },
    }));
    expect(r.output).toContain('Module options (exploit/windows/smb/ms17_010_eternalblue)');
    expect(r.output).toContain('192.168.1.11');
    expect(r.output).toMatch(/PAYLOAD\s+windows\/x64\/meterpreter\/reverse_tcp/);
    expect(r.output).toMatch(/RHOSTS\s+192\.168\.1\.11\s+yes/);
  });
});

describe('executeBaseCommand - unset', () => {
  it('sin argumento muestra el uso', () => {
    const r = run('unset', [], state({ options: { RHOSTS: '10.0.0.1' } }));
    expect(r.output).toContain('Usage: unset <option>');
    // No toca las opciones.
    expect(r.msfStateUpdate!.options.RHOSTS).toBe('10.0.0.1');
  });

  it('elimina la opción sin importar mayúsculas', () => {
    const r = run('unset', ['rhosts'], state({ options: { RHOSTS: '10.0.0.1', RPORT: '445' } }));
    expect(r.output).toContain('Unsetting RHOSTS');
    expect(r.msfStateUpdate!.options.RHOSTS).toBeUndefined();
    expect(r.msfStateUpdate!.options.RPORT).toBe('445');
  });
});

describe('executeBaseCommand - use (resolución por nombre)', () => {
  it('al cargar por número conserva LHOST y RHOSTS ya seteados', () => {
    const conOpts = state({ options: { LHOST: '192.168.1.5', RHOSTS: '192.168.1.11' } });
    const buscado = run('search', ['ms17_010'], conOpts);
    const r = run('use', ['0'], buscado.msfStateUpdate!);

    expect(r.msfStateUpdate!.module).toBe('auxiliary/scanner/smb/smb_ms17_010');
    // Los defaults del módulo no pisan lo que el alumno ya configuró.
    expect(r.msfStateUpdate!.options.LHOST).toBe('192.168.1.5');
    expect(r.msfStateUpdate!.options.RHOSTS).toBe('192.168.1.11');
  });

  it('al cargar por path completo conserva LHOST y RHOSTS', () => {
    const r = run('use', ['exploit/windows/smb/ms17_010_eternalblue'],
      state({ options: { LHOST: '192.168.1.5', RHOSTS: '192.168.1.11' } }));

    expect(r.msfStateUpdate!.module).toBe('exploit/windows/smb/ms17_010_eternalblue');
    expect(r.msfStateUpdate!.options.LHOST).toBe('192.168.1.5');
    expect(r.msfStateUpdate!.options.RHOSTS).toBe('192.168.1.11');
  });

  it('un nombre corto sin path carga el único módulo que coincide', () => {
    // 'smb_doublepulsar_rce' aparece en un solo path.
    const r = run('use', ['smb_doublepulsar_rce'], state());
    expect(r.msfStateUpdate!.module).toBe('exploit/windows/smb/smb_doublepulsar_rce');
  });

  it('con varios coincidentes elige el exploit cuando el query lo pide', () => {
    // 'ms17_010' coincide con un auxiliary y dos exploits.
    const r = run('use', ['exploit/ms17_010'], state());
    expect(r.msfStateUpdate!.module).toBe('exploit/windows/smb/ms17_010_eternalblue');
    expect(r.msfStateUpdate!.moduleType).toBe('exploit');
  });

  it('con varios coincidentes elige el auxiliary cuando el query lo pide', () => {
    const r = run('use', ['auxiliary/smb'], state());
    expect(r.msfStateUpdate!.module).toBe('auxiliary/scanner/smb/smb_ms17_010');
    expect(r.msfStateUpdate!.moduleType).toBe('auxiliary');
  });

  it('el prefijo "scanner" también resuelve a auxiliary', () => {
    const r = run('use', ['scanner/smb'], state());
    expect(r.msfStateUpdate!.moduleType).toBe('auxiliary');
  });

  it('sin prefijo de tipo, con varios matches, toma el primero de la lista', () => {
    // 'tcp' coincide con un auxiliary y dos payloads (ningún exploit):
    // no hay tipo preferido ni exploit entre los matches.
    const r = run('use', ['tcp'], state());
    expect(r.msfStateUpdate!.module).toBe('auxiliary/scanner/portscan/tcp');
  });

  it('si el último segmento no coincide, reintenta buscando por palabras', () => {
    // El query se parte por ESPACIOS (no por "/"). Como ninguna ruta tiene
    // las dos palabras a la vez, cae al fallback: agarra el primer exploit
    // que contenga alguna de ellas.
    const r = run('use', ['exploit', 'nosuchmod'], state());
    expect(r.output).not.toContain('Failed to load module');
    expect(r.msfStateUpdate!.module).toMatch(/^exploit\//);
    expect(r.msfStateUpdate!.moduleType).toBe('exploit');
  });

  it('el fallback sin prefijo de tipo toma el primer módulo que matchee', () => {
    // Sin "exploit"/"auxiliary" en el query no hay tipo preferido: se queda
    // con el primer path que contenga alguna palabra.
    const r = run('use', ['smb', 'zzzz'], state());
    expect(r.output).not.toContain('Failed to load module');
    expect(r.msfStateUpdate!.module).toBe('auxiliary/scanner/smb/smb_ms17_010');
  });
});
