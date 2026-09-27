// ── frameworks/metasploit/__tests__/msfShell.test.ts ────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect, vi } from 'vitest';
import { executeShellCommand } from '../orchestrators/msfShell';
import type { MsfState } from '../core/msfTypes';
import { createWindowsFileSystem } from '../../../fs-models/fs-windows';
import { withWindowsSampleFiles } from '../../../fs-models/__fixtures__/windowsSampleFiles';
import type { CommandContext, Machine } from '../../../types';

const HOME = '/C:/Users/win7user';

function winTarget(): Machine {
  return {
    id: 'target-01',
    machine_info: {
      hostname: 'WIN7-LAB', ip: '192.168.60.11', mac: '00:0c:29:aa:bb:cc',
      os: 'Windows 7', status: 'up', type: 'server', family: 'windows',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: withWindowsSampleFiles(
      createWindowsFileSystem({ username: 'win7user', computerName: 'WIN7-LAB' }),
      'win7user',
    ),
    win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
  } as Machine;
}

function makeCtx(currentDir = HOME): CommandContext {
  return {
    machine: winTarget(),
    allMachines: [],
    currentMissionId: 1,
    currentDir,
    setCurrentDir: vi.fn(),
  };
}

describe('executeShellCommand', () => {
  const shellState: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10' },
    sessionOpen: true,
    shellMode: true,
    uidChecked: false,
    auxChecked: true
  };

  it('debe retornar null si no está en shell mode', () => {
    const result = executeShellCommand('whoami', [], { ...shellState, shellMode: false }, makeCtx());
    expect(result).toBeNull();
  });

  it('debe retornar a meterpreter con exit', () => {
    const result = executeShellCommand('exit', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.msfStateUpdate?.shellMode).toBe(false);
  });

  it('debe limpiar pantalla con cls', () => {
    const result = executeShellCommand('cls', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('CLEAR_TERMINAL');
  });

  it('debe ejecutar whoami', () => {
    const result = executeShellCommand('whoami', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('nt authority');
    expect(result!.output).toContain('system');
  });

  it('debe ejecutar hostname', () => {
    const result = executeShellCommand('hostname', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('WIN7-TARGET');
  });

  it('dir sin argumentos lista el home real de la víctima', () => {
    const result = executeShellCommand('dir', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('C:\\Users\\win7user');
    expect(result!.output).toContain('Documents');
    expect(result!.output).toContain('Desktop');
  });

  it('dir con ruta relativa navega el FS real', () => {
    const result = executeShellCommand('dir', ['Documents'], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('notes.txt');
  });

  it('cd cambia el cwd de la sesión y lo replica en la terminal', () => {
    const ctx = makeCtx();
    const result = executeShellCommand('cd', ['Documents'], shellState, ctx);
    expect(result).not.toBeNull();
    expect(result!.msfStateUpdate?.cwd).toBe(`${HOME}/Documents`);
    expect(ctx.setCurrentDir).toHaveBeenCalledWith(`${HOME}/Documents`);
  });

  it('cd sin argumentos imprime el cwd en formato Windows', () => {
    const ctx = makeCtx();
    const result = executeShellCommand('cd', [], { ...shellState, cwd: `${HOME}/Documents` }, ctx);
    expect(result!.output).toContain('C:\\Users\\win7user\\Documents');
    expect(ctx.setCurrentDir).not.toHaveBeenCalled();
  });

  it('cd a una ruta inexistente reporta error y no mueve el cwd', () => {
    const ctx = makeCtx();
    const result = executeShellCommand('cd', ['C:\\NoExiste'], shellState, ctx);
    expect(result!.msfStateUpdate?.cwd).toBeUndefined();
    expect(ctx.setCurrentDir).not.toHaveBeenCalled();
    expect(result!.output).toContain('no puede encontrar la ruta');
  });

  it('pwd imprime el cwd de la sesión', () => {
    const result = executeShellCommand('pwd', [], { ...shellState, cwd: `${HOME}/Documents` }, makeCtx());
    expect(result!.output).toContain('C:\\Users\\win7user\\Documents');
  });

  it('dir respeta el cwd de la sesión aunque la terminal esté desfasada', () => {
    const result = executeShellCommand(
      'dir', [], { ...shellState, cwd: `${HOME}/Documents` }, makeCtx('/root')
    );
    expect(result!.output).toContain('notes.txt');
  });

  it('type lee archivos reales de la víctima', () => {
    const result = executeShellCommand(
      'type', ['Documents\\notes.txt'], shellState, makeCtx()
    );
    expect(result!.output).toContain('Administrator');
    expect(result!.output).toContain('P@ssw0rd123!');
  });

  it('type sin argumentos pide el archivo', () => {
    const result = executeShellCommand('type', [], shellState, makeCtx());
    expect(result!.isError).toBe(true);
    expect(result!.output).toContain('type');
  });

  it('debe ejecutar ipconfig', () => {
    const result = executeShellCommand('ipconfig', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Windows IP Configuration');
    expect(result!.output).toContain('192.168.1.10');
  });

  it('debe ejecutar net user', () => {
    const result = executeShellCommand('net', ['user'], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Administrator');
    expect(result!.output).toContain('Guest');
  });

  it('debe ejecutar systeminfo', () => {
    const result = executeShellCommand('systeminfo', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Host Name');
    expect(result!.output).toContain('WIN7-TARGET');
    expect(result!.output).toContain('Windows 7');
  });

  it('debe mostrar error para comando desconocido', () => {
    const result = executeShellCommand('comando_inexistente', [], shellState, makeCtx());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('not recognized');
    expect(result!.output).toContain('internal or external command');
  });
});
