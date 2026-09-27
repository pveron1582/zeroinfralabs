// ── hooks/__tests__/useRdpSession.test.ts ─────────────────────────
// Cubre getRdpPromptFor por step, el aislamiento por terminalId (fuente
// de verdad local) y el espejo al store para display.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRdpSession, getRdpPromptFor } from '../useRdpSession';
import type { SessionRunnerDeps } from '../useFtpSession';
import type { RdpSessionData } from '../../types';
import { createMockExecutor } from './executor-helpers';

const storeRef = vi.hoisted(() => ({ current: { rdpSession: null as RdpSessionData | null, setRdpSession: vi.fn() } }));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: any) => selector(storeRef.current)),
    { getState: vi.fn(() => storeRef.current), setState: vi.fn() }
  ),
}));

function makeDeps(executeCommand: SessionRunnerDeps['executor']['executeCommand']): SessionRunnerDeps {
  return {
    executor: createMockExecutor(executeCommand),
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

describe('getRdpPromptFor', () => {
  it('devuelve vacío si la sesión no está activa', () => {
    expect(getRdpPromptFor(null)).toBe('');
    expect(getRdpPromptFor({ active: false, targetIp: '192.168.1.10' })).toBe('');
  });

  it('muestra el prompt según el step', () => {
    expect(getRdpPromptFor({ active: true, targetIp: '192.168.1.10', step: 'username' }))
      .toBe('Usuario (192.168.1.10): ');
    expect(getRdpPromptFor({ active: true, targetIp: '192.168.1.10', username: 'admin', step: 'password' }))
      .toBe("admin@192.168.1.10's password: ");
    expect(getRdpPromptFor({ active: true, targetIp: '192.168.1.10', step: 'connected' })).toBe('');
  });
});

describe('useRdpSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeRef.current = { rdpSession: null, setRdpSession: vi.fn() };
  });

  it('startRdpSession guarda la sesión en el store (modo legacy)', () => {
    const { result } = renderHook(() => useRdpSession());
    act(() => result.current.startRdpSession({
      active: true, targetIp: '192.168.1.10', targetId: 'v1', username: 'admin',
      authenticated: false, step: 'password',
    }));
    expect(storeRef.current.setRdpSession).toHaveBeenCalledWith(
      expect.objectContaining({ active: true, step: 'password' }),
    );
  });

  it('con terminalId la fuente de verdad es local y el store espeja para display', () => {
    const { result } = renderHook(() => useRdpSession('term-1'));
    act(() => result.current.startRdpSession({
      active: true, targetIp: '192.168.1.10', targetId: 'v1', username: 'admin',
      authenticated: true, connected: true, step: 'connected',
    }));
    expect(result.current.rdpSession?.authenticated).toBe(true);
    expect(storeRef.current.setRdpSession).toHaveBeenCalledWith(
      expect.objectContaining({ active: true, authenticated: true }),
    );
  });

  it('runRdpInput con sesión cerrada setea null en local y store', () => {
    const executeCommand = vi.fn(() => ({
      output: 'bye', rdpSession: { active: false, targetIp: '192.168.1.10' },
    }));
    const { result } = renderHook(() => useRdpSession('term-1'));
    act(() => result.current.startRdpSession({
      active: true, targetIp: '192.168.1.10', targetId: 'v1', username: 'admin',
      authenticated: false, step: 'password',
    }));
    let out: ReturnType<ReturnType<typeof useRdpSession>['runRdpInput']> | undefined;
    act(() => { out = result.current.runRdpInput('x', makeDeps(executeCommand)); });
    expect(out!.updatedSession).toBeNull();
    expect(result.current.rdpSession).toBeNull();
    expect(storeRef.current.setRdpSession).toHaveBeenLastCalledWith(null);
  });
});
