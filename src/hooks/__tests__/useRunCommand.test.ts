// ── hooks/__tests__/useRunCommand.test.ts ──────────────────────────
// Ejercita TODAS las ramas del orquestador runCommand (useRunCommand),
// que era la zona con menor branch coverage (41%). Se testea el runner
// devuelto por el hook pasándole un deps completo y simulando cada
// tipo de sesión: su pendiente, python3 input(), FTP activo, SSH en
// password, inicio de sesión FTP/SSH nueva, streaming, CLEAR/EXIT y
// exitTerminal.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRunCommand } from '../useRunCommand';
import type { SessionRunnerDeps } from '../useFtpSession';
import type { RunCommandDeps } from '../useRunCommand';

const processRef = vi.hoisted(() => ({ process: vi.fn() }));
const ftpRef = vi.hoisted(() => ({ getPrompt: vi.fn(() => 'ftp> ') }));
const streamRef = vi.hoisted(() => ({ shouldStream: vi.fn(() => false) }));
const storeRef = vi.hoisted(() => ({
  current: {
    missions: [{ id: 1, status: 'completed' }],
    currentScenario: { id: 's1' },
    triggerSurvey: vi.fn(),
    resetWorkspace: vi.fn(),
  },
}));

vi.mock('../processCommandResult', () => ({ processCommandResult: (...a: unknown[]) => processRef.process(...a) }));
vi.mock('../useFtpSession', () => ({ getFtpPromptFor: (...a: unknown[]) => ftpRef.getPrompt(...a) }));
vi.mock('../streamingConfig', () => ({
  getStreamingConfig: () => ({ slow: false, perLineMs: 0, extraMs: 0 }),
  computeTotalDelay: () => 0,
  shouldStream: (...a: unknown[]) => streamRef.shouldStream(...a),
}));
vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: { getState: () => storeRef.current },
}));

function makeDeps(overrides: Partial<RunCommandDeps> = {}): RunCommandDeps {
  const sessionDeps = overrides.sessionDeps ?? ({
    executor: { executeCommand: vi.fn(() => ({ output: 'ok' })) } as SessionRunnerDeps['executor'],
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
  } as SessionRunnerDeps);

  return {
    pendingSu: null,
    handleSuPassword: vi.fn(),
    pendingPython: null,
    handlePythonInput: vi.fn(),
    ftpSession: null,
    runFtpCommand: vi.fn(() => ({ result: { output: 'ftp-out' }, updatedSession: null })),
    startFtpSession: vi.fn(),
    sshSession: null,
    runSshPassword: vi.fn(() => ({ result: { output: 'ssh-out' } })),
    startSshSession: vi.fn(),
    busy: false,
    setBusy: vi.fn(),
    setHistory: vi.fn(),
    setInput: vi.fn(),
    setHistIdx: vi.fn(),
    setCmdHistory: vi.fn(),
    prompt: 'root@kali# ',
    checkMissionCompletion: vi.fn(),
    sessionDeps,
    processDeps: { machine: { id: 'attacker-01' } } as RunCommandDeps['processDeps'],
    executor: sessionDeps.executor,
    setMsfState: vi.fn(),
    onCredentialsFound: vi.fn(),
    onVerifyCredentials: vi.fn(),
    onChangeMachine: vi.fn(),
    pushIdentity: vi.fn(),
    handleDownloadedFile: vi.fn(),
    onMissionComplete: vi.fn(),
    onExitTerminal: vi.fn(),
    inputRef: { current: null },
    ...overrides,
  };
}

