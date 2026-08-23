// ── hooks/useCommandRunner.ts ──────────────────────────────────────
// Orquestador delgado: compone los hooks especializados y expone la API
// que el componente Terminal espera.

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Machine, BlockingCommand } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { createIsolatedExecutor, resetShellManager, type MsfState } from '../commands';
import { resetProcessManager } from '../frameworks/process/processManager';
import { resetNetworkState } from '../frameworks/network/networkState';
import { resetPackageManager } from '../frameworks/packages/packageManager';
import { resetCron } from '../frameworks/cron/cronRunner';
import { resetMounts } from '../frameworks/fs/mounts';
import { useMissionCompletion } from './useMissionCompletion';
import { DEFAULT_ENV } from '../utils/environment';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useTerminalIdentity, getShortPath } from './useTerminalIdentity';
import { useIdentityStack } from './useIdentityStack';
import { useNanoSave } from './useNanoSave';
import { useTerminalEffects } from './useTerminalEffects';
import { useAutoRefresh } from './useAutoRefresh';
import { useReverseShell } from './useReverseShell';
import { usePendingSu } from './usePendingSu';
import { useFtpSession, getFtpPromptFor, type SessionRunnerDeps } from './useFtpSession';
import { useSshSession, getSshPromptFor } from './useSshSession';
import { useDownloadedFile } from './useDownloadedFile';
import { processCommandResult, type ProcessDeps, type HistoryEntry } from './processCommandResult';
import { getStreamingConfig, computeTotalDelay, shouldStream } from './streamingConfig';

export interface CommandRunnerProps {
  scenarioId: string;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  onMissionComplete: (id: number) => void;
  onChangeMachine: (id: string) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  onFailedUser?: (machineId: string, user: string) => void;
  onSudoPrivileges?: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  onExitTerminal?: () => void;
  onRequestExit?: () => void;
  onOpenTour?: () => void;
  termColor?: string;
}

type NanoFileState = { path: string; content: string; readOnly?: boolean; elevated?: boolean; existingSnapshot?: { owner: string; group: string; mode: number } };

