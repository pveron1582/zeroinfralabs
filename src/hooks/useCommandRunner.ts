// ── hooks/useCommandRunner.ts ──────────────────────────────────────
// Hook que encapsula toda la lógica de la terminal (estado, comandos, sesiones)
// Separado del render para poder reutilizarlo con diferentes UIs

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Machine, FileEntry } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import {
  isShellSessionActive, getShellPrompt, resetShellManager,
  startShellSession, createIsolatedExecutor, type IsolatedExecutor, type MsfState
} from '../commands';
import { getAutocompleteSuggestions } from '../utils/autocomplete';
import { validateMission } from '../utils/labValidator';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useTerminalIdentity, getShortPath } from './useTerminalIdentity';

export interface CommandRunnerProps {
  scenarioId: string;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  onMissionComplete: (id: number) => void;
  onChangeMachine: (id: string) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file: string, service?: string) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  onFailedUser?: (machineId: string, user: string) => void;
  onSudoPrivileges?: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  termColor?: string;
}

interface HistoryEntry {
  command: string | null;
  output?: string;
  lines?: string[];
  streaming: boolean;
  prompt?: string;
  timestamp: number;
  result?: any;
  lineDelays?: number[];
}

const CMD_DELAYS: Record<string, { lineDelay: number; minTotal: number }> = {
  'arp-scan': { lineDelay: 55, minTotal: 800  },
  'nmap':     { lineDelay: 70, minTotal: 1200 },
  'gobuster': { lineDelay: 40, minTotal: 1500 },
  'hydra':    { lineDelay: 50, minTotal: 2000 },
  'ssh':      { lineDelay: 0,  minTotal: 500  },
  'default':  { lineDelay: 0,  minTotal: 0    },
};