describe('useRunCommand - runCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streamRef.shouldStream = vi.fn(() => false);
    ftpRef.getPrompt = vi.fn(() => 'ftp> ');
  });

  it('comando vacío y sin sesiones no hace nada', () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current(''); });
    expect(deps.setCmdHistory).not.toHaveBeenCalled();
  });

  it('busy=true corta la ejecución', () => {
    const deps = makeDeps({ busy: true });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('ls'); });
    expect(deps.executor.executeCommand).not.toHaveBeenCalled();
  });

  it('su pendiente: delega al handler y no corre el comando', () => {
    const handleSuPassword = vi.fn(() => ({ output: 'auth ok' }));
    const deps = makeDeps({ pendingSu: { targetUser: 'root', promptToken: '' }, handleSuPassword });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('rootpass'); });
    expect(handleSuPassword).toHaveBeenCalledWith('rootpass');
    expect(deps.checkMissionCompletion).toHaveBeenCalled();
    expect(deps.executor.executeCommand).not.toHaveBeenCalled();
  });

  it('su pendiente sin suResult: solo limpia input', () => {
    const handleSuPassword = vi.fn(() => null);
    const deps = makeDeps({ pendingSu: { targetUser: 'root', promptToken: '' }, handleSuPassword });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('x'); });
    expect(deps.setInput).toHaveBeenCalledWith('');
  });

  it('python3 pendiente: re-ejecuta vía handlePythonInput (done=true)', () => {
    const handlePythonInput = vi.fn(() => ({ delta: 'out', done: true, result: { output: 'fin' } }));
    const deps = makeDeps({ pendingPython: { argv: [], sourceName: '', inputs: [], shownOutput: '' }, handlePythonInput });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('kali'); });
    expect(handlePythonInput).toHaveBeenCalledWith('kali');
    expect(processRef.process).toHaveBeenCalled();
  });

  it('python3 pendiente: handlePythonInput null no rompe', () => {
    const handlePythonInput = vi.fn(() => null);
    const deps = makeDeps({ pendingPython: { argv: [], sourceName: '', inputs: [], shownOutput: '' }, handlePythonInput });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('x'); });
    expect(deps.setHistory).not.toHaveBeenCalled();
  });

  it('sesión FTP activa: corre runFtpCommand y chequea misión', () => {
    const runFtpCommand = vi.fn(() => ({ result: { output: 'ls-out' }, updatedSession: { active: true } }));
    const deps = makeDeps({ ftpSession: { active: true }, runFtpCommand });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('ls'); });
    expect(runFtpCommand).toHaveBeenCalled();
    expect(deps.checkMissionCompletion).toHaveBeenCalled();
    expect(deps.handleDownloadedFile).toHaveBeenCalled();
  });

  it('SSH en password: corre runSshPassword y reporta credenciales/nuevo equipo', () => {
    const runSshPassword = vi.fn(() => ({
      result: {
        output: 'ok',
        foundCredentials: { machineId: 'v1', user: 'a', pass: 'p', file: 'f', service: 'ssh' },
        newMachineId: 'v1',
        sshLoginUser: 'root',
      },
    }));
    const onCredentialsFound = vi.fn();
    const onVerifyCredentials = vi.fn();
    const onChangeMachine = vi.fn();
    const pushIdentity = vi.fn();
    const deps = makeDeps({
      sshSession: { active: true, step: 'password' },
      runSshPassword,
      onCredentialsFound, onVerifyCredentials, onChangeMachine, pushIdentity,
    });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('pw'); });
    expect(runSshPassword).toHaveBeenCalled();
    expect(onCredentialsFound).toHaveBeenCalled();
    expect(onVerifyCredentials).toHaveBeenCalled();
    expect(onChangeMachine).toHaveBeenCalledWith('v1');
    expect(pushIdentity).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/root' }));
  });

  it('SSH en password sin credenciales ni equipo nuevo: solo chequea misión', () => {
    const runSshPassword = vi.fn(() => ({ result: { output: 'ok', sshLoginUser: 'john' } }));
    const sessionDeps = makeDeps().sessionDeps;
    const setCurrentDir = vi.fn();
    sessionDeps.setCurrentDir = setCurrentDir;
    const deps = makeDeps({
      sshSession: { active: true, step: 'password' },
      runSshPassword,
      sessionDeps,
    });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('pw'); });
    expect(setCurrentDir).toHaveBeenCalledWith('/home/john');
  });

  it('comando normal: inicia sesión FTP nueva (connected)', () => {
    const executor = { executeCommand: vi.fn(() => ({ output: 'ok', ftpSession: { active: true, connected: true, targetIp: '1.1.1.1' } })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const startFtpSession = vi.fn();
    const onMissionComplete = vi.fn();
    const deps = makeDeps({ sessionDeps, startFtpSession, onMissionComplete, ftpSession: { active: false } });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('ftp 1.1.1.1'); });
    expect(startFtpSession).toHaveBeenCalled();
    expect(onMissionComplete).not.toHaveBeenCalled();
  });

  it('comando normal: inicia sesión FTP nueva y completa misión', () => {
    const executor = { executeCommand: vi.fn(() => ({ output: 'ok', ftpSession: { active: true, connected: true }, completedMissionId: 9 })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const startFtpSession = vi.fn();
    const onMissionComplete = vi.fn();
    const deps = makeDeps({ sessionDeps, startFtpSession, onMissionComplete });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('ftp 1.1.1.1'); });
    expect(onMissionComplete).toHaveBeenCalledWith(9);
  });

  it('comando normal: inicia sesión SSH nueva', () => {
    const executor = { executeCommand: vi.fn(() => ({ output: 'ok', sshSession: { active: true, targetIp: '1.1.1.1' } })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const startSshSession = vi.fn();
    const deps = makeDeps({ sessionDeps, startSshSession });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('ssh root@1.1.1.1'); });
    expect(startSshSession).toHaveBeenCalled();
  });

  it('CLEAR_TERMINAL limpia el historial', () => {
    const executor = { executeCommand: vi.fn(() => ({ output: 'CLEAR_TERMINAL' })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const deps = makeDeps({ sessionDeps, setHistory: vi.fn() });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('clear'); });
    expect(deps.setHistory).toHaveBeenCalledWith([]);
  });

  it('EXIT_TO_LANDING con todas las misiones completas dispara survey', () => {
    storeRef.current.missions = [{ id: 1, status: 'completed' }];
    const executor = { executeCommand: vi.fn(() => ({ output: 'EXIT_TO_LANDING' })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const deps = makeDeps({ sessionDeps });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('exit'); });
    expect(storeRef.current.triggerSurvey).toHaveBeenCalled();
    expect(storeRef.current.resetWorkspace).not.toHaveBeenCalled();
  });

  it('EXIT_TO_LANDING con misiones incompletas resetea el workspace', () => {
    storeRef.current.missions = [{ id: 1, status: 'active' }];
    const executor = { executeCommand: vi.fn(() => ({ output: 'EXIT_TO_LANDING' })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const deps = makeDeps({ sessionDeps });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('exit'); });
    expect(storeRef.current.resetWorkspace).toHaveBeenCalled();
  });

  it('exitTerminal: invoca onExitTerminal', () => {
    const onExitTerminal = vi.fn();
    const executor = { executeCommand: vi.fn(() => ({ output: 'ok', exitTerminal: true })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const deps = makeDeps({ sessionDeps, onExitTerminal });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('quit'); });
    expect(onExitTerminal).toHaveBeenCalled();
  });

  it('comando normal no-streaming: procesa el resultado', () => {
    const executor = { executeCommand: vi.fn(() => ({ output: 'hola' })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const deps = makeDeps({ sessionDeps });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('echo hola'); });
    expect(processRef.process).toHaveBeenCalled();
  });

  it('comando con streaming: marca busy y procesa tras el delay', () => {
    vi.useFakeTimers();
    streamRef.shouldStream = vi.fn(() => true);
    const executor = { executeCommand: vi.fn(() => ({ output: 'line1\nline2', streamingLineDelays: [10, 10] })) };
    const sessionDeps = { ...makeDeps().sessionDeps, executor };
    const setBusy = vi.fn();
    const deps = makeDeps({ sessionDeps, setBusy });
    const { result } = renderHook(() => useRunCommand(deps));
    act(() => { result.current('nmap 1.1.1.1'); });
    expect(setBusy).toHaveBeenCalledWith(true);
    act(() => { vi.advanceTimersByTime(100); });
    expect(setBusy).toHaveBeenCalledWith(false);
    expect(processRef.process).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
