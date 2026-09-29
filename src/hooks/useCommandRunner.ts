// ── hooks/useCommandRunner.ts ──────────────────────────────────────
// Orquestador delgado: compone los hooks especializados y expone la API
// que el componente Terminal espera.

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Machine, BlockingCommand } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { createIsolatedExecutor, type MsfState, type PsState } from '../commands';
import { shellManager } from '../frameworks/shells/ShellManager';
import { useMissionCompletion } from './useMissionCompletion';
import { DEFAULT_ENV } from '../utils/environment';
import { capHistory } from '../utils/format';
import { initialCwd } from '../utils/users';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useTerminalIdentity, buildBasePrompt } from './useTerminalIdentity';
import { useIdentityStack } from './useIdentityStack';
import { useNanoSave } from './useNanoSave';
import { useTerminalEffects } from './useTerminalEffects';
import { useAutoRefresh } from './useAutoRefresh';
import { useReverseShell } from './useReverseShell';
import { usePendingSu } from './usePendingSu';
import { usePendingPythonInput } from './usePendingPythonInput';
import { useFtpSession, type SessionRunnerDeps } from './useFtpSession';
import { useSshSession } from './useSshSession';
import { useRdpSession } from './useRdpSession';
import { useDownloadedFile } from './useDownloadedFile';
import { makeWelcome, type ProcessDeps, type HistoryEntry } from './processCommandResult';
import { useScenarioGlobalReset } from './useScenarioGlobalReset';
import { useTerminalMountReset } from './useTerminalMountReset';
import { buildPrompt } from './terminalPrompt';
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
  const [psState, setPsState] = useState<PsState | null>(null);
  const [currentDir, setCurrentDir] = useState(() => initialCwd(machine));
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
  // topSuUser: su del frame superior de ESTA terminal (aislamiento HIGH #2)
  // — deriva prompt, env y ejecución del frame local, nunca del store.
  const { topSuUser: suUserOverride, pushIdentity, popIdentity } = useIdentityStack({
    initialMachine: machine,
    onChangeMachine,
    setCurrentDir,
    terminalId,
  });

  // ── Store (lectura) ──────────────────────────────────────────────
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability) as ProcessDeps['reportVulnerability'];
  const language = useScenarioStore(state => state.language);
  const attackerMachineId = useScenarioStore(state => state.currentScenario.initialMachineId);
  const goHome = useScenarioStore(state => state.goHome);

  // ── Executor aislado ─────────────────────────────────────────────
  const executor = useMemo(() => createIsolatedExecutor(), []);

  // ── Identidad actual / prompt base ───────────────────────────────
  const { sshUser, isRoot } = useTerminalIdentity(machine, suUserOverride);
  const { displayPath, basePrompt } = buildBasePrompt(machine, currentDir, sshUser, isRoot);

  // ── Sesiones interactivas ────────────────────────────────────────
  const { ftpSession, runFtpCommand, startFtpSession } = useFtpSession(terminalId);
  const { sshSession, runSshPassword, startSshSession } = useSshSession(terminalId);
  const { rdpSession, runRdpInput, startRdpSession } = useRdpSession(terminalId);
  const { pendingSu, setPendingSu, handleSuPassword } = usePendingSu({
    machine, currentDir, setCurrentDir, pushIdentity, terminalId,
  });

  // ── Historial ────────────────────────────────────────────────────
  // El setter pasa por capHistory: con un `while True: print(...)` el
  // historial crecía sin límite (una entrada por comando) y cada render
  // re-mapeaba la lista entera. Ningún call site cambia (P1 3.7).
  const [history, setHistoryRaw]   = useState<HistoryEntry[]>([makeWelcome(allMachines)]);
  const setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>> = useCallback((updater) => {
    setHistoryRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return capHistory(next);
    });
  }, []);
  const [input, setInput]           = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [busy, setBusy]             = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Efectos de UI (scroll, focus) ────────────────────────────────
  // scrollDeps (fuerza): tras cada comando/salida el prompt de entrada
  // queda visible en la última línea. softDeps (tipeo): solo se mantiene
  // el fondo si el usuario ya estaba cerca — si está leyendo salida vieja
  // no se lo arrastra al final con cada tecla.
  useTerminalEffects({
    scrollRef, inputRef, busy, blockingCommand,
    scrollDeps: [history, busy],
    softDeps: [input],
  });

  // ── Reset GLOBAL una sola vez por escenario (ver useScenarioGlobalReset) ──
  useScenarioGlobalReset(scenarioId, machine);

  // ── Cleanup al desmontar ───────────────────────────────────────
  // Destruye el stack de shells de ESTA terminal (cierre, cambio de
  // modo, salir de lección). Sin esto, ids reutilizables
  // ('classic-terminal', 'labmini-*', 'win-rdp-*') heredan sesiones viejas.
  // Sin terminalId no se toca el stack compartido 'default' (puede ser
  // usado por otros componentes simultáneos).
  useEffect(() => {
    if (!terminalId) return;
    return () => shellManager.destroyOwner(terminalId);
  }, [terminalId]);

  // ── Deps compartidas para ejecutar comandos ──────────────────────
  const sessionDeps: SessionRunnerDeps = {
    executor, machine, allMachines, currentMissionId, currentDir,
    setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState,
    setPsState,
    terminalId,
    suUserOverride,
  };

  // python3 esperando input() (necesita sessionDeps para re-ejecutar).
  const { pendingPython, setPendingPython, handlePythonInput } = usePendingPythonInput({
    sessionDeps,
  });

  // ── Reset LOCAL al montar cada terminal (ver useTerminalMountReset) ──
  useTerminalMountReset({
    scenarioId, machine, allMachines, executor, inputRef, makeWelcome,
    setHistory, setCmdHistory, setHistIdx, setInput, setBusy,
    setBlockingCommand, setListeningPort, setCurrentDir, setMsfState,
    setPsState, setPendingPython, setUmask, setEnv,
  });

  // ── Entorno por máquina/usuario ──────────────────────────────────
  // Re-deriva las variables por defecto (PATH/HOME/USER/SHELL...) cuando
  // cambia la máquina activa (SSH a otro host) o el usuario efectivo (su),
  // preservando los `export` custom del usuario (como `su` en bash real).
  useEffect(() => {
    setEnv(prev => ({ ...prev, ...DEFAULT_ENV(machine, suUserOverride) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine.id, sshUser]);

  const prompt = buildPrompt({
    pendingSu, pendingPython,
    isPsActive: executor.isPsActive(), isMsfActive: executor.isMsfActive(),
    msfPrompt: executor.getMsfPrompt(),
    ftpSession, sshSession, rdpSession,
    hostname: machine.machine_info.hostname, displayPath, basePrompt,
  });

  const { checkMissionCompletion } = useMissionCompletion(onMissionComplete);
  const { handleDownloadedFile } = useDownloadedFile({ attackerMachineId, allMachines, language, setHistory });

  const processDeps: ProcessDeps = {
    machine, allMachines, currentDir, setCurrentDir,
    pushIdentity, popIdentity, checkMissionCompletion,
    onMissionComplete, onChangeMachine, onCredentialsFound,
    onVerifyCredentials, onFailedUser, onSudoPrivileges,
    setBlockingCommand, setListeningPort, setNanoFile, setBusy,
    setHistory, setPendingSu, setPendingPython,
    reportVulnerability,
    terminalId,
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
    terminalId,
  });

  // ── Auto-refresh top/htop ────────────────────────────────────────
  useAutoRefresh({
    busy, blockingCommand, executor, machine, allMachines,
    currentMissionId, currentDir, umask, setUmask, env, setEnv, prompt, setHistory,
    suUserOverride,
  });

  // ── Ejecutor principal (extraído a useRunCommand) ────────────────
  const runCommand = useRunCommand({
    pendingSu, handleSuPassword,
    pendingPython, handlePythonInput,
    ftpSession, runFtpCommand, startFtpSession,
    sshSession, runSshPassword, startSshSession,
    rdpSession, runRdpInput, startRdpSession,
    busy, setBusy, setHistory, setInput, setHistIdx, setCmdHistory, cmdHistory,
    prompt, checkMissionCompletion, sessionDeps, processDeps, executor,
    setMsfState, setPsState, onCredentialsFound, onVerifyCredentials, onChangeMachine,
    pushIdentity, handleDownloadedFile, onMissionComplete, onExitTerminal,
    inputRef,
  });

  // ── Ctrl+C sobre un listener: limpiar también el store ───────────
  const cancelListening = (port: number | null) => {
    setListeningPort(port);
    useScenarioStore.getState().setListeningPort(port);
  };

  // ── Wrapper: resetear también el executor al salir de MSF ────────
  // Invariante: las mutaciones non-null del estado MSF local vienen solo
  // de los comandos, que ya actualizan el closure del executor; los
  // shortcuts (Ctrl+D) solo limpian (null), por eso basta sincronizar
  // ese caso. No introducir mutaciones non-null externas al executor.
  const handleSetMsfState = (state: MsfState | null) => {
    setMsfState(state);
    if (state === null) {
      executor.resetMsfState();
    }
  };

  // ── Nano save ────────────────────────────────────────────────────
  const { handleNanoSave: nanoSave } = useNanoSave({ machine, currentDir, suUser: suUserOverride });
  const handleNanoSave = (content: string, filenameToSave?: string) =>
    nanoSave(nanoFile, content, filenameToSave);

  // ── Ctrl+C cancela un input() pendiente (KeyboardInterrupt) ──────
  const handleCancelPython = () => {
    setPendingPython(null);
    setHistory(prev => [...prev, {
      command: null,
      output: '^C\nKeyboardInterrupt',
      streaming: false,
      prompt: basePrompt,
      timestamp: Date.now(),
    }]);
  };

  // ── Keyboard shortcuts ───────────────────────────────────────────
  const { showSuggestions, suggestions, suggestionIdx, handleKeyDown, setShowSuggestions, setSuggestions, setSuggestionIdx } = useKeyboardShortcuts({
    input, setInput, machine, currentDir, msfState,
    cmdHistory, setCmdHistory, histIdx, setHistIdx,
    busy, setBusy, blockingCommand, setBlockingCommand,
    setListeningPort: cancelListening, setHistory, prompt, runCommand,
    makeWelcome, allMachines, goHome, setMsfState: handleSetMsfState,
    pendingPythonCancel: pendingPython ? handleCancelPython : null,
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
    ftpSession, sshSession, rdpSession, isMsfActive: executor.isMsfActive,
    isPsActive: executor.isPsActive,
    blockingCommand, msfState, psState, nanoFile,
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
