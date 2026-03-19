// ── commands/tools/__tests__/msfCommands/msfShell.test.ts ────────
import { describe, it, expect } from 'vitest';
import { executeShellCommand } from '../../msfCommands/msfShell';
import type { MsfState } from '../../msfTypes';

describe('executeShellCommand', () => {
  const shellState: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10' },
    sessionOpen: true,
    shellMode: true,
    auxChecked: true
  };

  it('debe retornar null si no está en shell mode', () => {
    const result = executeShellCommand('whoami', [], { ...shellState, shellMode: false });
    expect(result).toBeNull();
  });

  it('debe retornar a meterpreter con exit', () => {
    const result = executeShellCommand('exit', [], shellState);
    expect(result).not.toBeNull();
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.shellMode).toBe(false);
    }
  });

  it('debe limpiar pantalla con cls', () => {
    const result = executeShellCommand('cls', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('CLEAR_TERMINAL');
  });

  it('debe ejecutar whoami', () => {
    const result = executeShellCommand('whoami', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('nt authority');
    expect(result!.output).toContain('system');
  });

  it('debe ejecutar hostname', () => {
    const result = executeShellCommand('hostname', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('WIN7-TARGET');
  });

  it('debe ejecutar dir sin argumentos', () => {
    const result = executeShellCommand('dir', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Directory of');
    expect(result!.output).toContain('system32');
  });

  it('debe ejecutar dir con ruta', () => {
    const result = executeShellCommand('dir', ['C:\\Windows'], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Directory of C:\\Windows');
  });

  it('debe ejecutar ipconfig', () => {
    const result = executeShellCommand('ipconfig', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Windows IP Configuration');
    expect(result!.output).toContain('192.168.1.10');
  });

  it('debe ejecutar net user', () => {
    const result = executeShellCommand('net', ['user'], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Administrator');
    expect(result!.output).toContain('Guest');
  });

  it('debe ejecutar systeminfo', () => {
    const result = executeShellCommand('systeminfo', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Host Name');
    expect(result!.output).toContain('WIN7-TARGET');
    expect(result!.output).toContain('Windows 7');
  });

  it('debe responder a type con acceso denegado', () => {
    const result = executeShellCommand('type', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Access is denied');
  });

  it('debe mostrar error para comando desconocido', () => {
    const result = executeShellCommand('comando_inexistente', [], shellState);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('not recognized');
    expect(result!.output).toContain('internal or external command');
  });
});
