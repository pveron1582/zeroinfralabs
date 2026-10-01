// ── hooks/__tests__/useKeyboardShortcuts-bloqueo.test.ts ──────────
// Los caminos de ESTADOS ESPECIALES que el test principal no cubría
// (70,4 % de statements al empezar la tanda): python3 pendiente, el
// cancelKey y el F10 de las herramientas bloqueadas, Ctrl+C con un
// proceso ocupado y Ctrl+C dentro de Metasploit.
//
// Comparte el fixture con `keyboardDefaults.ts`, cuyo mock de `setHistory`
// ejecuta el updater — si no, el cuerpo de `setHistory(prev => [...])`
// (líneas 91/203/213) nunca se cubre.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { createDefaults, key, hist, resetHist } from './keyboardDefaults';
import type { MsfState } from '../../types/msf';

vi.mock('../../commands', () => ({
  isMsfActive: () => false,
  resetMsfState: vi.fn(),
  AVAILABLE_COMMAND_NAMES: ['help', 'ls', 'cat', 'cd', 'clear', 'sudo', 'ssh', 'nc', 'nmap', 'gobuster', 'hydra', 'msfconsole', 'chmod', 'chown', 'chgrp', 'umask', 'id', 'groups', 'nano', 'echo', 'touch', 'rm', 'cp', 'mv', 'rmdir', 'mkdir', 'find', 'grep'],
}));

describe('useKeyboardShortcuts — bloqueos y Ctrl+C', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetHist();
  });

  it('Ctrl+C cancela python3 pendiente antes que cualquier otra rama', () => {
    const d = createDefaults();
    d.pendingPythonCancel = vi.fn();
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('c', { ctrlKey: true }));

    expect(d.pendingPythonCancel).toHaveBeenCalled();
    expect(d.runCommand).not.toHaveBeenCalled();
    expect(d.setBlockingCommand).not.toHaveBeenCalled();
  });

  it('el cancelKey del blockingCommand limpia todo el estado', () => {
    const d = createDefaults();
    d.blockingCommand = { message: 'top - 12:00:01', cancelKey: 'q' };
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('q'));

    expect(d.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(d.setBusy).toHaveBeenCalledWith(false);
    expect(d.setListeningPort).toHaveBeenCalledWith(null);
    expect(d.setHistIdx).toHaveBeenCalledWith(-1);
  });

  it('F10 sale de htop aunque el cancelKey no sea F10', () => {
    const d = createDefaults();
    d.blockingCommand = { message: 'htop - 12:00:01', cancelKey: 'q' };
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('F10'));

    expect(d.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(d.setBusy).toHaveBeenCalledWith(false);
    expect(d.setListeningPort).toHaveBeenCalledWith(null);
  });

  it('Ctrl+C con blockingCommand escribe la cancelación en el historial', () => {
    const d = createDefaults();
    d.blockingCommand = { message: 'Listening on 4444', listeningPort: 4444 };
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('c', { ctrlKey: true }));

    expect(d.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(hist.current[hist.current.length - 1].output).toBe('^C\nConexión cancelada.');
  });

  it('Ctrl+C con un proceso ocupado escribe ^C y libera la terminal', () => {
    const d = createDefaults();
    d.busy = true;
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('c', { ctrlKey: true }));

    expect(d.setBusy).toHaveBeenCalledWith(false);
    expect(d.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(hist.current[hist.current.length - 1].output).toBe('^C');
    expect(d.setInput).not.toHaveBeenCalled();
  });

  it('Ctrl+C en msfconsole activo sale de Metasploit', () => {
    const d = createDefaults();
    d.msfState = { active: true } as MsfState;
    const { result } = renderHook(() => useKeyboardShortcuts(d));

    result.current.handleKeyDown(key('c', { ctrlKey: true }));

    expect(d.setMsfState).toHaveBeenCalledWith(null);
    expect(hist.current[hist.current.length - 1].output).toBe('^C\n[*] Exiting Metasploit...');
    expect(d.setInput).not.toHaveBeenCalled();
  });
});
