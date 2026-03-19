// ── commands/tools/__tests__/msfconsole.test.ts ────────────────────
// Integration tests for msfconsole orchestrator
// Unit tests for individual command handlers are in msfCommands/ directory
import { describe, it, expect } from 'vitest';
import { cmd_msfconsole, executeMsfCommand, type MsfState } from '../msfconsole';
import type { Machine, CommandContext } from '../../../types';

// Create mock context
const createMockContext = (machines: Machine[] = []): CommandContext => ({
  machine: machines[0] || { id: 'target-01', machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Windows 7', status: 'up', type: 'server' }, discovery_level: 2, scan_results: { ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: '' }] }, web_enumeration: { web_server: 'none', cms: 'none', directories: [] }, learning_steps: [], files: [] },
  allMachines: machines,
  currentMissionId: 4,
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

describe('cmd_msfconsole - initialization', () => {
  it('debe mostrar el banner de metasploit al iniciar', () => {
    const result = cmd_msfconsole.execute();
    expect(result.output).toContain('metasploit');
    const promptMatches = result.output.match(/msf6 > /g);
    expect(promptMatches?.length || 0).toBe(0);
  });

  it('debe contener el estado activo en el output', () => {
    const result = cmd_msfconsole.execute();
    expect(result.output).toContain('MSF_STATE:');
    expect(result.output).toContain('"active":true');
  });
});

describe('executeMsfCommand - integration tests', () => {
  const initialState: MsfState = { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false };

  describe('Command handler priority (BUG-A & BUG-B fix)', () => {
    it('debe usar meterpreter help en sesión (no MSF help)', () => {
      const meterpreterState: MsfState = {
        active: true,
        module: 'exploit/windows/smb/ms17_010_eternalblue',
        moduleType: 'exploit',
        options: { RHOSTS: '192.168.1.10', LHOST: '192.168.1.5' },
        sessionOpen: true,
        shellMode: false,
        auxChecked: true
      };
      const result = executeMsfCommand('help', meterpreterState, createMockContext());
      expect(result.output).toContain('background');
      expect(result.output).toContain('getuid');
      expect(result.output).not.toContain('Module Commands');
    });

    it('debe usar shell commands cuando está en shellMode', () => {
      const shellState: MsfState = {
        active: true,
        module: 'exploit/windows/smb/ms17_010_eternalblue',
        moduleType: 'exploit',
        options: { RHOSTS: '192.168.1.10' },
        sessionOpen: true,
        shellMode: true,
        auxChecked: true
      };
      const result = executeMsfCommand('whoami', shellState, createMockContext());
      expect(result.output).toContain('nt authority');
    });
  });

  describe('Full exploit flow', () => {
    it('debe completar el flujo: search → use → set → run auxiliary → run exploit', () => {
      const machine = createMockMachine('192.168.1.10');
      const ctx = createMockContext([machine]);

      // 1. Search
      let result = executeMsfCommand('search ms17', initialState, ctx);
      expect(result.output).toContain('Matching Modules');
      const searchStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      let state = JSON.parse(searchStateMatch![1]);
      expect(state.lastSearchResults?.length).toBeGreaterThan(0);

      // 2. Use auxiliary by number
      result = executeMsfCommand('use 0', state, ctx);
      expect(result.output).toContain('auxiliary');
      const useStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      state = JSON.parse(useStateMatch![1]);
      expect(state.module).toContain('smb_ms17_010');

      // 3. Set RHOSTS
      result = executeMsfCommand('set RHOSTS 192.168.1.10', state, ctx);
      expect(result.output).toContain('RHOSTS => 192.168.1.10');
      const setStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      state = JSON.parse(setStateMatch![1]);
      expect(state.options.RHOSTS).toBe('192.168.1.10');

      // 4. Run auxiliary
      result = executeMsfCommand('run', state, ctx);
      expect(result.output).toContain('VULNERABLE');
      const auxStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      state = JSON.parse(auxStateMatch![1]);
      expect(state.auxChecked).toBe(true);
    });
  });

  describe('Meterpreter to shell flow', () => {
    it('debe transicionar de meterpreter a shell con "shell" command', () => {
      const meterpreterState: MsfState = {
        active: true,
        module: 'exploit/windows/smb/ms17_010_eternalblue',
        moduleType: 'exploit',
        options: { RHOSTS: '192.168.1.10' },
        sessionOpen: true,
        shellMode: false,
        auxChecked: true
      };

      // Execute shell command
      let result = executeMsfCommand('shell', meterpreterState, createMockContext());
      expect(result.output).toContain('Microsoft Windows');

      const shellStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      let state = JSON.parse(shellStateMatch![1]);
      expect(state.shellMode).toBe(true);

      // Now execute a shell command
      result = executeMsfCommand('dir', state, createMockContext());
      expect(result.output).toContain('Directory of');

      // Exit shell
      result = executeMsfCommand('exit', state, createMockContext());
      const exitStateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      state = JSON.parse(exitStateMatch![1]);
      expect(state.shellMode).toBe(false);
    });
  });

  describe('Prompt ordering (no double prompts)', () => {
    it('NO debe haber doble prompt al cargar módulo auxiliary', () => {
      const result = executeMsfCommand('use auxiliary/scanner/smb/smb_ms17_010', initialState, createMockContext());
      const promptMatches = result.output.match(/msf6 auxiliary\(.*\) > /g);
      expect(promptMatches?.length || 0).toBe(0);
    });

    it('NO debe haber doble prompt al cargar módulo exploit', () => {
      const result = executeMsfCommand('use exploit/windows/smb/ms17_010_eternalblue', initialState, createMockContext());
      const promptMatches = result.output.match(/msf6 exploit\(.*\) > /g);
      expect(promptMatches?.length || 0).toBe(0);
    });

    it('NO debe haber doble prompt en meterpreter help', () => {
      const meterpreterState: MsfState = {
        active: true,
        module: 'exploit/windows/smb/ms17_010_eternalblue',
        moduleType: 'exploit',
        options: {},
        sessionOpen: true,
        shellMode: false,
        auxChecked: false
      };
      const result = executeMsfCommand('help', meterpreterState, createMockContext());
      const promptMatches = result.output.match(/meterpreter > /g);
      expect(promptMatches?.length || 0).toBe(0);
    });
  });
});
;