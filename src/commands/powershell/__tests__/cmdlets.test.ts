// ── commands/powershell/__tests__/cmdlets.test.ts ─────────────────
// Cmdlets PowerShell MVP: fs, process, service, system (W2).

import { describe, it, expect } from 'vitest';
import { executePsLine } from '../session';
import { resolvePsCommand } from '../aliases';
import { exec, winMachine, nonAdminMachine, HOME } from '../../windows/__tests__/fixtures';
import type { CommandContext } from '../../../types';

function ctx(machine = winMachine(), currentDir = HOME): CommandContext {
  return {
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    terminalId: 't1',
    currentDir,
    language: 'es',
  };
}

describe('Get-Content / Get-ChildItem', () => {
  it('Get-Content lee flag y emite fileRead', () => {
    const r = executePsLine('Get-Content -Path Desktop\\flag.txt', ctx());
    expect(r.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(true);
    expect('fileRead' in r && r.fileRead?.machineId).toBe('win-01');
  });

  it('Get-Content archivo inexistente → error', () => {
    const r = executePsLine('Get-Content -Path nope.txt', ctx());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar');
  });

  it('Get-Content sin Path → usage', () => {
    const r = executePsLine('Get-Content', ctx());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso');
  });

  it('Get-ChildItem lista Desktop', () => {
    const r = executePsLine('Get-ChildItem Desktop', ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('flag.txt');
  });

  it('Get-ChildItem ruta inexistente → path not found', () => {
    const r = executePsLine('Get-ChildItem -Path C:\\NoExiste', ctx());
    expect(r.isError).toBe(true);
  });
});

describe('Set-Content / Remove-Item / New-Item', () => {
  it('Set-Content crea archivo nuevo', () => {
    const m = winMachine();
    const r = executePsLine('Set-Content -Path Desktop\\nuevo.txt -Value hola', ctx(m));
    expect(r.isError).not.toBe(true);
    const f = m.files.find(x => x.path === `${HOME}/Desktop/nuevo.txt`);
    expect(f).toBeDefined();
    expect(f!.content).toBe('hola');
  });

  it('Set-Content actualiza archivo existente preservando owner', () => {
    const m = winMachine();
    const existing = m.files.find(x => x.path === `${HOME}/Desktop/flag.txt`)!;
    const r = executePsLine('Set-Content -Path Desktop\\flag.txt -Value X', ctx(m));
    expect(r.isError).not.toBe(true);
    const updated = m.files.find(x => x.path === existing.path)!;
    expect(updated.content).toBe('X');
    expect(updated.owner).toBe(existing.owner);
    expect(updated.mode).toBe(existing.mode);
  });

  it('New-Item crea directorio', () => {
    const m = winMachine();
    const r = executePsLine('New-Item -Path Desktop\\nuevacarpeta', ctx(m));
    expect(r.isError).not.toBe(true);
    expect(m.files.some(f => f.path === `${HOME}/Desktop/nuevacarpeta/.dir`)).toBe(true);
  });

  it('Remove-Item borra archivo', () => {
    const m = winMachine();
    const before = m.files.length;
    const r = executePsLine('Remove-Item -Path Desktop\\flag.txt', ctx(m));
    expect(r.isError).not.toBe(true);
    expect(m.files.length).toBe(before - 1);
    expect(m.files.some(f => f.path === `${HOME}/Desktop/flag.txt`)).toBe(false);
  });
});

describe('Get-Process / Get-Service', () => {
  it('Get-Process lista procesos', () => {
    const r = executePsLine('Get-Process', ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('ProcessName');
  });

  it('Get-Process -Name filtra', () => {
    const r = executePsLine('Get-Process -Name lsass', ctx());
    expect(r.output.toLowerCase()).toContain('lsass');
  });

  it('Stop-Process inexistente → error', () => {
    const r = executePsLine('Stop-Process -Id 99999', ctx());
    expect(r.isError).toBe(true);
  });

  it('Get-Service lista servicios', () => {
    const r = executePsLine('Get-Service', ctx());
    expect(r.output).toContain('Status');
    expect(r.output).toContain('Name');
    // winMachine tiene procesos con servicio (svchost u otro)
    expect(r.output.length).toBeGreaterThan(20);
  });
});

describe('Get-Help / Clear-Host / sistema', () => {
  it('Get-Help sin args lista cmdlets', () => {
    const r = executePsLine('Get-Help', ctx());
    expect(r.output).toContain('Get-Content');
    expect(r.output).toContain('ALIASES');
  });

  it('Get-Help <cmdlet> muestra synopsis', () => {
    const r = executePsLine('Get-Help Get-Content', ctx());
    expect(r.output).toContain('NAME');
    expect(r.output).toContain('Get-Content');
  });

  it('Clear-Host retorna CLEAR_TERMINAL', () => {
    const r = executePsLine('Clear-Host', ctx());
    expect(r.output).toBe('CLEAR_TERMINAL');
  });

  it('Get-NetIPConfiguration muestra IP', () => {
    const r = executePsLine('Get-NetIPConfiguration', ctx());
    expect(r.output).toContain('10.10.10.50');
  });

  it('Get-LocalUser lista cuentas del SAM', () => {
    const r = executePsLine('Get-LocalUser', ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Administrator');
  });

  it('Stop-Computer sin root → acceso denegado', () => {
    const m = nonAdminMachine();
    const r = executePsLine('Stop-Computer', ctx(m));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });
});

describe('integración powershell -Command', () => {
  it('one-shot Get-ChildItem vía executor Windows', () => {
    const r = exec('powershell -Command "Get-ChildItem Desktop"', winMachine());
    expect(r.output).toContain('flag.txt');
  });
});

describe('Set-Location / Get-Location (cd / pwd)', () => {
  /** Contexto con setCurrentDir observable para assertear la navegación. */
  function cdCtx(currentDir = HOME): CommandContext {
    const machine = winMachine();
    const c: CommandContext = {
      machine,
      allMachines: [machine],
      currentMissionId: 1,
      terminalId: 't1',
      currentDir,
      language: 'es',
      setCurrentDir: (d: string) => { c.currentDir = d; },
    };
    return c;
  }

  it('cd c:\\ cambia a la raíz de la unidad (unidad case-insensitive)', () => {
    const c = cdCtx();
    const r = executePsLine('cd c:\\', c);
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('');
    expect(c.currentDir).toBe('/C:');
  });

  it('cd relativo resuelve contra el cwd', () => {
    const c = cdCtx();
    expect(executePsLine('cd ..', c).isError).not.toBe(true);
    expect(c.currentDir).toBe('/C:/Users');
  });

  it('cd a una ruta inexistente da el mensaje de cmd.exe', () => {
    const c = cdCtx();
    const r = executePsLine('cd C:\\noexiste', c);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar');
    expect(c.currentDir).toBe(HOME);
  });

  it('cd sin destino y pwd/Get-Location muestran el cwd', () => {
    expect(executePsLine('cd', cdCtx()).output).toBe('C:\\Users\\Administrator');
    expect(executePsLine('pwd', cdCtx()).output).toBe('C:\\Users\\Administrator');
    expect(executePsLine('Get-Location', cdCtx()).output).toBe('C:\\Users\\Administrator');
  });

  it('los alias sl/chdir resuelven a Set-Location', () => {
    expect(resolvePsCommand('sl')).toBe('Set-Location');
    expect(resolvePsCommand('chdir')).toBe('Set-Location');
    expect(resolvePsCommand('pwd')).toBe('Get-Location');
  });
});
