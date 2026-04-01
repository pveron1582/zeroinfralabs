// ── hooks/__tests__/useKeyboardShortcuts.test.ts ───────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

const createDefaults = () => {
  const machine = {
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };

  return {
    input: '',
    setInput: vi.fn(),
    machine,
    currentDir: '/',
    msfState: null,
    cmdHistory: [] as string[],
    setCmdHistory: vi.fn(),
    histIdx: -1,
    setHistIdx: vi.fn(),
    busy: false,
    setBusy: vi.fn(),
    blockingCommand: null as any,
    setBlockingCommand: vi.fn(),
    setListeningPort: vi.fn(),
    setHistory: vi.fn(),
    prompt: 'root@kali:/#',
    runCommand: vi.fn(),
    makeWelcome: vi.fn(() => ({ command: null, streaming: false, output: '', timestamp: Date.now() })),
    allMachines: [machine],
    goHome: vi.fn(),
    setMsfState: vi.fn(),
  };
};

vi.mock('../../commands', () => ({
  isMsfActive: () => false,
  resetMsfState: vi.fn(),
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar sin sugerencias', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(createDefaults()));
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.suggestionIdx).toBe(-1);
  });

  it('debe mostrar sugerencias al presionar Tab con múltiples coincidencias', () => {
    const defaults = createDefaults();
    defaults.input = 's';
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(defaults));

    const event = { key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    result.current.handleKeyDown(event);

    rerender();
    expect(result.current.showSuggestions).toBe(true);
    expect(result.current.suggestions.length).toBeGreaterThan(1);
  });

  it('debe cerrar sugerencias con Escape', () => {
    const defaults = createDefaults();
    defaults.input = 's';
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();
    expect(result.current.showSuggestions).toBe(true);

    result.current.handleKeyDown({ key: 'Escape', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();
    expect(result.current.showSuggestions).toBe(false);
  });

  it('debe ejecutar comando con Enter', () => {
    const defaults = createDefaults();
    defaults.input = 'help';
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.runCommand).toHaveBeenCalledWith('help');
  });

  it('debe navegar historial con ArrowUp', () => {
    const defaults = createDefaults();
    defaults.cmdHistory = ['cat', 'ls'];
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setHistIdx).toHaveBeenCalledWith(0);
    expect(defaults.setInput).toHaveBeenCalledWith('cat');
  });

  it('debe limpiar input con ArrowDown al final del historial', () => {
    const defaults = createDefaults();
    defaults.histIdx = 0;
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setHistIdx).toHaveBeenCalledWith(-1);
    expect(defaults.setInput).toHaveBeenCalledWith('');
  });

  it('debe limpiar pantalla con Ctrl+L', () => {
    const defaults = createDefaults();
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'l', ctrlKey: true, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setHistory).toHaveBeenCalled();
    expect(defaults.setHistIdx).toHaveBeenCalledWith(-1);
  });

  it('debe limpiar línea con Ctrl+U', () => {
    const defaults = createDefaults();
    defaults.input = 'some command';
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'u', ctrlKey: true, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setInput).toHaveBeenCalledWith('');
  });

  it('debe cancelar con Ctrl+C cuando no hay proceso activo', () => {
    const defaults = createDefaults();
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'c', ctrlKey: true, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setInput).toHaveBeenCalledWith('');
  });

  it('debe cerrar sugerencias con teclas que no son Tab', () => {
    const defaults = createDefaults();
    defaults.input = 's';
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();
    expect(result.current.showSuggestions).toBe(true);

    result.current.handleKeyDown({ key: 'a', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();
    expect(result.current.showSuggestions).toBe(false);
  });

  it('debe bloquear input cuando hay blockingCommand', () => {
    const defaults = createDefaults();
    defaults.blockingCommand = { message: 'Listening...', listeningPort: 4444 };
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.runCommand).not.toHaveBeenCalled();
  });

  it('debe cancelar blockingCommand con Ctrl+C', () => {
    const defaults = createDefaults();
    defaults.blockingCommand = { message: 'Listening...', listeningPort: 4444 };
    const { result } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'c', ctrlKey: true, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    expect(defaults.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(defaults.setBusy).toHaveBeenCalledWith(false);
  });
});
