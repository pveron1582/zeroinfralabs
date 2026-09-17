// ── hooks/__tests__/useAutoRefresh.test.ts ──────────────────────────
// Cubre las ramas de useAutoRefresh (17% branch antes de este test):
// early-return, htop vs top, isError, output vacío, reemplazo vs append.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoRefresh } from '../useAutoRefresh';

function makeOpts(overrides: any = {}) {
  return {
    busy: true,
    blockingCommand: { cancelKey: 'q', clearScreen: true, message: 'top -' } as any,
    executor: { executeCommand: vi.fn(() => ({ output: 'top - 12:00', isError: false })) },
    machine: { id: 'attacker-01' } as any,
    allMachines: [] as any[],
    currentMissionId: 1,
    currentDir: '/root',
    umask: 0o022,
    setUmask: vi.fn(),
    env: {},
    setEnv: vi.fn(),
    prompt: '# ',
    setHistory: vi.fn(),
    ...overrides,
  };
}

describe('useAutoRefresh', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('no programa interval si no está busy', () => {
    const opts = makeOpts({ busy: false });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(opts.executor.executeCommand).not.toHaveBeenCalled();
  });

  it('no programa interval sin cancelKey/clearScreen', () => {
    const opts = makeOpts({ blockingCommand: { message: 'top -' } });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(opts.executor.executeCommand).not.toHaveBeenCalled();
  });

  it('refresca como top y hace append cuando el último entry no es top', () => {
    const setHistory = vi.fn();
    const opts = makeOpts({ setHistory, blockingCommand: { cancelKey: 'q', clearScreen: true, message: 'top -' } });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(opts.executor.executeCommand).toHaveBeenCalledWith({ line: 'top', machine: expect.anything(), allMachines: expect.anything(), currentMissionId: 1, currentDir: '/root', umask: 0o022, setUmask: expect.anything(), env: {}, setEnv: expect.anything() });
    expect(setHistory).toHaveBeenCalled();
  });

  it('usa htop cuando el mensaje lo menciona', () => {
    const opts = makeOpts({ blockingCommand: { cancelKey: 'q', clearScreen: true, message: 'htop' } });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(opts.executor.executeCommand).toHaveBeenCalled();
    expect(opts.executor.executeCommand.mock.calls[0][0].line).toBe('htop');
  });

  it('no actualiza si el resultado es error', () => {
    const setHistory = vi.fn();
    const opts = makeOpts({ setHistory, executor: { executeCommand: vi.fn(() => ({ output: '', isError: true })) } });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(setHistory).not.toHaveBeenCalled();
  });

  it('no actualiza si el output está vacío', () => {
    const setHistory = vi.fn();
    const opts = makeOpts({ setHistory, executor: { executeCommand: vi.fn(() => ({ output: '', isError: false })) } });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(setHistory).not.toHaveBeenCalled();
  });

  it('reemplaza el último entry cuando es un top válido', () => {
    const history: any[] = [{ command: null, output: 'top - prev', streaming: false, prompt: '# ', timestamp: 1 }];
    const setHistory = vi.fn((updater) => {
      const next = typeof updater === 'function' ? updater(history) : updater;
      history.splice(0, history.length, ...next);
    });
    const opts = makeOpts({ setHistory });
    renderHook(() => useAutoRefresh(opts));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(history[history.length - 1].output).toBe('top - 12:00');
    expect(history).toHaveLength(1);
  });
});
