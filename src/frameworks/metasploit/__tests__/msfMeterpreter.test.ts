// ── frameworks/metasploit/__tests__/msfMeterpreter.test.ts ──
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect, vi } from 'vitest';
import { executeMeterpreterCommand } from '../orchestrators/msfMeterpreter';
import type { MsfState } from '../core/msfTypes';
import type { Machine, CommandContext } from '../../../types';
import { createWindowsFileSystem } from '../../../fs-models/fs-windows';
import { withWindowsSampleFiles } from '../../../fs-models/__fixtures__/windowsSampleFiles';

// Create mock context
const createMockContext = (machines: Machine[] = []): CommandContext => ({
  machine: machines[0] || { id: 'target-01', machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Windows 7', status: 'up', type: 'server' }, discovery_level: 2, scan_results: { ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }] }, web_enumeration: { web_server: 'none', cms: 'none', directories: [] }, learning_steps: [], files: [] },
  allMachines: machines,
  currentMissionId: 5,
  currentDir: '/root',
});

describe('executeMeterpreterCommand', () => {
  const meterpreterState: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10', RPORT: '445', LHOST: '192.168.1.5', LPORT: '4444' },
    sessionOpen: true,
    shellMode: false,
    uidChecked: false,
    auxChecked: true
  };

  it('debe retornar null si no hay sesión abierta', () => {
    const result = executeMeterpreterCommand('help', [], { ...meterpreterState, sessionOpen: false }, createMockContext());
    expect(result).toBeNull();
  });

  it('debe mostrar ayuda de meterpreter', () => {
    const result = executeMeterpreterCommand('help', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Core Commands');
    expect(result!.output).toContain('background');
    expect(result!.output).toContain('getuid');
    expect(result!.output).toContain('sysinfo');
  });

  it('debe mostrar ayuda con ?', () => {
    const result = executeMeterpreterCommand('?', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Core Commands');
  });

  it('debe ejecutar getuid', () => {
    const result = executeMeterpreterCommand('getuid', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('NT AUTHORITY');
    expect(result!.output).toContain('SYSTEM');
  });

  it('debe ejecutar sysinfo', () => {
    const result = executeMeterpreterCommand('sysinfo', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('WIN7-TARGET');
    expect(result!.output).toContain('Windows 7');
  });

  it('debe ejecutar shell y cambiar estado a shellMode', () => {
    const result = executeMeterpreterCommand('shell', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Microsoft Windows');
    expect(result!.msfStateUpdate?.shellMode).toBe(true);
  });

  it('debe ejecutar hashdump', () => {
    const result = executeMeterpreterCommand('hashdump', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Administrator');
    expect(result!.output).toContain('aad3b435b51404ee');
  });

  it('debe ejecutar background y cerrar sesión', () => {
    const result = executeMeterpreterCommand('background', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Backgrounding session');
    expect(result!.msfStateUpdate?.sessionOpen).toBe(false);
  });

  it('debe ejecutar bg (alias de background)', () => {
    const result = executeMeterpreterCommand('bg', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Backgrounding session');
  });

  it('debe cerrar sesión con exit', () => {
    const result = executeMeterpreterCommand('exit', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Shutting down Meterpreter');
    expect(result!.msfStateUpdate?.sessionOpen).toBe(false);
  });

  it('debe cerrar sesión con quit', () => {
    const result = executeMeterpreterCommand('quit', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Shutting down Meterpreter');
  });

  it('debe mostrar sesiones activas', () => {
    const result = executeMeterpreterCommand('sessions', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('meterpreter');
    expect(result!.output).toContain('192.168.1.10');
  });

  it('debe limpiar pantalla con clear', () => {
    const result = executeMeterpreterCommand('clear', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect('clearScreen' in result! && result!.clearScreen).toBe(true);
  });

  it('debe mostrar error para comando desconocido', () => {
    const result = executeMeterpreterCommand('comando_inexistente', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Unknown command');
  });
});

describe('executeMeterpreterCommand - Stdapi filesystem', () => {
  const HOME = '/C:/Users/win7user';

  function winCtx(currentDir = HOME): CommandContext {
    return {
      machine: {
        id: 'target-01',
        machine_info: {
          hostname: 'WIN7-LAB', ip: '192.168.1.10', mac: '00:00:00:00:00:00',
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
      } as Machine,
      allMachines: [],
      currentMissionId: 5,
      currentDir,
      setCurrentDir: vi.fn(),
    };
  }

  const sessionState: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10' },
    sessionOpen: true,
    shellMode: false,
    uidChecked: false,
    auxChecked: true,
    cwd: HOME,
  };

  it('cd cambia el cwd de la sesión', () => {
    const ctx = winCtx();
    const result = executeMeterpreterCommand('cd', ['Documents'], sessionState, ctx);
    expect(result!.msfStateUpdate?.cwd).toBe(`${HOME}/Documents`);
    expect(ctx.setCurrentDir).toHaveBeenCalledWith(`${HOME}/Documents`);
  });

  it('pwd/getwd imprimen el cwd en formato Windows', () => {
    const state: MsfState = { ...sessionState, cwd: `${HOME}/Documents` };
    expect(executeMeterpreterCommand('pwd', [], state, winCtx())!.output)
      .toContain('C:\\Users\\win7user\\Documents');
    expect(executeMeterpreterCommand('getwd', [], state, winCtx())!.output)
      .toContain('C:\\Users\\win7user\\Documents');
  });

  it('ls y dir listan el FS real según el cwd de la sesión', () => {
    const state: MsfState = { ...sessionState, cwd: `${HOME}/Documents` };
    for (const cmd of ['ls', 'dir']) {
      const result = executeMeterpreterCommand(cmd, [], state, winCtx('/root'));
      expect(result!.output).toContain('notes.txt');
    }
  });

  it('cat lee el archivo con la ruta relativa al cwd', () => {
    const state: MsfState = { ...sessionState, cwd: `${HOME}/Documents` };
    const result = executeMeterpreterCommand('cat', ['notes.txt'], state, winCtx('/root'));
    expect(result!.output).toContain('P@ssw0rd123!');
  });
});
