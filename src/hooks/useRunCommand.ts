// ── hooks/useRunCommand.ts ─────────────────────────────────────────
// Orquesta la ejecución de un comando en la terminal: routing por sesión
// (su pendiente / FTP / SSH / comando normal) y streaming línea por línea.
// Extraído de useCommandRunner.ts para mantenerlo <300 líneas.

import type { CommandResponse, FtpSessionData, SshSessionData } from '../types';
import type { IsolatedExecutor, MsfState } from '../commands';
import type { HistoryEntry, ProcessDeps } from './processCommandResult';
import { processCommandResult } from './processCommandResult';
import type { SessionRunnerDeps, SessionRunResult } from './useFtpSession';
import { getFtpPromptFor } from './useFtpSession';
import type { SshRunResult } from './useSshSession';
import type { PendingSu } from './usePendingSu';
import type { IdentityFrame } from './useIdentityStack';
import { useScenarioStore } from '../store/scenarioStore';
import { getStreamingConfig, computeTotalDelay, shouldStream } from './streamingConfig';

export interface RunCommandDeps {
  pendingSu: PendingSu | null;
  handleSuPassword: (password: string) => CommandResponse | null;
  ftpSession: { active?: boolean } | null;
  runFtpCommand: (cmd: string, deps: SessionRunnerDeps) => SessionRunResult;
  startFtpSession: (s: FtpSessionData, deps: SessionRunnerDeps) => void;
  sshSession: { active?: boolean; step?: string } | null;
  runSshPassword: (password: string, deps: SessionRunnerDeps) => SshRunResult;
  startSshSession: (s: SshSessionData) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  setInput: (v: string) => void;
  setHistIdx: (i: number) => void;
  setCmdHistory: (fn: (prev: string[]) => string[]) => void;
  prompt: string;
  checkMissionCompletion: (result: CommandResponse) => void;
  sessionDeps: SessionRunnerDeps;
  processDeps: ProcessDeps;
  executor: IsolatedExecutor;
  setMsfState: (s: MsfState | null) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  onChangeMachine: (id: string) => void;
  pushIdentity: (frame: IdentityFrame) => void;
  handleDownloadedFile: (result: CommandResponse, fallbackPrompt: () => string) => void;
  onMissionComplete: (id: number) => void;
  onExitTerminal?: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function useRunCommand(deps: RunCommandDeps): (cmd: string) => void {
  const {
    pendingSu, handleSuPassword,
    ftpSession, runFtpCommand, startFtpSession,
    sshSession, runSshPassword, startSshSession,
    busy, setBusy, setHistory, setInput, setHistIdx, setCmdHistory,
    prompt, checkMissionCompletion, sessionDeps, processDeps, executor,
    setMsfState, onCredentialsFound, onVerifyCredentials, onChangeMachine,
    pushIdentity, handleDownloadedFile, onMissionComplete, onExitTerminal,
    inputRef,
  } = deps;

  // ── Ejecutor principal ───────────────────────────────────────────
  return (cmd: string) => {
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
        sessionDeps.setCurrentDir(result.sshLoginUser === 'root' ? '/root' : `/home/${result.sshLoginUser}`);
      }
      return;
    }

    // ── Comando normal ─────────────────────────────────────────────
    const result = executor.executeCommand({
      line: trimmed,
      machine: sessionDeps.machine, allMachines: sessionDeps.allMachines,
      currentMissionId: sessionDeps.currentMissionId, terminalId: sessionDeps.terminalId,
      onMsfStateChange: setMsfState, currentDir: sessionDeps.currentDir,
      setCurrentDir: sessionDeps.setCurrentDir, language: sessionDeps.language,
      umask: sessionDeps.umask, setUmask: sessionDeps.setUmask,
      env: sessionDeps.env, setEnv: sessionDeps.setEnv,
    });

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
}