export function useCommandRunner({
  scenarioId, machine, allMachines, currentMissionId,
  onMissionComplete, onChangeMachine, onCredentialsFound,
  onVerifyCredentials, onFailedUser, onSudoPrivileges,
  termColor = '#10b981'
}: CommandRunnerProps) {
  const color = termColor;

  // ── Per-instance state (local, no compartido entre terminales) ──
  const [msfState, setMsfState] = useState<MsfState | null>(null);
  const [currentDir, setCurrentDir] = useState('/');
  const [blockingCommand, setBlockingCommand] = useState<any>(null);
  const [listeningPort, setListeningPort] = useState<number | null>(null);
  const [ftpSession, setFtpSession] = useState<any>(null);
  const [sshSession, setSshSession] = useState<any>(null);

  // ── Executor aislado (msfState propio, no contamina otras terminales) ──
  const executor = useMemo(() => createIsolatedExecutor(), []);

  // ── Estado compartido (game-logic, config) ──
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability);
  const language = useScenarioStore(state => state.language);
  const attackerMachineId = useScenarioStore(state => state.currentScenario.initialMachineId);
  const goHome = useScenarioStore(state => state.goHome);

  const { sshUser, isRoot } = useTerminalIdentity(machine);
  const displayPath = getShortPath(currentDir || '/', isRoot);

  const basePrompt = machine.id === attackerMachineId
    ? `root@${machine.machine_info.hostname}:${displayPath}#`
    : `${sshUser}@${machine.machine_info.hostname}:${displayPath}${isRoot ? '#' : '$'}`;

  const getFtpPrompt = (): string => {
    if (!ftpSession?.active) return '';
    switch (ftpSession.step) {
      case 'username': return `Name (${ftpSession.targetIp}:root): `;
      case 'password': return 'Password: ';
      case 'connected':
      default: return 'ftp> ';
    }
  };

  const getSshPrompt = (): string => {
    if (!sshSession?.active) return '';
    if (sshSession.step === 'password') {
      return `${sshSession.username}@${sshSession.targetIp}'s password: `;
    }
    return '';
  };

  const prompt = executor.isMsfActive()
    ? (executor.getMsfPrompt() || 'msf6 >')
    : ftpSession?.active
      ? (getFtpPrompt() || 'ftp> ')
      : sshSession?.active
        ? (getSshPrompt() || '')
        : basePrompt;

  const makeWelcome = (machines: Machine[]): HistoryEntry => ({
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

  const ftpSessionRef = useRef(ftpSession);
  useEffect(() => {
    ftpSessionRef.current = ftpSession;
  }, [ftpSession]);

  // Auto-focus when not busy
  useEffect(() => {
    if (!busy || (busy && blockingCommand)) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [busy, blockingCommand]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, busy, input]);

  // Reset state when scenario changes
  useEffect(() => {
    setHistory([makeWelcome(allMachines)]);
    setCmdHistory([]); setHistIdx(-1); setInput(''); setBusy(false);
    setBlockingCommand(null);
    setListeningPort(null);
    setMsfState(null);
    executor.resetMsfState();
    setFtpSession(null);
    setSshSession(null);
    resetShellManager();
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [scenarioId, allMachines.length]);

  // Window focus handler
  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    const handleWindowFocus = () => {
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [busy, blockingCommand, scenarioId]);

  // Blocking command connected (reverse shell)
  useEffect(() => {
    if (blockingCommand?.connected && busy) {
      const victimMachine = allMachines.find(m => m.id !== attackerMachineId);
      setHistory(prev => [...prev, {
        command: null,
        output: [
          `connect to [${allMachines.find(m => m.id === attackerMachineId)?.machine_info.ip || '...'}] from (UNKNOWN) [${victimMachine?.machine_info.ip || '...'}] ${listeningPort}`,
          `/bin/sh: 0: can't access tty; job control turned off`,
          `${victimMachine?.id.includes('lfi') ? 'www-data' : 'admin'}@${victimMachine?.machine_info.hostname || 'target'}:/var/www/html$ `,
        ].join('\n'),
        streaming: false,
        prompt,
        timestamp: Date.now()
      }]);
      setBlockingCommand(null);
      setBusy(false);
      setListeningPort(null);
      if (victimMachine) {
        onChangeMachine(victimMachine.id);
        setCurrentDir('/var/www/html/');
      }
    }
  }, [blockingCommand?.connected, busy, allMachines, listeningPort, prompt, setBlockingCommand, setListeningPort, onChangeMachine, setCurrentDir, attackerMachineId]);

  // Auto-refresh for top/htop
  useEffect(() => {
    if (busy && blockingCommand?.cancelKey === 'q' && blockingCommand?.clearScreen) {
      const cmdName = blockingCommand?.message?.includes('htop') ? 'htop' : 'top';
      const refreshInterval = setInterval(() => {
        const result = executor.executeCommand(cmdName, machine, allMachines, currentMissionId, undefined, currentDir);
        if (!result.isError && result.output) {
          setHistory(prev => {
            const lastEntry = prev[prev.length - 1];
            const isTopHtopEntry = lastEntry && 
              lastEntry.command === null && 
              (lastEntry.output?.includes('top -') || lastEntry.output?.includes('CPU0 ['));
            if (isTopHtopEntry) {
              return [...prev.slice(0, -1), {
                command: null,
                output: result.output,
                streaming: false,
                prompt,
                timestamp: Date.now()
              }];
            }
            return [...prev, {
              command: null,
              output: result.output,
              streaming: false,
              prompt,
              timestamp: Date.now()
            }];
          });
        }
      }, 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [busy, blockingCommand, machine, allMachines, currentMissionId, currentDir, prompt]);

  const processCommandResult = (result: any, trimmed: string, currentPrompt: string, isStreaming: boolean) => {
    if (result.completedMissionId) {
      onMissionComplete(result.completedMissionId);
    }

    checkMissionCompletion(result);

    if (result.blockingCommand) {
      setBlockingCommand(result.blockingCommand);
      if (result.blockingCommand.listeningPort) {
        setListeningPort(result.blockingCommand.listeningPort);
      }
      if (result.blockingCommand.clearScreen) {
        setHistory([]);
      }
      if (!isStreaming) setBusy(true);
    }
    if (result.foundCredentials) onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file, result.foundCredentials.service);
    if (result.newMachineId) onChangeMachine(result.newMachineId);
    if (result.sshLoginUser) setCurrentDir(`/home/${result.sshLoginUser}`);
    if (result.privescCompleted) useScenarioStore.getState().setPrivescCompleted(result.privescCompleted);
    if (result.failedUser && onFailedUser) onFailedUser(result.failedUser.machineId, result.failedUser.user);
    if (result.sudoPrivileges && onSudoPrivileges) {
      onSudoPrivileges(result.sudoPrivileges.machineId, result.sudoPrivileges.user, result.sudoPrivileges.commands, result.sudoPrivileges.canSudo);
    }
    if (result.foundVulnerability) reportVulnerability(result.foundVulnerability.machineId, result.foundVulnerability.vulnId, result.foundVulnerability.status);
    if (result.newMachineId && result.foundCredentials && onVerifyCredentials) {
      onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
    }
    if (result.sshSessionClosed) {
      setCurrentDir('/root/');
    }
    if (result.possibleUsers) {
      const target = allMachines.find(m => m.id === result.possibleUsers.machineId);
      if (target) {
        useScenarioStore.getState().setPossibleUsers(target.id, result.possibleUsers.users);
      }
    }
    if (result.createdFiles && result.createdFiles.length > 0) {
      const attacker = allMachines.find(m => m.machine_info.type === 'workstation' || m.machine_info.hostname?.toLowerCase().includes('kali'));
      if (attacker) {
        const { addFileToMachine } = useScenarioStore.getState();
        result.createdFiles.forEach((f: FileEntry) => addFileToMachine(attacker.id, f));
      }
    }
  };

  const checkMissionCompletion = (result: any) => {
    const { missions } = useScenarioStore.getState();
    const activeMission = missions.find(m => m.status === 'active');
    if (activeMission?.validationCriteria && validateMission(result, activeMission)) {
      onMissionComplete(activeMission.id);
    }
  };

  const handleDownloadedFile = (result: any, currentPrompt: string, sourceFtpSession?: typeof ftpSession) => {
    if (!result.downloadedFile) return;
    const attacker = allMachines.find(m => m.id === attackerMachineId);
    if (!attacker) return;
    const { addFileToMachine } = useScenarioStore.getState();
    let filePath = result.downloadedFile.path;
    if (filePath.includes('nota.txt') || filePath.includes('note.txt')) {
      const fileName = filePath.split('/').pop() || '';
      filePath = `/root/${fileName}`;
    }
    addFileToMachine(attackerMachineId, {
      path: filePath,
      content: result.downloadedFile.content || '',
      type: result.downloadedFile.type || 'text'
    });
    const fileName = filePath.split('/').pop();
    setHistory(prev => [...prev, {
      command: null,
      output: language === 'es' ? `Archivo descargado: ${fileName}` : `File downloaded: ${fileName}`,
      streaming: false,
      prompt: sourceFtpSession?.active ? getFtpPrompt() : (getShellPrompt() || 'ftp> '),
      timestamp: Date.now()
    }]);
  };

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if ((!trimmed && !ftpSession?.active && !sshSession?.active) || busy) return;
    setCmdHistory(prev => [trimmed, ...prev]);
    setInput(''); setHistIdx(-1);
    const currentPrompt = prompt;

    // FTP session active
    if (ftpSession?.active) {
      const result = executor.executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);
      if (result.ftpSession) {
        setFtpSession(result.ftpSession.active ? {
          active: result.ftpSession.active,
          targetIp: result.ftpSession.targetIp,
          targetId: result.ftpSession.targetId,
          username: result.ftpSession.username,
          loggedIn: result.ftpSession.loggedIn,
          step: result.ftpSession.step || 'connected'
        } : null);
      }
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      checkMissionCompletion(result);
      handleDownloadedFile(result, currentPrompt, ftpSession);
      return;
    }

    // SSH session active (waiting for password)
    if (sshSession?.active && sshSession.step === 'password') {
      const result = executor.executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);
      if (result.sshSession) {
        setSshSession(result.sshSession.active ? {
          active: result.sshSession.active,
          targetIp: result.sshSession.targetIp,
          targetId: result.sshSession.targetId,
          username: result.sshSession.username,
          authenticated: result.sshSession.authenticated,
          step: result.sshSession.step || 'password'
        } : null);
      }
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      checkMissionCompletion(result);

      if (result.foundCredentials) {
        onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file, result.foundCredentials.service);
        onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
      }
      if (result.newMachineId) onChangeMachine(result.newMachineId);
      if (result.sshLoginUser) {
        setCurrentDir(result.sshLoginUser === 'root' ? '/root' : `/home/${result.sshLoginUser}`);
      }
      if (result.sshSessionClosed || !result.sshSession?.active) {
        setSshSession(null);
      }
      return;
    }

    if (!isRoot && (trimmed === 'cd /root' || trimmed.includes('/root/'))) {
      setHistory(prev => [...prev, { command: trimmed, output: 'Permission denied: you do not have access to /root.\nTry escalating privileges first.', streaming: false, prompt: currentPrompt, timestamp: Date.now() }]);
      return;
    }

    const result = executor.executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);

    if (result.ftpSession?.connected && !ftpSession?.active) {
      const targetIp = result.ftpSession.targetIp;
      if (targetIp && !isShellSessionActive()) {
        startShellSession('ftp', [targetIp], {
          machine,
          allMachines,
          currentMissionId,
          currentDir,
          setCurrentDir,
          language
        });
      }
      setFtpSession({
        active: true,
        targetIp: result.ftpSession.targetIp,
        targetId: result.ftpSession.targetId,
        username: undefined,
        loggedIn: false,
        step: 'username'
      });
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      if (result.downloadedFile) {
        const { addFileToMachine } = useScenarioStore.getState();
        addFileToMachine(attackerMachineId, {
          path: result.downloadedFile.path,
          content: result.downloadedFile.content || '',
          type: 'text'
        });
        setHistory(prev => [...prev, {
          command: null,
          output: `Archivo descargado: ${result.downloadedFile?.path}`,
          streaming: false,
          prompt: currentPrompt,
          timestamp: Date.now()
        }]);
      }
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);
      return;
    }

    if (result.downloadedFile) {
      handleDownloadedFile(result, currentPrompt, ftpSession);
    }

    // SSH session started
    if (result.sshSession?.active && !sshSession?.active) {
      setSshSession({
        active: true,
        targetIp: result.sshSession.targetIp,
        targetId: result.sshSession.targetId,
        username: result.sshSession.username,
        authenticated: result.sshSession.authenticated,
        step: result.sshSession.step || 'password'
      });
      setHistory(prev => [...prev, {
        command: trimmed,
        output: result.output,
        streaming: false,
        prompt: currentPrompt,
        timestamp: Date.now()
      }]);
      return;
    }

    if (result.output === 'CLEAR_TERMINAL') { setHistory([]); return; }
    if (result.output === 'EXIT_TO_LANDING') {
      const state = useScenarioStore.getState();
      const allComplete = state.missions.length > 0 && state.missions.every(m => m.status === 'completed');
      if (allComplete) {
        state.triggerSurvey(state.currentScenario);
      } else {
        useScenarioStore.setState({
          view: 'landing',
          showNetworkMap: false,
          hasNewNetworkInfo: false,
          notification: null,
          browserCurrentUrl: 'https://www.google.com',
          browserIsLoggedIn: false,
          browserNavHistory: ['https://www.google.com'],
          browserNavIdx: 0,
          listeningPort: null,
          msfState: null,
          showSurvey: false,
          pendingSurveyScenario: null,
          showCompletionOverlay: false,
          _prevMachinesSnapshot: [],
        });
      }
      return;
    }

    const cmdName = trimmed.split(/\s+/)[0].toLowerCase();
    const cfg = CMD_DELAYS[cmdName] || CMD_DELAYS['default'];
    const customDelays = result.streamingLineDelays;
    const useStreaming = cfg.minTotal > 0 || (customDelays && customDelays.length > 0);

    if (!useStreaming) {
      setHistory(prev => [...prev, { command: trimmed, output: result.output, streaming: false, prompt: currentPrompt, timestamp: Date.now() }]);
      processCommandResult(result, trimmed, currentPrompt, false);
      return;
    }

    const entryTs = Date.now();
    setBusy(true);
    const lines = (result.output as string).split('\n');
    const totalDelay = customDelays
      ? customDelays.reduce((a, b) => a + b, 0)
      : Math.max(cfg.minTotal, lines.length * 42 + 200);
    setHistory(prev => [...prev, { command: trimmed, streaming: true, lines, prompt: currentPrompt, timestamp: entryTs, result, lineDelays: customDelays }]);

    setTimeout(() => {
      setBusy(false);
      processCommandResult(result, trimmed, currentPrompt, true);
      setHistory(prev => prev.map(e =>
        e.timestamp === entryTs ? { ...e, streaming: false, output: result.output } : e
      ));
      setTimeout(() => inputRef.current?.focus(), 60);
    }, totalDelay);
  };

  const { showSuggestions, suggestions, suggestionIdx, handleKeyDown, setShowSuggestions, setSuggestions, setSuggestionIdx } = useKeyboardShortcuts({
    input, setInput, machine, currentDir, msfState,
    cmdHistory, setCmdHistory, histIdx, setHistIdx,
    busy, setBusy, blockingCommand, setBlockingCommand,
    setListeningPort, setHistory, prompt, runCommand,
    makeWelcome, allMachines, goHome, setMsfState,
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
    blockingCommand, msfState,
    // Props passthrough (needed by Terminal render)
    machine, currentDir,
    // Actions
    handleKeyDown, runCommand, setHistory,
    makeWelcome,
    // Autocomplete  
    showSuggestions, suggestions, suggestionIdx,
    setShowSuggestions, setSuggestions, setSuggestionIdx,
  };
}