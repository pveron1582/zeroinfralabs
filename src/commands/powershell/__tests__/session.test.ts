// ── commands/powershell/__tests__/session.test.ts ─────────────────
// Sesión PowerShell: cmd_powershell, one-shot -Command, exit, cmdlets.

import { describe, it, expect } from 'vitest';
import { cmd_powershell, executePsLine } from '../session';
import { resolvePsCommand, PS_ALIASES } from '../aliases';
import { getPsCmdlet, listPsCmdletNames } from '../cmdlets';
import { exec, winMachine, HOME } from '../../windows/__tests__/fixtures';
import { resetPsState } from '../../index';
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

describe('cmd_powershell', () => {
  it('sin args inicia sesión y emite psStateUpdate active', () => {
    const r = cmd_powershell.execute([], ctx());
    expect(r.output).toContain('Windows PowerShell');
    // El prompt lo dibuja la línea de input de la terminal (no el banner).
    expect(r.output).not.toContain('PS C:\\Users\\Administrator>');
    expect('psStateUpdate' in r && r.psStateUpdate?.active).toBe(true);
  });

  it('-Command ejecuta one-shot sin activar sesión', () => {
    const r = cmd_powershell.execute(['-Command', 'Get-Process'], ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('ProcessName');
    expect('psStateUpdate' in r).toBe(false);
  });

  it('-c también funciona como one-shot', () => {
    const r = cmd_powershell.execute(['-c', 'Get-Service'], ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Status');
  });

  it('one-shot con Get-Content emite fileRead metadata', () => {
    const r = cmd_powershell.execute(
      ['-Command', 'Get-Content -Path Desktop\\flag.txt'],
      ctx(),
    );
    expect(r.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(true);
  });

  it('-Command sin comando da error', () => {
    const r = cmd_powershell.execute(['-Command'], ctx());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('-Command');
  });
});

describe('executePsLine / sesión', () => {
  it('exit desactiva la sesión (psStateUpdate null)', () => {
    const r = executePsLine('exit', ctx());
    expect('psStateUpdate' in r && r.psStateUpdate).toBeNull();
  });

  it('quit también cierra la sesión', () => {
    const r = executePsLine('quit', ctx());
    expect('psStateUpdate' in r && r.psStateUpdate).toBeNull();
  });

  it('Get-ChildItem lista el directorio actual', () => {
    const r = executePsLine('Get-ChildItem', ctx());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Desktop');
  });

  it('alias gci resuelve a Get-ChildItem', () => {
    const r = executePsLine('gci', ctx());
    expect(r.output).toContain('Desktop');
  });

  it('cmdlet desconocido da error con listado', () => {
    const r = executePsLine('Get-Frobnicate', ctx());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Get-Frobnicate');
    expect(r.output).toContain('Get-Content');
  });

  it('línea vacía devuelve output vacío', () => {
    const r = executePsLine('   ', ctx());
    expect(r.output).toBe('');
  });

  it('pipe entre cmdlets no rompe (aunque v1 no filtra aún)', () => {
    const r = executePsLine('Get-ChildItem | Get-Help', ctx());
    // Última etapa es Get-Help
    expect(r.output).toContain('Get-ChildItem');
  });
});

describe('aliases y registro', () => {
  it('resolvePsCommand mapea alias conocidos', () => {
    expect(resolvePsCommand('gci')).toBe('Get-ChildItem');
    expect(resolvePsCommand('cat')).toBe('Get-Content');
    expect(resolvePsCommand('ps')).toBe('Get-Process');
    expect(resolvePsCommand('ls')).toBe('Get-ChildItem');
    expect(resolvePsCommand('Get-Content')).toBe('Get-Content');
  });

  it('PS_ALIASES no registra ls como cmd POSIX conflictivo fuera de sesión', () => {
    // Solo se usa dentro de executePsLine / resolvePsCommand
    expect(PS_ALIASES.ls).toBe('Get-ChildItem');
    expect(PS_ALIASES.cat).toBe('Get-Content');
  });

  it('PS_CMDLETS contiene el MVP', () => {
    const names = listPsCmdletNames();
    for (const n of [
      'Get-ChildItem', 'Get-Content', 'Set-Content', 'Remove-Item',
      'Copy-Item', 'New-Item', 'Resolve-Path',
      'Get-Process', 'Stop-Process',
      'Get-Service', 'Start-Service', 'Stop-Service',
      'Get-NetTCPConnection', 'Get-NetIPConfiguration',
      'Test-NetConnection', 'Invoke-WebRequest',
      'Get-LocalUser', 'Get-LocalGroupMember',
      'Get-Help', 'Clear-Host', 'Stop-Computer',
    ]) {
      expect(names, `falta ${n}`).toContain(n);
      expect(getPsCmdlet(n), `no registrado ${n}`).toBeDefined();
    }
  });
});

describe('integración con dispatch Windows', () => {
  it('powershell solo en Windows (Command not found en Linux)', () => {
    const linux = winMachine();
    linux.machine_info.family = undefined;
    const r = exec('powershell', linux);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found');
  });

  it('powershell -Command Get-Content emite fileRead vía executor', () => {
    const r = exec('powershell -Command "Get-Content -Path Desktop\\flag.txt"', winMachine());
    expect(r.output).toContain('THM{USER_ACCESS_GRANTED}');
    expect('fileRead' in r && r.fileRead?.isFlag).toBe(true);
  });
});

describe('PowerShell: exes nativos (fallback cmd.exe)', () => {
  it('ejecuta un comando de cmd.exe dentro de la sesión PS', () => {
    const m = winMachine();
    try {
      expect(exec('powershell', m).isError).not.toBe(true);
      const r = exec('whoami', m);
      expect(r.isError).not.toBe(true);
      expect(r.output.toLowerCase()).toContain('administrator');
    } finally {
      resetPsState();
    }
  });

  it('un término desconocido sigue dando el error de cmdlet', () => {
    const m = winMachine();
    try {
      exec('powershell', m);
      const r = exec('esto-no-existe', m);
      expect(r.isError).toBe(true);
      expect(r.output).toContain('no se reconoce como cmdlet');
    } finally {
      resetPsState();
    }
  });

  it('fuera de la sesión PS whoami sigue resolviendo por el registro normal', () => {
    resetPsState();
    const r = exec('whoami', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output.toLowerCase()).toContain('administrator');
  });
});
