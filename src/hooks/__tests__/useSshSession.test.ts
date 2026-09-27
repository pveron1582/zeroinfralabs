// ── hooks/__tests__/useSshSession.test.ts ──────────────────────────
// Cubre las ramas de useSshSession (0% branch antes de este test):
// getSshPromptFor por step, runSshPassword con/sin sshSession y sesión
// activa/cerrada, startSshSession.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSshSession, getSshPromptFor } from '../useSshSession';
import type { SessionRunnerDeps } from '../useFtpSession';
import type { SshSessionData } from '../../types';
import { createMockExecutor } from './executor-helpers';

const storeRef = vi.hoisted(() => ({ current: { sshSession: null as SshSessionData | null, setSshSession: vi.fn() } }));

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

describe('getSshPromptFor', () => {
  it('devuelve vacío si la sesión no está activa', () => {
    expect(getSshPromptFor(null)).toBe('');
    expect(getSshPromptFor({ active: false, targetIp: '10.0.0.1', username: 'root' })).toBe('');
  });

  it('muestra el prompt de password en step password', () => {
    expect(getSshPromptFor({ active: true, targetIp: '10.0.0.1', username: 'john', step: 'password' }))
      .toBe('john@10.0.0.1\'s password: ');
  });

  it('devuelve vacío fuera de step password', () => {
    expect(getSshPromptFor({ active: true, targetIp: '10.0.0.1', username: 'john', step: 'connected' })).toBe('');
  });
});

describe('useSshSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeRef.current = { sshSession: null, setSshSession: vi.fn() };
  });

  it('runSshPassword sin sshSession en la respuesta deja la sesión intacta', () => {
    const executeCommand = vi.fn(() => ({ output: 'denied' }));
    const { result } = renderHook(() => useSshSession());
    let out: ReturnType<ReturnType<typeof useSshSession>['runSshPassword']> | undefined;
    act(() => { out = result.current.runSshPassword('x', makeDeps(executeCommand)); });
    expect(out!.updatedSession).toBeNull();
    expect(storeRef.current.setSshSession).not.toHaveBeenCalled();
  });

  it('runSshPassword con sesión autenticada actualiza la sesión en el store', () => {
    const ss: SshSessionData = {
      active: true, targetIp: '10.0.0.1', targetId: 'v1', username: 'john',
      authenticated: true, step: 'connected',
    };
    const executeCommand = vi.fn(() => ({ output: 'ok', sshSession: ss }));
    const { result } = renderHook(() => useSshSession());
    let out: ReturnType<ReturnType<typeof useSshSession>['runSshPassword']> | undefined;
    act(() => { out = result.current.runSshPassword('pw', makeDeps(executeCommand)); });
    expect(out!.updatedSession?.authenticated).toBe(true);
    expect(storeRef.current.setSshSession).toHaveBeenCalledWith(out!.updatedSession);
  });

  it('runSshPassword con sesión cerrada (active=false) setea null', () => {
    const executeCommand = vi.fn(() => ({
      output: 'Connection closed', sshSession: { active: false, targetIp: '10.0.0.1' },
    }));
    const { result } = renderHook(() => useSshSession());
    let out: ReturnType<ReturnType<typeof useSshSession>['runSshPassword']> | undefined;
    act(() => { out = result.current.runSshPassword('pw', makeDeps(executeCommand)); });
    expect(out!.updatedSession).toBeNull();
    expect(storeRef.current.setSshSession).toHaveBeenCalledWith(null);
  });

  it('startSshSession guarda la sesión en el store', () => {
    const { result } = renderHook(() => useSshSession());
    act(() => result.current.startSshSession({
      active: true, targetIp: '10.0.0.1', targetId: 'v1', username: 'john',
      authenticated: false, step: 'password',
    }));
    expect(storeRef.current.setSshSession).toHaveBeenCalledWith(
      expect.objectContaining({ active: true, step: 'password' }),
    );
  });

  it('con terminalId la fuente de verdad es local y el store espeja para display', () => {
    const ss: SshSessionData = {
      active: true, targetIp: '10.0.0.1', targetId: 'v1', username: 'john',
      authenticated: true, step: 'connected',
    };
    const executeCommand = vi.fn(() => ({ output: 'ok', sshSession: ss }));
    const { result } = renderHook(() => useSshSession('term-1'));
    let out: ReturnType<ReturnType<typeof useSshSession>['runSshPassword']> | undefined;
    act(() => { out = result.current.runSshPassword('pw', makeDeps(executeCommand)); });
    expect(result.current.sshSession?.authenticated).toBe(true);
    expect(storeRef.current.setSshSession).toHaveBeenCalledWith(out!.updatedSession);
  });
});
