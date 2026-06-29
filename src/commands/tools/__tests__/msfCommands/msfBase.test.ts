// ── commands/tools/__tests__/msfCommands/msfBase.test.ts ────────
import { describe, it, expect } from 'vitest';
import { executeBaseCommand } from '../../../../frameworks/metasploit/orchestrators/msfBase';
import type { MsfState } from '../../../../frameworks/metasploit/core/msfTypes';
import type { Machine, CommandContext } from '../../../../types';

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

describe('executeBaseCommand - help', () => {
  const initialState: MsfState = { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false };

  it('debe mostrar ayuda general', () => {
    const result = executeBaseCommand('help', [], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Core Commands');
    expect(result!.output).toContain('Module Commands');
    expect(result!.output).toContain('use');
    expect(result!.output).toContain('search');
  });

  it('debe mostrar ayuda con ?', () => {
    const result = executeBaseCommand('?', [], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Core Commands');
  });
});

describe('executeBaseCommand - search', () => {
  const initialState: MsfState = { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false };

  it('debe buscar módulos por nombre', () => {
    const result = executeBaseCommand('search', ['ms17_010'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('auxiliary/scanner/smb/smb_ms17_010');
    expect(result!.output).toContain('exploit/windows/smb/ms17_010_eternalblue');
  });

  it('debe buscar módulos por descripción', () => {
    const result = executeBaseCommand('search', ['SMB'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Matching Modules');
  });

  it('debe mostrar error si no hay búsqueda', () => {
    const result = executeBaseCommand('search', [], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('You must provide a search term');
  });

  it('debe mostrar error si no hay resultados', () => {
    const result = executeBaseCommand('search', ['modulo_inexistente_xyz'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('No results found');
  });

  it('debe guardar resultados para selección por número', () => {
    const result = executeBaseCommand('search', ['ms17'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Use \'use <number>\' to select');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.lastSearchResults).toBeDefined();
      expect(state.lastSearchResults?.length).toBeGreaterThan(0);
    }
  });
});

describe('executeBaseCommand - use (con búsqueda previa)', () => {
  const stateWithSearchResults: MsfState = {
    active: true,
    options: {},
    sessionOpen: false,
    shellMode: false,
    auxChecked: false,
    lastSearchResults: [
      'auxiliary/scanner/smb/smb_ms17_010',
      'exploit/windows/smb/ms17_010_eternalblue'
    ]
  };

  it('debe seleccionar auxiliary por número 0', () => {
    const result = executeBaseCommand('use', ['0'], stateWithSearchResults, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('auxiliary/scanner/smb/smb_ms17_010');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.moduleType).toBe('auxiliary');
    }
  });

  it('debe seleccionar exploit por número 1', () => {
    const result = executeBaseCommand('use', ['1'], stateWithSearchResults, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('ms17_010_eternalblue');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.moduleType).toBe('exploit');
    }
  });

  it('debe mostrar error con número inválido', () => {
    const result = executeBaseCommand('use', ['5'], stateWithSearchResults, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Invalid selection');
  });
});

describe('executeBaseCommand - use (con path)', () => {
  const initialState: MsfState = { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false };

  it('debe cargar auxiliary con path completo', () => {
    const result = executeBaseCommand('use', ['auxiliary/scanner/smb/smb_ms17_010'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('auxiliary');
    expect(result!.output).toContain('smb_ms17_010');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.module).toContain('smb_ms17_010');
      expect(state.moduleType).toBe('auxiliary');
    }
  });

  it('debe cargar exploit con path completo', () => {
    const result = executeBaseCommand('use', ['exploit/windows/smb/ms17_010_eternalblue'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('exploit');
    expect(result!.output).toContain('eternalblue');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.module).toContain('eternalblue');
      expect(state.moduleType).toBe('exploit');
    }
  });

  it('debe cargar auxiliary con nombre parcial que incluye auxiliary', () => {
    const result = executeBaseCommand('use', ['auxiliary', 'smb_ms17_010'], initialState, createMockContext());
    expect(result).not.toBeNull();
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.moduleType).toBe('auxiliary');
    }
  });

  it('debe cargar exploit con nombre parcial que incluye exploit', () => {
    const result = executeBaseCommand('use', ['exploit', 'ms17_010'], initialState, createMockContext());
    expect(result).not.toBeNull();
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.moduleType).toBe('exploit');
    }
  });

  it('debe mostrar error con módulo inexistente', () => {
    const result = executeBaseCommand('use', ['modulo_inexistente'], initialState, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Failed to load module');
  });
});

describe('executeBaseCommand - show options', () => {
  const stateWithModule: MsfState = {
    active: true,
    module: 'auxiliary/scanner/smb/smb_ms17_010',
    moduleType: 'auxiliary',
    options: { RHOSTS: '192.168.1.10', RPORT: '445', THREADS: '1' },
    sessionOpen: false,
    shellMode: false,
    auxChecked: false
  };

  it('debe mostrar opciones del módulo', () => {
    const result = executeBaseCommand('show', ['options'], stateWithModule, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Module options');
    expect(result!.output).toContain('RHOSTS');
    expect(result!.output).toContain('192.168.1.10');
  });

  it('debe mostrar error si no hay módulo seleccionado', () => {
    const result = executeBaseCommand('show', ['options'], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('No module selected');
  });
});

describe('executeBaseCommand - set', () => {
  const stateWithModule: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '', RPORT: '445', LHOST: '', LPORT: '4444' },
    sessionOpen: false,
    shellMode: false,
    auxChecked: false
  };

  it('debe establecer opción RHOSTS', () => {
    const result = executeBaseCommand('set', ['RHOSTS', '192.168.1.10'], stateWithModule, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('RHOSTS => 192.168.1.10');
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.options.RHOSTS).toBe('192.168.1.10');
    }
  });

  it('debe establecer opción LHOST', () => {
    const result = executeBaseCommand('set', ['LHOST', '192.168.1.5'], stateWithModule, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('LHOST => 192.168.1.5');
  });

  it('debe mostrar uso si faltan argumentos', () => {
    const result = executeBaseCommand('set', ['RHOSTS'], stateWithModule, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Usage');
  });
});

describe('executeBaseCommand - back', () => {
  const stateWithModule: MsfState = {
    active: true,
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    moduleType: 'exploit',
    options: { RHOSTS: '192.168.1.10' },
    sessionOpen: false,
    shellMode: false,
    auxChecked: false
  };

  it('debe salir del módulo y volver al prompt base', () => {
    const result = executeBaseCommand('back', [], stateWithModule, createMockContext());
    expect(result).not.toBeNull();
    const stateMatch = result!.output.match(/MSF_STATE:(\{[^\n]*\})/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      expect(state.module).toBeUndefined();
    }
  });
});

describe('executeBaseCommand - exit/quit', () => {
  it('debe retornar null (no es manejado por baseCommand)', () => {
    const result = executeBaseCommand('exit', [], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Exiting Metasploit');
  });

  it('debe funcionar con quit', () => {
    const result = executeBaseCommand('quit', [], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Exiting Metasploit');
  });
});

describe('executeBaseCommand - clear', () => {
  it('debe limpiar la pantalla', () => {
    const result = executeBaseCommand('clear', [], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('CLEAR_TERMINAL');
  });
});

describe('executeBaseCommand - sessions', () => {
  it('debe mostrar sesiones activas', () => {
    const state: MsfState = {
      active: true,
      options: { RHOSTS: '192.168.1.10' },
      sessionOpen: true,
      shellMode: false,
      auxChecked: false
    };
    const result = executeBaseCommand('sessions', [], state, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('meterpreter');
    expect(result!.output).toContain('192.168.1.10');
  });

  it('debe mostrar mensaje si no hay sesiones', () => {
    const result = executeBaseCommand('sessions', [], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).not.toBeNull();
    expect(result!.output).toContain('No active sessions');
  });
});

describe('executeBaseCommand - comando desconocido', () => {
  it('debe retornar null para comando desconocido', () => {
    const result = executeBaseCommand('comando_inexistente', [], { active: true, options: {}, sessionOpen: false, shellMode: false, auxChecked: false }, createMockContext());
    expect(result).toBeNull();
  });
});
