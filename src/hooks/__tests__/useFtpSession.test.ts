// ── hooks/__tests__/useFtpSession.test.ts ──────────────────────────
// Cubre las ramas de useFtpSession (0% branch antes de este test):
// getFtpPromptFor por step, runFtpCommand con/sin ftpSession y sesión
// activa/cerrada, startFtpSession con/sin shell activo.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFtpSession, getFtpPromptFor } from '../useFtpSession';
import type { SessionRunnerDeps } from '../useFtpSession';
import type { FtpSessionData } from '../../types';
import { createMockExecutor } from './executor-helpers';

const storeRef = vi.hoisted(() => ({ current: { ftpSession: null as FtpSessionData | null, setFtpSession: vi.fn() } }));
const commandsRef = vi.hoisted(() => ({
  isShellSessionActive: vi.fn((..._a: unknown[]) => false),
  startShellSession: vi.fn((..._a: unknown[]) => undefined),
}));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: any) => selector(storeRef.current)),
    { getState: vi.fn(() => storeRef.current), setState: vi.fn() }
  ),
}));

vi.mock('../../commands', () => ({
  isShellSessionActive: (...args: unknown[]) => commandsRef.isShellSessionActive(...args),
  startShellSession: (...args: unknown[]) => commandsRef.startShellSession(...args),
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

describe('getFtpPromptFor', () => {
  it('devuelve vacío si la sesión no está activa', () => {
    expect(getFtpPromptFor(null)).toBe('');
    expect(getFtpPromptFor({ active: false, targetIp: '10.0.0.1' })).toBe('');
  });

  it('muestra el prompt según el step', () => {
    expect(getFtpPromptFor({ active: true, targetIp: '10.0.0.1', step: 'username' }))
      .toBe('Name (10.0.0.1:root): ');
    expect(getFtpPromptFor({ active: true, targetIp: '10.0.0.1', step: 'password' }))
      .toBe('Password: ');
    expect(getFtpPromptFor({ active: true, targetIp: '10.0.0.1', step: 'connected' }))
      .toBe('ftp> ');
    expect(getFtpPromptFor({ active: true, targetIp: '10.0.0.1' }))
      .toBe('ftp> ');
  });
});

describe('useFtpSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeRef.current = { ftpSession: null, setFtpSession: vi.fn() };
    commandsRef.isShellSessionActive = vi.fn((..._a: unknown[]) => false);
    commandsRef.startShellSession = vi.fn((..._a: unknown[]) => undefined);
  });

  it('runFtpCommand sin ftpSession en la respuesta deja la sesión intacta', () => {
    const executeCommand = vi.fn(() => ({ output: '200 OK' }));
    const { result } = renderHook(() => useFtpSession());
    let out: ReturnType<ReturnType<typeof useFtpSession>['runFtpCommand']> | undefined;
    act(() => { out = result.current.runFtpCommand('ls', makeDeps(executeCommand)); });
    expect(out!.updatedSession).toBeNull();
    expect(storeRef.current.setFtpSession).not.toHaveBeenCalled();
  });

  it('runFtpCommand con sesión activa actualiza la sesión en el store', () => {
    const fs: FtpSessionData = {
      active: true, targetIp: '10.0.0.1', targetId: 'v1', username: 'anon',
      loggedIn: true, step: 'connected',
    };
    const executeCommand = vi.fn(() => ({ output: 'lista', ftpSession: fs }));
    const { result } = renderHook(() => useFtpSession());
    let out: ReturnType<ReturnType<typeof useFtpSession>['runFtpCommand']> | undefined;
    act(() => { out = result.current.runFtpCommand('ls', makeDeps(executeCommand)); });
    expect(out!.updatedSession?.active).toBe(true);
    expect(out!.updatedSession?.step).toBe('connected');
    expect(storeRef.current.setFtpSession).toHaveBeenCalledWith(out!.updatedSession);
  });

  it('runFtpCommand con sesión cerrada (active=false) setea null', () => {
    const executeCommand = vi.fn(() => ({
      output: '221 bye', ftpSession: { active: false, targetIp: '10.0.0.1' },
    }));
    const { result } = renderHook(() => useFtpSession());
    let out: ReturnType<ReturnType<typeof useFtpSession>['runFtpCommand']> | undefined;
    act(() => { out = result.current.runFtpCommand('quit', makeDeps(executeCommand)); });
    expect(out!.updatedSession).toBeNull();
    expect(storeRef.current.setFtpSession).toHaveBeenCalledWith(null);
  });

  it('startFtpSession inicia shell cuando no hay sesión activa', () => {
    const { result } = renderHook(() => useFtpSession());
    act(() => result.current.startFtpSession(
      { active: true, targetIp: '10.0.0.1', targetId: 'v1' }, makeDeps(vi.fn()),
    ));
    expect(commandsRef.startShellSession).toHaveBeenCalledOnce();
    expect(storeRef.current.setFtpSession).toHaveBeenCalledWith(
      expect.objectContaining({ active: true, step: 'username' }),
    );
  });

  it('startFtpSession NO inicia shell si ya hay una sesión activa', () => {
    commandsRef.isShellSessionActive = vi.fn((..._a: unknown[]) => true);
    const { result } = renderHook(() => useFtpSession());
    act(() => result.current.startFtpSession(
      { active: true, targetIp: '10.0.0.1', targetId: 'v1' }, makeDeps(vi.fn()),
    ));
    expect(commandsRef.startShellSession).not.toHaveBeenCalled();
    expect(storeRef.current.setFtpSession).toHaveBeenCalled();
  });

  it('startFtpSession sin targetIp solo setea la sesión local', () => {
    const { result } = renderHook(() => useFtpSession());
    act(() => result.current.startFtpSession(
      { active: true, targetId: 'v1' }, makeDeps(vi.fn()),
    ));
    expect(commandsRef.startShellSession).not.toHaveBeenCalled();
    expect(storeRef.current.setFtpSession).toHaveBeenCalled();
  });

  it('con terminalId la fuente de verdad es local y el store espeja para display', () => {
    const fs: FtpSessionData = {
      active: true, targetIp: '10.0.0.1', targetId: 'v1', username: 'anon',
      loggedIn: true, step: 'connected',
    };
    const executeCommand = vi.fn(() => ({ output: 'lista', ftpSession: fs }));
    const { result } = renderHook(() => useFtpSession('term-1'));
    let out: ReturnType<ReturnType<typeof useFtpSession>['runFtpCommand']> | undefined;
    act(() => { out = result.current.runFtpCommand('ls', makeDeps(executeCommand)); });
    expect(result.current.ftpSession?.active).toBe(true);
    expect(result.current.ftpSession?.step).toBe('connected');
    expect(storeRef.current.setFtpSession).toHaveBeenCalledWith(out!.updatedSession);
  });
});
