// ── commands/windows/__tests__/dispatch.test.ts ───────────────────
// Dispatch dual por machine_info.family (W1): win → WINDOWS_COMMANDS.

import { describe, it, expect } from 'vitest';
import { exec, winMachine, HOME } from './fixtures';
import { WINDOWS_COMMANDS } from '../index';

describe('dispatch Windows (family === windows)', () => {
  it('ejecuta dir en máquina Windows (no Command not found)', () => {
    const r = exec('dir Desktop', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('El directorio de C:\\Users\\Administrator\\Desktop');
    expect(r.output).toContain('flag.txt');
    expect(r.output).toContain('Archivo(s)');
  });

  it('ejecuta type y emite metadata fileRead (flag)', () => {
    const r = exec('type Desktop\\flag.txt', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('type' in r && r.type).toBe('fileRead');
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(true);
    expect('fileRead' in r && r.fileRead?.machineId).toBe('win-01');
  });

  it('en Linux dir no existe (Command not found)', () => {
    const linux = winMachine();
    linux.machine_info.family = undefined;
    const r = exec('dir', linux);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found');
  });

  it('en Linux ls sigue funcionando (regresión)', () => {
    const linux = winMachine();
    linux.machine_info.family = undefined;
    const r = exec('ls', linux, { currentDir: '/' });
    expect(r.isError).not.toBe(true);
  });

  it('aliases md/rd/chdir/erase funcionan', () => {
    const m = winMachine();
    const r1 = exec('md temporal', m);
    expect(r1.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/temporal/.dir`)).toBe(true);

    const r2 = exec('chdir temporal', m, { setCurrentDir: () => {} });
    expect(r2.isError).not.toBe(true);

    const r3 = exec('rd temporal', m);
    expect(r3.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/temporal/.dir`)).toBe(false);
  });

  it('happy path: dir → cd Desktop → type flag', () => {
    const m = winMachine();
    let cwd = HOME;
    const opts = { setCurrentDir: (d: string) => { cwd = d; } };

    const dir = exec('dir', m, opts);
    expect(dir.output).toContain('Desktop');

    const cd = exec('cd Desktop', m, opts);
    expect(cd.isError).not.toBe(true);
    expect(cwd).toBe(`${HOME}/Desktop`);

    const type = exec('type flag.txt', m, { ...opts, currentDir: cwd });
    expect(type.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('type' in type && type.type).toBe('fileRead');
  });

  it('el registro WINDOWS_COMMANDS contiene los comandos MVP', () => {
    for (const name of [
      'dir', 'cd', 'type', 'copy', 'move', 'del', 'mkdir', 'rmdir',
      'echo', 'set', 'cls', 'ver', 'hostname', 'whoami', 'ipconfig',
      'netstat', 'tasklist', 'taskkill', 'sc', 'reg', 'net', 'schtasks',
      'systeminfo', 'ping', 'tracert', 'attrib', 'shutdown', 'cmd', 'powershell',
      'help', 'winpeas', 'potato', 'mstsc',
    ]) {
      expect(WINDOWS_COMMANDS.has(name), `falta ${name}`).toBe(true);
    }
  });

  it('powershell solo existe en el mapa Windows (no en COMMANDS base)', () => {
    const m = winMachine();
    const r = exec('powershell', m);
    expect(r.output).toContain('Windows PowerShell');
  });

  // ── Exclusividad por SO del cliente RDP ─────────────────────────
  it('mstsc solo existe en WINDOWS_COMMANDS (no en COMMANDS base)', () => {
    expect(WINDOWS_COMMANDS.has('mstsc')).toBe(true);
    expect(WINDOWS_COMMANDS.has('xrdp')).toBe(false);
  });

  it('en Linux mstsc da Command not found', () => {
    const linux = winMachine();
    linux.machine_info.family = undefined;
    const r = exec('mstsc /v:1.2.3.4', linux);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found: mstsc');
  });

  it('en Windows mstsc resuelve (no Command not found)', () => {
    const r = exec('mstsc /v:1.2.3.4', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se puede encontrar el host 1.2.3.4.');
  });

  it('en Windows xrdp da Command not found (es el cliente de Linux)', () => {
    const r = exec('xrdp /v:1.2.3.4', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found: xrdp');
  });
});
