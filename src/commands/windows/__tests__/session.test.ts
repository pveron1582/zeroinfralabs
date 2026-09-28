// ── commands/windows/__tests__/session.test.ts ────────────────────
// echo, set, cls, ver, cmd, powershell y help (W1).

import { describe, it, expect } from 'vitest';
import { exec, winMachine } from './fixtures';
import { DEFAULT_ENV } from '../../../utils/environment';
import { resetProcessManager } from '../../../frameworks/process/processManager';

describe('cmd sesión (cmd.exe)', () => {
  it('echo imprime el texto', () => {
    expect(exec('echo hola windows', winMachine()).output).toBe('hola windows');
  });

  it('echo sin argumentos indica que está activado', () => {
    expect(exec('echo', winMachine()).output).toContain('activado');
  });

  it('set FOO=bar actualiza el env y set lo lista', () => {
    let env = DEFAULT_ENV(winMachine());
    const r = exec('set FOO=bar', winMachine(), {
      env,
      setEnv: e => { env = e; },
    });
    expect(r.isError).not.toBe(true);
    expect(env.FOO).toBe('bar');

    const list = exec('set', winMachine(), { env });
    expect(list.output).toContain('FOO=bar');
  });

  it('set NAME sin = consulta la variable', () => {
    const env = { ...DEFAULT_ENV(winMachine()), MODO: 'admin' };
    const r = exec('set MODO', winMachine(), { env });
    expect(r.output).toBe('MODO=admin');
  });

  it('cls pide limpiar la pantalla vía metadata (P0.4)', () => {
    const r = exec('cls', winMachine());
    expect(r.output).toBe('');
    expect('clearScreen' in r && r.clearScreen).toBe(true);
  });

  it('ver muestra la versión de Windows', () => {
    const r = exec('ver', winMachine());
    expect(r.output).toContain('Microsoft Windows [Version');
    expect(r.output).toContain('10.0.17763');
  });

  it('cmd muestra banner de versión sin prompt duplicado', () => {
    // El prompt lo dibuja la línea de input de la terminal; si el banner lo
    // incluyera se vería dos veces (el segundo un renglón abajo).
    const r = exec('cmd', winMachine());
    expect(r.output).toContain('Microsoft Windows [Version');
    expect(r.output).not.toContain('C:\\Users\\Administrator>');
  });

  it('powershell muestra banner de PowerShell', () => {
    const r = exec('powershell', winMachine());
    expect(r.output).toContain('Windows PowerShell');
    expect(r.output).not.toContain('PS C:\\Users\\Administrator>');
  });

  it('help lista comandos Windows', () => {
    const r = exec('help', winMachine());
    expect(r.output).toContain('Comandos de Windows');
    expect(r.output).toContain('dir');
    expect(r.output).toContain('cmd.exe');
    expect(r.output).toContain('schtasks');
  });

  it('comando desconocido → Command not found (mensaje base)', () => {
    const r = exec('noexiste123', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found');
  });
});

describe('cmd /c (ejecuta el hijo vía runChild)', () => {
  it('cmd /c <comando> ejecuta y devuelve la salida del hijo', () => {
    const r = exec('cmd /c echo hola-mundo', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('hola-mundo');
  });

  it('cmd /k se comporta igual que /c (no hay sesión interactiva)', () => {
    const r = exec('cmd /k echo keep', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('keep');
  });

  it('propaga metadatos: cmd /c type de la flag dispara fileRead', () => {
    const r = exec('cmd /c type C:\\Users\\Administrator\\Desktop\\flag.txt', winMachine());
    expect(r.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(true);
  });

  it('comando inexistente usa el mensaje clásico de cmd.exe', () => {
    const r = exec('cmd /c noexiste123', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no se reconoce como un comando interno');
    expect(r.output).not.toContain('Command not found');
  });

  it('cmd /c sin comando no falla', () => {
    const r = exec('cmd /c', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('');
  });

  it('anidación legítima (cmd /c cmd /c ...) no la corta el guard', () => {
    const r = exec('cmd /c cmd /c echo profundo', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('profundo');
  });

  it('funciona dentro de una sesión PowerShell (native dispatch)', () => {
    const m = winMachine();
    exec('powershell', m);
    const r = exec('cmd /c echo desde-ps', m);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('desde-ps');
  });

  it('detecta el ciclo de un alias que expande a cmd /c <mismo alias>', () => {
    exec("alias foo='cmd /c foo'", winMachine());
    try {
      const r = exec('foo', winMachine());
      expect(r.isError).toBe(true);
      expect(r.output).toContain('Ciclo detectado');
    } finally {
      exec('unalias foo', winMachine());
    }
  });
});

describe('redirección win ( > )', () => {
  it('echo > archivo crea el archivo en la ruta win', () => {
    const m = winMachine();
    const r = exec('echo hola > Desktop\\salida.txt', m);
    expect(r.isError).not.toBe(true);
    const f = m.files.find(x => x.path === '/C:/Users/Administrator/Desktop/salida.txt');
    expect(f).toBeDefined();
    expect(f!.content).toContain('hola');
  });
});

describe('reset de helpers entre tests', () => {
  it('process manager limpio', () => {
    resetProcessManager();
    expect(true).toBe(true);
  });
});