export function useCommandRunner({
  scenarioId, machine, allMachines, currentMissionId,
  onMissionComplete, onChangeMachine, onCredentialsFound,
  onVerifyCredentials, onFailedUser, onSudoPrivileges,
  onExitTerminal, termColor = '#10b981'
}: CommandRunnerProps) {
  const color = termColor;

  // ── Per-instance state (local, no compartido entre terminales) ──
  const [msfState, setMsfState] = useState<MsfState | null>(null);
  const [currentDir, setCurrentDir] = useState('/root');
  const [blockingCommand, setBlockingCommand] = useState<BlockingCommand | null>(null);
  const [listeningPort, setListeningPort] = useState<number | null>(null);
  const [nanoFile, setNanoFile] = useState<NanoFileState | null>(null);
  const [umask, setUmask] = useState(0o022);
  // El entorno arranca con DEFAULT_ENV (PATH, HOME, USER, SHELL...) para que
  // `echo $PATH`, `export` y la expansión de $VAR funcionen desde el primer comando.
  // El tipo conserva `| undefined` para respetar las firmas de los deps, pero en
  // runtime siempre queda definido (inicialización + resets con DEFAULT_ENV).
  const [env, setEnv] = useState<Record<string, string> | undefined>(() => DEFAULT_ENV(machine));

  // ── Stack de identidades ─────────────────────────────────────────
  const { pushIdentity, popIdentity } = useIdentityStack({
    initialMachine: machine,
    onChangeMachine,
  });

  // ── Store (lectura) ──────────────────────────────────────────────
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability) as ProcessDeps['reportVulnerability'];
  const language = useScenarioStore(state => state.language);
  const attackerMachineId = useScenarioStore(state => state.currentScenario.initialMachineId);
  const goHome = useScenarioStore(state => state.goHome);

  // ── Executor aislado ─────────────────────────────────────────────
  const executor = useMemo(() => createIsolatedExecutor(), []);

  // ── Identidad actual / prompt base ───────────────────────────────
  const { sshUser, isRoot } = useTerminalIdentity(machine);
  const displayPath = getShortPath(currentDir || '/', isRoot);
  const basePrompt = `${sshUser}@${machine.machine_info.hostname}:${displayPath}${isRoot ? '#' : '$'}`;

  // ── Sesiones interactivas ────────────────────────────────────────
  const { ftpSession, setFtpSession, runFtpCommand, startFtpSession } = useFtpSession();
  const { sshSession, setSshSession, runSshPassword, startSshSession } = useSshSession();
  const { pendingSu, setPendingSu, handleSuPassword } = usePendingSu({
    machine, currentDir, setCurrentDir, pushIdentity,
  });

  const prompt = pendingSu
    ? `${pendingSu.targetUser}@${machine.machine_info.hostname}'s password: `
    : executor.isMsfActive()
      ? (executor.getMsfPrompt() || 'msf6 >')
      : ftpSession?.active
        ? (getFtpPromptFor(ftpSession) || 'ftp> ')
        : sshSession?.active
          ? (getSshPromptFor(sshSession) || '')
          : basePrompt;

  // ── Historial ────────────────────────────────────────────────────
  const makeWelcome = (_machines: Machine[]): HistoryEntry => ({
    command: null, streaming: false,
    output: '',
    timestamp: Date.now()
  });

  const [history, setHistory]       = useState<HistoryEntry[]>([makeWelcome(allMachines)]);
  const [input, setInput]           = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [busy, setBusy]             = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Efectos de UI (scroll, focus) ────────────────────────────────
  useTerminalEffects({
    scrollRef, inputRef, busy, blockingCommand,
    scrollDeps: [history, busy, input],
  });

  // ── Reset LOCAL al montar cada terminal ──────────────────────────
  // Cada ventana arranca limpia (historial, cwd, env, msf aislado) sin
  // tocar estado GLOBAL compartido: sesiones SSH/FTP, shells apiladas,
  // managers de red/procesos/cron/mounts e identidad. Así abrir una
  // segunda terminal no reinicia el laboratorio de la primera.
  useEffect(() => {
    setHistory([makeWelcome(allMachines)]);
    setCmdHistory([]); setHistIdx(-1); setInput(''); setBusy(false);
    setBlockingCommand(null);
    setListeningPort(null);
    setCurrentDir('/root');
    setMsfState(null);
    executor.resetMsfState();
    setUmask(0o022);
    setEnv(DEFAULT_ENV(machine));
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // ── Reset GLOBAL una sola vez por escenario ─────────────────────
  // Lo dispara la PRIMERA terminal que monta con este scenarioId.
  // Tampoco se re-dispara al ganar máquinas nuevas (antes,
  // `allMachines.length` en las deps mataba firewall/servicios/cron
  // configurados justo después de un exploit).
  useEffect(() => {
    const store = useScenarioStore.getState();
    if (store.globalResetDoneForScenario === scenarioId) return;
    store.markGlobalResetDone(scenarioId);
    store.setFtpSession(null);
    store.setSshSession(null);
    resetShellManager();
    resetProcessManager();
    resetNetworkState();
    resetPackageManager();
    resetCron();
    resetMounts();
    store.resetIdentity({
      machineId: machine.id,
      suUser: machine.su_user,
      cwd: '/root',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // ── Entorno por máquina/usuario ──────────────────────────────────
  // Re-deriva las variables por defecto (PATH/HOME/USER/SHELL...) cuando
  // cambia la máquina activa (SSH a otro host) o el usuario efectivo (su),
  // preservando los `export` custom del usuario (como `su` en bash real).
  useEffect(() => {
    setEnv(prev => ({ ...prev, ...DEFAULT_ENV(machine) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine.id, sshUser]);

  // ── Deps compartidas para ejecutar comandos ──────────────────────
  const sessionDeps: SessionRunnerDeps = {
    executor, machine, allMachines, currentMissionId, currentDir,
    setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState,
  };

  const { checkMissionCompletion } = useMissionCompletion(onMissionComplete);
  const { handleDownloadedFile } = useDownloadedFile({ attackerMachineId, allMachines, language, setHistory });

  const processDeps: ProcessDeps = {
    machine, allMachines, currentDir, setCurrentDir,
    pushIdentity, popIdentity, checkMissionCompletion,
    onMissionComplete, onChangeMachine, onCredentialsFound,
    onVerifyCredentials, onFailedUser, onSudoPrivileges,
    setBlockingCommand, setListeningPort, setNanoFile, setBusy,
    setHistory, setFtpSession, setSshSession, setPendingSu,
    reportVulnerability,
  };

  // ── Reverse shell (listener nc) ──────────────────────────────────
  const appendOutput = (output: string) => setHistory(prev => [...prev, {
    command: null, output, streaming: false, prompt, timestamp: Date.now(),
  }]);
  useReverseShell({
    blockingCommand, busy, allMachines, attackerMachineId, listeningPort,
    setBlockingCommand, setBusy, setListeningPort, setCurrentDir,
    pushIdentity, onChangeMachine, onMissionComplete, onVerifyCredentials,
    appendOutput,
  });

  // ── Auto-refresh top/htop ────────────────────────────────────────
  useAutoRefresh({
    busy, blockingCommand, executor, machine, allMachines,
    currentMissionId, currentDir, umask, setUmask, env, setEnv, prompt, setHistory,
  });

  // ── Ejecutor principal ───────────────────────────────────────────
  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();

    // `su` esperando password del usuario destino.
    if (pendingSu) {
      const suResult = handleSuPassword(trimmed);
      if (suResult) {
        setHistory(prev => [...prev, {
          command: null,
          output: suResult.output,
          streaming: false,
          prompt,
          timestamp: Date.now()
        }]);
        checkMissionCompletion(suResult);
      }
      setInput('');
      setHistIdx(-1);
      return;
    }

    if ((!trimmed && !ftpSession?.active && !sshSession?.active) || busy) return;
    setCmdHistory(prev => [trimmed, ...prev]);
    setInput(''); setHistIdx(-1);
    const currentPrompt = prompt;

    // ── FTP session activa ─────────────────────────────────────────
    if (ftpSession?.active) {
      const { result, updatedSession } = runFtpCommand(trimmed, sessionDeps);
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      checkMissionCompletion(result);
      handleDownloadedFile(result, () => getFtpPromptFor(updatedSession) || 'ftp> ');
      return;
    }

    // ── SSH session esperando password ─────────────────────────────
    if (sshSession?.active && sshSession.step === 'password') {
      const { result } = runSshPassword(trimmed, sessionDeps);
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      checkMissionCompletion(result);

      if ('foundCredentials' in result && result.foundCredentials) {
        onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file, result.foundCredentials.service);
        onVerifyCredentials?.(result.foundCredentials.machineId, result.foundCredentials.service);
      }
      if ('newMachineId' in result && result.newMachineId) {
        onChangeMachine(result.newMachineId);
        const sshUser = 'sshLoginUser' in result && result.sshLoginUser ? result.sshLoginUser : undefined;
        const sshCwd = sshUser === 'root' ? '/root' : (sshUser ? `/home/${sshUser}` : '/');
        pushIdentity({ machineId: result.newMachineId, suUser: sshUser, cwd: sshCwd });
      }
      if ('sshLoginUser' in result && result.sshLoginUser) {
        setCurrentDir(result.sshLoginUser === 'root' ? '/root' : `/home/${result.sshLoginUser}`);
      }
      return;
    }

    // ── Comando normal ─────────────────────────────────────────────
    const result = executor.executeCommand(
      trimmed, machine as any, allMachines as any, currentMissionId,
      setMsfState, currentDir, setCurrentDir, undefined, language,
      umask, setUmask, env, setEnv,
    );

    // Inicio de sesión FTP nuevo
    if ('ftpSession' in result && result.ftpSession?.connected && !ftpSession?.active) {
      startFtpSession(result.ftpSession, sessionDeps);
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      if ('completedMissionId' in result && result.completedMissionId) onMissionComplete(result.completedMissionId);
      return;
    }

    // Inicio de sesión SSH nuevo
    if ('sshSession' in result && result.sshSession?.active && !sshSession?.active) {
      startSshSession(result.sshSession);
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      return;
    }

    handleDownloadedFile(result, () => currentPrompt);

    if (result.output === 'CLEAR_TERMINAL') { setHistory([]); return; }
    if (result.output === 'EXIT_TO_LANDING') {
      const state = useScenarioStore.getState();
      const allComplete = state.missions.length > 0 && state.missions.every(m => m.status === 'completed');
      if (allComplete) {
        state.triggerSurvey(state.currentScenario);
      } else {
        useScenarioStore.getState().resetWorkspace();
      }
      return;
    }
    if ('exitTerminal' in result && result.exitTerminal) {
      onExitTerminal?.();
      return;
    }

    const cmdName = trimmed.split(/\s+/)[0].toLowerCase();
    const cfg = getStreamingConfig(cmdName);
    const customDelays = 'streamingLineDelays' in result ? result.streamingLineDelays : undefined;

    if (!shouldStream(cfg, customDelays)) {
      setHistory(prev => [...prev, { command: trimmed, output: result.output, streaming: false, prompt: currentPrompt, timestamp: Date.now() }]);
      processCommandResult(processDeps, result, false);
      return;
    }

    // ── Streaming línea por línea ──────────────────────────────────
    const entryTs = Date.now();
    setBusy(true);
    const lines = (result.output as string).split('\n');
    const totalDelay = computeTotalDelay(lines, cfg, customDelays);
    setHistory(prev => [...prev, { command: trimmed, streaming: true, lines, prompt: currentPrompt, timestamp: entryTs, result, lineDelays: customDelays }]);

    setTimeout(() => {
      setBusy(false);
      processCommandResult(processDeps, result, true);
      setHistory(prev => prev.map(e =>
        e.timestamp === entryTs ? { ...e, streaming: false, output: result.output } : e
      ));
      setTimeout(() => inputRef.current?.focus(), 60);
    }, totalDelay);
  };

  // ── Ctrl+C sobre un listener: limpiar también el store ───────────
  const cancelListening = (port: number | null) => {
    setListeningPort(port);
    useScenarioStore.getState().setListeningPort(port);
  };

  // ── Wrapper: resetear también el executor al salir de MSF ────────
  const handleSetMsfState = (state: MsfState | null) => {
    setMsfState(state);
    if (state === null) {
      executor.resetMsfState();
    }
  };

  // ── Nano save ────────────────────────────────────────────────────
  const { handleNanoSave: nanoSave } = useNanoSave({ machine, currentDir });
  const handleNanoSave = (content: string, filenameToSave?: string) =>
    nanoSave(nanoFile, content, filenameToSave);

  // ── Keyboard shortcuts ───────────────────────────────────────────
  const { showSuggestions, suggestions, suggestionIdx, handleKeyDown, setShowSuggestions, setSuggestions, setSuggestionIdx } = useKeyboardShortcuts({
    input, setInput, machine, currentDir, msfState,
    cmdHistory, setCmdHistory, histIdx, setHistIdx,
    busy, setBusy, blockingCommand, setBlockingCommand,
    setListeningPort: cancelListening, setHistory, prompt, runCommand,
    makeWelcome, allMachines, goHome, setMsfState: handleSetMsfState,
  });

  return {
    // State
    history, input, setInput, cmdHistory, setCmdHistory,
    histIdx, setHistIdx, busy, setBusy,
    // Refs
    scrollRef, inputRef,
    // Derived
    color, prompt, isRoot, sshUser,
    // Store connections
    ftpSession, sshSession, isMsfActive: executor.isMsfActive,
    blockingCommand, msfState, nanoFile,
    // Props passthrough (needed by Terminal render)
    machine, currentDir,
    // Actions
    handleKeyDown, runCommand, setHistory,
    makeWelcome, setNanoFile, handleNanoSave,
    // Autocomplete
    showSuggestions, suggestions, suggestionIdx,
    setShowSuggestions, setSuggestions, setSuggestionIdx,
    // `su` password prompt (hides input value in Terminal while waiting)
    pendingSu,
  };
}
