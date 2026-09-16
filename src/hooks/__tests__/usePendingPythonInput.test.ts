// ── hooks/__tests__/usePendingPythonInput.test.ts ───────────────────
// Tests del flujo de input() interactivo de python3: el hook re-ejecuta
// el script con la cola de entradas acumulada y expone el delta.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePendingPythonInput } from '../usePendingPythonInput';
import type { SessionRunnerDeps } from '../useFtpSession';

interface Handled {
  delta: string;
  done: boolean;
}

const cmdPython3Mock = vi.fn();

vi.mock('../../commands/builtin/python3', () => ({
  cmd_python3: { execute: (...args: unknown[]) => cmdPython3Mock(...args) },
}));

function makeDeps(): SessionRunnerDeps {
  return {
    executor: {} as SessionRunnerDeps['executor'],
    machine: { id: 'attacker-01' } as SessionRunnerDeps['machine'],
    allMachines: [],
    currentMissionId: 1,
    currentDir: '/root',
    setCurrentDir: vi.fn(),
    umask: 0o022,
    setUmask: vi.fn(),
    env: {},
    setEnv: vi.fn(),
    language: 'es',
    setMsfState: vi.fn(),
    terminalId: 't1',
  };
}

describe('usePendingPythonInput', () => {
  beforeEach(() => {
    cmdPython3Mock.mockReset();
  });

  it('devuelve null si no hay script esperando input', () => {
    const { result } = renderHook(() => usePendingPythonInput({ sessionDeps: makeDeps() }));
    expect(result.current.pendingPython).toBeNull();
    expect(result.current.handlePythonInput('hola')).toBeNull();
  });

  it('re-ejecuta el script con la entrada acumulada y calcula el delta', () => {
    const { result } = renderHook(() => usePendingPythonInput({ sessionDeps: makeDeps() }));
        act(() => {
      result.current.setPendingPython({
        argv: ['/tmp/saludo.py'],
        sourceName: '/tmp/saludo.py',
        inputs: [],
        shownOutput: 'Quién sos? ',
      });
    });

    cmdPython3Mock.mockReturnValue({
      output: 'Quién sos? kali\nHola kali',
    });

    let handled!: Handled | null;
    act(() => {
      handled = result.current.handlePythonInput('kali');
    });

    expect(cmdPython3Mock).toHaveBeenCalledWith(
      ['/tmp/saludo.py'],
      expect.objectContaining({ pythonInputs: ['kali'], currentDir: '/root', terminalId: 't1' }),
    );
    expect(handled?.delta).toBe('kali\nHola kali');
    expect(handled?.done).toBe(true);
    expect(result.current.pendingPython).toBeNull();
  });

  it('mantiene el estado pendiente si el script pide otro input', () => {
    const { result } = renderHook(() => usePendingPythonInput({ sessionDeps: makeDeps() }));

    act(() => {
      result.current.setPendingPython({
        argv: ['x.py'],
        sourceName: 'x.py',
        inputs: [],
        shownOutput: 'A? ',
      });
    });

    cmdPython3Mock.mockReturnValue({
      output: 'A? uno\nB? ',
      pythonPendingInput: { argv: ['x.py'], sourceName: 'x.py' },
    });

    let handled!: Handled | null;
    act(() => {
      handled = result.current.handlePythonInput('uno');
    });

    expect(handled?.delta).toBe('uno\nB? ');
    expect(handled?.done).toBe(false);
    expect(result.current.pendingPython?.inputs).toEqual(['uno']);
    expect(result.current.pendingPython?.shownOutput).toBe('A? uno\nB? ');
  });

  it('muestra el output completo si el prefijo cambia (script no determinista)', () => {
    const { result } = renderHook(() => usePendingPythonInput({ sessionDeps: makeDeps() }));

    act(() => {
      result.current.setPendingPython({
        argv: ['x.py'],
        sourceName: 'x.py',
        inputs: [],
        shownOutput: 'prefijo-viejo',
      });
    });

    cmdPython3Mock.mockReturnValue({ output: 'salida-distinta' });

    let handled!: Handled | null;
    act(() => {
      handled = result.current.handlePythonInput('x');
    });
    expect(handled?.delta).toBe('salida-distinta');
  });
});
