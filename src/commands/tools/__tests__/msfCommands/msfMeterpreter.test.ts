// ── commands/tools/__tests__/msfCommands/msfMeterpreter.test.ts ──
import { describe, it, expect } from 'vitest';
import { executeMeterpreterCommand } from '../../../../frameworks/metasploit/orchestrators/msfMeterpreter';
import type { MsfState } from '../../../../frameworks/metasploit/core/msfTypes';
import type { Machine, CommandContext } from '../../../../types';

// Create mock context
const createMockContext = (machines: Machine[] = []): CommandContext => ({
  machine: machines[0] || { id: 'target-01', machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Windows 7', status: 'up', type: 'server' }, discovery_level: 2, scan_results: { ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }] }, web_enumeration: { web_server: 'none', cms: 'none', directories: [] }, learning_steps: [], files: [] },
  allMachines: machines,
  currentMissionId: 5,
});

// Create mock machine for testing
const createMockMachine = (ip: string): Machine => ({
  id: 'target-01',
  machine_info: { hostname: 'WIN7-TARGET', ip, mac: '00:00:00:00:00:00', os: 'Windows 7', status: 'up', type: 'server' },
  discovery_level: 2,
  scan_results: { ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
});

describe('executeMeterpreterCommand', () => {
  const meterpreterState: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10', RPORT: '445', LHOST: '192.168.1.5', LPORT: '4444' },
    sessionOpen: true,
    shellMode: false,
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
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.shellMode).toBe(true);
    }
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
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.sessionOpen).toBe(false);
    }
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
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.sessionOpen).toBe(false);
    }
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
    expect(result!.output).toContain('CLEAR_TERMINAL');
  });

  it('debe mostrar error para comando desconocido', () => {
    const result = executeMeterpreterCommand('comando_inexistente', [], meterpreterState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Unknown command');
  });
});
