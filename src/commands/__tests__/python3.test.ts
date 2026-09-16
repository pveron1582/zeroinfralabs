// ── commands/__tests__/python3.test.ts ──────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests del comando python3/python: one-liners, scripts del filesystem
// virtual, input() interactivo (pythonPendingInput), sys.argv y metadata
// scanResults cuando el script escanea hosts del lab.

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_python3, cmd_python } from '../builtin/python3';
import { createAttacker } from './happyPathHelpers';
import type { CommandContext, Machine } from '../../types';
import { resetNetworkState } from '../../frameworks/network/networkState';

const SCANNER_SRC = [
  'import socket, sys',
  'host = sys.argv[1]',
  'for p in range(1, 100):',
  '    s = socket.socket()',
  '    s.settimeout(0.5)',
  '    try:',
  '        if s.connect_ex((host, p)) == 0:',
  '            print(f"[+] {host}:{p} abierto")',
  '    finally:',
  '        s.close()',
].join('\n');

function makeTarget(): Machine {
  return {
    id: 'target-01',
    machine_info: {
      hostname: 'metasploitable',
      ip: '10.0.0.11',
      mac: '08:00:27:DD:EE:FF',
      os: 'Linux 2.6',
      status: 'up',
      type: 'server',
    },
    discovery_level: 2,
    scan_results: {
      ports: [
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsftpd 2.3.4' },
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 4.7p1' },
        { port: 445, protocol: 'tcp', state: 'closed', service: 'smb', version: '' },
      ],
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };
}

function ctx(over: Partial<CommandContext> = {}): CommandContext {
  const attacker = createAttacker();
  const target = makeTarget();
  return {
    machine: attacker,
    allMachines: [attacker, target],
    currentMissionId: 1,
    currentDir: '/root',
    ...over,
  };
}

function attackerWithScripts(): Machine {
  const m = createAttacker();
  return {
    ...m,
    files: [
      ...m.files,
      { path: '/tmp/saludo.py', content: `print('hola pentesting')\nnombre = input('Quién sos? ')\nprint('Hola', nombre)`, type: 'text' },
      { path: '/tmp/scan.py', content: SCANNER_SRC, type: 'text' },
    ],
  };
}

beforeEach(() => {
  resetNetworkState();
});

describe('python3: básicos', () => {
  it('debe mostrar ayuda sin argumentos', () => {
    const r = cmd_python3.execute([], ctx());
    expect(r.output).toContain('uso');
    expect(r.isError).toBeUndefined();
  });

  it('debe responder --version', () => {
    const r = cmd_python3.execute(['--version'], ctx());
    expect(r.output).toMatch(/Python 3\.\d+\.\d+/);
  });

  it('debe ejecutar one-liners con -c', () => {
    const r = cmd_python3.execute(['-c', `print('Hola desde Python')`], ctx());
    expect(r.output).toBe('Hola desde Python');
    expect(r.isError).toBeUndefined();
  });

  it('debe fallar sin código tras -c', () => {
    const r = cmd_python3.execute(['-c'], ctx());
    expect(r.isError).toBe(true);
  });

  it('debe soportar sys.argv con scripts y argumentos', () => {
    const m = attackerWithScripts();
    const r = cmd_python3.execute(
      ['-c', `import sys\nprint(sys.argv)`],
      ctx({ allMachines: [m] }),
    );
    expect(r.output).toBe("['-c']");
  });

  it('el alias python debe funcionar igual', () => {
    expect(cmd_python.name).toBe('python');
    const r = cmd_python.execute(['-c', `print('ok')`], ctx());
    expect(r.output).toBe('ok');
  });
});

describe('python3: scripts desde el filesystem', () => {
  it('debe ejecutar /tmp/saludo.py con pipedInput para input()', () => {
    const m = attackerWithScripts();
    const r = cmd_python3.execute(['/tmp/saludo.py'], ctx({ machine: m, pipedInput: 'kali' }));
    // pipedInput no hace eco (igual que CPython): el prompt y el print
    // quedan en la misma línea del stdout.
    expect(r.output).toBe('hola pentesting\nQuién sos? Hola kali');
  });

  it('debe pedir input() al terminal cuando no hay datos', () => {
    const m = attackerWithScripts();
    const r = cmd_python3.execute(['/tmp/saludo.py'], ctx({ machine: m }));
    expect(r.output).toBe('hola pentesting\nQuién sos? ');
    expect(r.pythonPendingInput?.argv).toEqual(['/tmp/saludo.py']);
  });

  it('debe completar el script con la entrada acumulada (flujo interactivo)', () => {
    const m = attackerWithScripts();
    const r = cmd_python3.execute(
      ['/tmp/saludo.py'],
      ctx({ machine: m, pythonInputs: ['root'] }),
    );
    expect(r.output).toBe('hola pentesting\nQuién sos? root\nHola root');
    expect(r.pythonPendingInput).toBeUndefined();
  });

  it('debe fallar con el mensaje de archivo inexistente', () => {
    const r = cmd_python3.execute(['/tmp/no-existe.py'], ctx());
    expect(r.output).toBe(
      "python3: can't open file '/tmp/no-existe.py': [Errno 2] No such file or directory",
    );
    expect(r.isError).toBe(true);
  });

  it('debe resolver rutas relativas al currentDir', () => {
    const m = attackerWithScripts();
    const r = cmd_python3.execute(
      ['saludo.py'],
      ctx({ machine: m, currentDir: '/tmp' }),
    );
    expect(r.output).toContain('hola pentesting');
  });
});

describe('python3: scanner contra el lab (metadata)', () => {
  it('debe escanear 10.0.0.11 y emitir scanResults con puertos abiertos', () => {
    const m = attackerWithScripts();
    const result = cmd_python3.execute(
      ['/tmp/scan.py', '10.0.0.11'],
      ctx({ machine: m }),
    );
    expect(result.output).toContain('[+] 10.0.0.11:21 abierto');
    expect(result.output).toContain('[+] 10.0.0.11:22 abierto');
    expect(result.output).not.toContain(':445 abierto');

    const scan = (result as { scanResults?: { targetId: string; targetIp: string; ports: Array<{ port: number; state: string; service: string }> } }).scanResults;
    expect(scan).toBeDefined();
    expect(scan?.targetId).toBe('target-01');
    expect(scan?.targetIp).toBe('10.0.0.11');
    const open = (scan?.ports ?? []).filter(p => p.state === 'open');
    expect(open.map(p => p.port).sort((a, b) => a - b)).toEqual([21, 22]);
    const p21 = (scan?.ports ?? []).find(p => p.port === 21);
    expect(p21?.service).toBe('ftp');
  });

  it('debe no emitir scanResults si el script no conecta a nadie', () => {
    const result = cmd_python3.execute(['-c', `print('sin red')`], ctx());
    expect('scanResults' in result).toBe(false);
  });

  it('debe tratar hosts desconocidos como inalcanzables (errno 113)', () => {
    const src = `import socket\ns = socket.socket()\nprint(s.connect_ex(('9.9.9.9', 80)))`;
    const r = cmd_python3.execute(['-c', src], ctx());
    expect(r.output).toBe('113');
  });

  it('debe conectar a localhost contra la propia máquina', () => {
    const m = attackerWithScripts();
    const attacker = { ...m, scan_results: { ports: [{ port: 4444, protocol: 'tcp', state: 'open', service: 'listener', version: '' }] } };
    const src = `import socket\ns = socket.socket()\nprint('conectado' if s.connect_ex(('127.0.0.1', 4444)) == 0 else 'cerrado')`;
    const r = cmd_python3.execute(['-c', src], ctx({ machine: attacker, allMachines: [attacker] }));
    expect(r.output).toBe('conectado');
  });
});

describe('python3: traceback en la terminal', () => {
  it('debe mostrar el traceback como error del comando', () => {
    const r = cmd_python3.execute(['-c', `print('uno')\nprint(no_existo)`], ctx());
    expect(r.output).toContain('uno\nTraceback (most recent call last):');
    expect(r.output).toContain('NameError: name \'no_existo\' is not defined');
    expect(r.isError).toBe(true);
  });
});
