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
import type { ProcessDeps, HistoryEntry } from './processCommandResult';
import { useRunCommand } from './useRunCommand';

export interface CommandRunnerProps {
  scenarioId: string;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  // Id único de la terminal (P2-13/C1): aísla las sesiones de shell por ventana.
  terminalId?: string;
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
  scenarioId, machine, allMachines, currentMissionId, terminalId,
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
    terminalId,
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

  // ── Ejecutor principal (extraído a useRunCommand) ────────────────
  const runCommand = useRunCommand({
    pendingSu, handleSuPassword,
    ftpSession, runFtpCommand, startFtpSession,
    sshSession, runSshPassword, startSshSession,
    busy, setBusy, setHistory, setInput, setHistIdx, setCmdHistory,
    prompt, checkMissionCompletion, sessionDeps, processDeps, executor,
    setMsfState, onCredentialsFound, onVerifyCredentials, onChangeMachine,
    pushIdentity, handleDownloadedFile, onMissionComplete, onExitTerminal,
    inputRef,
  });

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
