// ── hooks/__tests__/useKeyboardShortcuts.test.ts ───────────────────
// Teclas del prompt: navegación básica, Tab de autocompletado y su popup de
// sugerencias. Los ESTADOS ESPECIALES (python pendiente, herramientas
// bloqueadas, Ctrl+C con busy/msf) están en `useKeyboardShortcuts-bloqueo`;
// el fixture común (incluido el mock de `setHistory` que ejecuta el updater)
// vive en `keyboardDefaults.ts`.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { createDefaults, key, resetHist } from './keyboardDefaults';

vi.mock('../../commands', () => ({
  isMsfActive: () => false,
  resetMsfState: vi.fn(),
  AVAILABLE_COMMAND_NAMES: ['help', 'ls', 'cat', 'cd', 'clear', 'sudo', 'ssh', 'nc', 'nmap', 'gobuster', 'hydra', 'msfconsole', 'chmod', 'chown', 'chgrp', 'umask', 'id', 'groups', 'nano', 'echo', 'touch', 'rm', 'cp', 'mv', 'rmdir', 'mkdir', 'find', 'grep'],
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetHist();
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

  it('debe autocompletar comandos MSF con Tab cuando msfState está activo', () => {
    const defaults = createDefaults();
    defaults.msfState = { active: true } as any;
    defaults.input = 'us';
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();

    // Una sola coincidencia (use) → completar al instante.
    expect(defaults.setInput).toHaveBeenCalledWith('use');
    expect(result.current.showSuggestions).toBe(false);
  });

  it('debe autocompletar msfconsole como comando del sistema', () => {
    const defaults = createDefaults();
    defaults.input = 'msf';
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(defaults));

    result.current.handleKeyDown({ key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    rerender();

    expect(defaults.setInput).toHaveBeenCalledWith('msfconsole');
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

  // ── autocompletado con varias coincidencias ──
  const withReportFiles = () => {
    const d = createDefaults();
    d.input = 'cat rep';
    d.machine.files = [
      { path: '/report1.txt', content: '', type: 'text' },
      { path: '/report2.txt', content: '', type: 'text' },
    ];
    return d;
  };

  it('Tab completa hasta el prefijo común cuando hay varias coincidencias', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();

    expect(d.setInput).toHaveBeenCalledWith('cat report');
    expect(result.current.suggestions).toEqual(['report1.txt', 'report2.txt']);
    expect(result.current.suggestionIdx).toBe(0);
    expect(result.current.showSuggestions).toBe(true);
  });

  it('Tab con las sugerencias abiertas cicla y aplica la elegida', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();
    result.current.handleKeyDown(key('Tab'));
    rerender();

    expect(result.current.suggestionIdx).toBe(1);
    expect(d.setInput).toHaveBeenLastCalledWith('cat report2.txt');
  });

  it('ArrowUp con sugerencias abiertas va a la última', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();
    result.current.handleKeyDown(key('ArrowUp'));
    rerender();

    expect(result.current.suggestionIdx).toBe(1);
  });

  it('ArrowDown con sugerencias abiertas avanza en el ciclo', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();
    result.current.handleKeyDown(key('ArrowDown'));
    rerender();

    expect(result.current.suggestionIdx).toBe(1);
  });

  it('ArrowUp retrocede cuando la sugerencia seleccionada no es la primera', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();
    result.current.handleKeyDown(key('Tab'));     // idx 0 → 1
    rerender();
    result.current.handleKeyDown(key('ArrowUp')); // 1 − 1
    rerender();

    expect(result.current.suggestionIdx).toBe(0);
  });

  it('Tab sin ninguna coincidencia no escribe nada', () => {
    const d = createDefaults();
    d.input = 'zzzz';
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));

    expect(d.setInput).not.toHaveBeenCalled();
    expect(result.current.showSuggestions).toBe(false);
  });

  it('ciclar con Tab no escribe si la nueva entrada ya no tiene sugerencias', () => {
    const d = withReportFiles();
    const { result, rerender } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('Tab'));
    rerender();
    d.input = 'zzzz';  // se siguió escribiendo con el popup abierto
    rerender();
    result.current.handleKeyDown(key('Tab'));

    expect(d.setInput).toHaveBeenCalledTimes(1); // solo el primer Tab (prefijo común)
  });

  it('ArrowUp al final del historial no hace nada', () => {
    const d = createDefaults();
    d.cmdHistory = ['ls', 'cat'];
    d.histIdx = 1;
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('ArrowUp'));

    expect(d.setHistIdx).not.toHaveBeenCalled();
    expect(d.setInput).not.toHaveBeenCalled();
  });

  it('ArrowDown a media altura del historial vuelve a la entrada anterior', () => {
    const d = createDefaults();
    d.cmdHistory = ['ls', 'cat', 'pwd'];
    d.histIdx = 2;
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('ArrowDown'));

    expect(d.setHistIdx).toHaveBeenCalledWith(1);
    expect(d.setInput).toHaveBeenCalledWith('cat');
  });
});
