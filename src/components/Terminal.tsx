// ── components/Terminal.tsx ───────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import {
  executeCommand, isMsfActive, getMsfPrompt, resetMsfState,
  isShellSessionActive, getShellPrompt, resetShellManager,
  startShellSession
} from '../commands';
import { getAutocompleteSuggestions } from '../utils/autocomplete';
import { validateMission } from '../utils/labValidator';
import { AutocompletePanel } from './AutocompletePanel';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { StreamingOutput } from './StreamingOutput';
import { renderKaliPrompt, renderKaliPromptSymbol, isMsfPromptText } from './TerminalPrompt';
import { useTerminalIdentity, getShortPath } from '../hooks/useTerminalIdentity';

interface Props {
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

const promptColors = {
  user: '#7fffd4',
  at: '#7fffd4',
  host: '#7fffd4',
  colon: '#ffffff',
  path: '#ffffff',
  symbol: '#7fffd4',
  bracket: '#0000ff',
  line: '#0000ff',
};

export function Terminal({
  scenarioId, machine, allMachines, currentMissionId,
  onMissionComplete, onChangeMachine, onCredentialsFound,
  onVerifyCredentials, onFailedUser, onSudoPrivileges,
  termColor = '#10b981'
}: Props) {
  const color = termColor;
  const msfState = useScenarioStore(state => state.msfState);
  const setMsfState = useScenarioStore(state => state.setMsfState);
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability);
  const setListeningPort = useScenarioStore(state => state.setListeningPort) || (() => {});
  const listeningPort = useScenarioStore(state => state.listeningPort);
  const currentDir = useScenarioStore(state => state.currentDir);
  const setCurrentDir = useScenarioStore(state => state.setCurrentDir);
  const goHome = useScenarioStore(state => state.goHome);
  const blockingCommand = useScenarioStore(state => state.blockingCommand);
  const setBlockingCommand = useScenarioStore(state => state.setBlockingCommand);
  const ftpSession = useScenarioStore(state => state.ftpSession);
  const setFtpSession = useScenarioStore(state => state.setFtpSession);
  const sshSession = useScenarioStore(state => state.sshSession);
  const setSshSession = useScenarioStore(state => state.setSshSession);
  const language = useScenarioStore(state => state.language);

  const { sshUser, isRoot } = useTerminalIdentity(machine);
  const displayPath = getShortPath(currentDir || '/', isRoot);

  const basePrompt = machine.id === 'attacker-01'
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

  const prompt = isMsfActive()
    ? (getMsfPrompt() || 'msf6 >')
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

  useEffect(() => {
    if (!busy || (busy && blockingCommand)) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [busy, blockingCommand]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, busy, input]);

  useEffect(() => {
    setHistory([makeWelcome(allMachines)]);
    setCmdHistory([]); setHistIdx(-1); setInput(''); setBusy(false);
    setBlockingCommand(null);
    setListeningPort(null);
    resetShellManager();
    setFtpSession(null);
    setSshSession(null);
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [scenarioId, allMachines.length]);

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

  useEffect(() => {
    if (blockingCommand?.connected && busy) {
      const victimMachine = allMachines.find(m => m.id !== 'attacker-01');
      setHistory(prev => [...prev, {
        command: null,
        output: [
          `connect to [${allMachines.find(m => m.id === 'attacker-01')?.machine_info.ip || '...'}] from (UNKNOWN) [${victimMachine?.machine_info.ip || '...'}] ${listeningPort}`,
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
  }, [blockingCommand?.connected, busy, allMachines, listeningPort, prompt, setBlockingCommand, setListeningPort, onChangeMachine, setCurrentDir]);

  // Auto-refresh effect for top/htop commands - updates display every second
  useEffect(() => {
    if (busy && blockingCommand?.cancelKey === 'q' && blockingCommand?.clearScreen) {
      // This is 'top' or 'htop' - refresh every second
      const cmdName = blockingCommand?.message?.includes('htop') ? 'htop' : 'top';
      const refreshInterval = setInterval(() => {
        // Regenerate output with new random values
        const result = executeCommand(cmdName, machine, allMachines, currentMissionId, undefined, currentDir);
        if (!result.isError && result.output) {
          // Replace the last history entry if it's from top/htop, otherwise add new
          setHistory(prev => {
            const lastEntry = prev[prev.length - 1];
            const isTopHtopEntry = lastEntry && 
              lastEntry.command === null && 
              (lastEntry.output?.includes('top -') || lastEntry.output?.includes('CPU0 ['));
            if (isTopHtopEntry) {
              // Replace last entry
              return [...prev.slice(0, -1), {
                command: null,
                output: result.output,
                streaming: false,
                prompt,
                timestamp: Date.now()
              }];
            }
            // Add new entry
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
    // Legacy support: command explicitly set completedMissionId
    if (result.completedMissionId) {
      onMissionComplete(result.completedMissionId);
    }
    
    // ── Universal Lab Validation ─────────────────────────────────────────
    // Free commands report metadata - the lab validates based on mission criteria
    const { missions } = useScenarioStore.getState();
    const activeMission = missions.find(m => m.status === 'active');
    
    if (activeMission && activeMission.validationCriteria) {
      const shouldComplete = validateMission(result, activeMission);
      if (shouldComplete) {
        onMissionComplete(activeMission.id);
      }
    }
    
    if (result.blockingCommand) {
      setBlockingCommand(result.blockingCommand);
      if (result.blockingCommand.listeningPort) {
        setListeningPort(result.blockingCommand.listeningPort);
      }
      // Clear screen if requested (e.g., for top)
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

  const handleDownloadedFile = (result: any, currentPrompt: string, sourceFtpSession?: typeof ftpSession) => {
    if (!result.downloadedFile) return;
    const attacker = allMachines.find(m => m.id === 'attacker-01');
    if (!attacker) return;
    const { addFileToMachine } = useScenarioStore.getState();
    let filePath = result.downloadedFile.path;
    if (filePath.includes('nota.txt') || filePath.includes('note.txt')) {
      const fileName = filePath.split('/').pop() || '';
      filePath = `/root/${fileName}`;
    }
    addFileToMachine('attacker-01', {
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

    // ── FTP session active ──
    if (ftpSession?.active) {
      const result = executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);
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
      if (result.completedMissionId) {
        onMissionComplete(result.completedMissionId);
      }
      // ── Universal Lab Validation for FTP ──
      const { missions } = useScenarioStore.getState();
      const activeMission = missions.find(m => m.status === 'active');
      if (activeMission && activeMission.validationCriteria) {
        const shouldComplete = validateMission(result, activeMission);
        if (shouldComplete) {
          onMissionComplete(activeMission.id);
        }
      }
      if (result.downloadedFile) {
        const attacker = allMachines.find(m => m.id === 'attacker-01');
        if (attacker) {
          const { addFileToMachine } = useScenarioStore.getState();
          let filePath = result.downloadedFile.path;
          if (filePath.includes('nota.txt') || filePath.includes('note.txt')) {
            const fileName = filePath.split('/').pop() || '';
            filePath = `/root/${fileName}`;
          }
          addFileToMachine('attacker-01', {
            path: filePath,
            content: result.downloadedFile.content || '',
            type: result.downloadedFile.type || 'text'
          });
          const fileName = filePath.split('/').pop();
          setHistory(prev => [...prev, {
            command: null,
            output: language === 'es' ? `Archivo descargado: ${fileName}` : `File downloaded: ${fileName}`,
            streaming: false,
            prompt: ftpSession?.active ? getFtpPrompt() : (getShellPrompt() || 'ftp> '),
            timestamp: Date.now()
          }]);
        }
      }
      return;
    }

    // ── SSH session active (waiting for password) ──
    if (sshSession?.active && sshSession.step === 'password') {
      const result = executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);
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
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);

      // ── Universal Lab Validation for SSH ──
      const { missions } = useScenarioStore.getState();
      const activeMission = missions.find(m => m.status === 'active');
      if (activeMission && activeMission.validationCriteria) {
        const shouldComplete = validateMission(result, activeMission);
        if (shouldComplete) {
          onMissionComplete(activeMission.id);
        }
      }

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

    const result = executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir, undefined, language);

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
        addFileToMachine('attacker-01', {
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

    // ── SSH session started ──
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
        // Reset store state - ScenarioLauncher will handle redirect to /labs
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

  return (
    <div className="flex flex-col h-full bg-gray-950 font-mono" onClick={() => !busy && inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800 select-none flex-shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gray-800 border border-gray-700">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{renderKaliPrompt(prompt, promptColors)}</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {busy
            ? <><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} /><span className="text-xs font-mono" style={{ color }}>running…</span></>
            : <><div className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.6 }} /><span className="text-xs font-mono" style={{ color, opacity: 0.5 }}>ready</span></>
          }
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 cursor-text bg-gray-950"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <div key={entry.timestamp + i} className="space-y-0.5" style={{ animation: 'fadeInEntry 0.12s ease-out' }}>
            {entry.command !== null && (
              <div className="flex flex-col gap-0.5">
                {entry.prompt?.includes('ftp') || entry.prompt?.includes('Name') || entry.prompt?.includes('Password') || entry.prompt?.includes("'s password") ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                      {entry.prompt?.trim() === 'ftp>' ? 'ftp> ' : entry.prompt}
                    </span>
                    <span className="text-sm" style={{ color }}>{entry.command}</span>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(entry.prompt || prompt, promptColors)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(entry.prompt, isRoot, promptColors)}</span>
                      <span className="text-sm" style={{ color }}>{entry.command}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            {entry.streaming && entry.lines
              ? <StreamingOutput lines={entry.lines} color={color} delays={entry.lineDelays} />
              : <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: entry.command === null ? color + '99' : color }}>
                  {entry.output}
                </pre>
            }
          </div>
        ))}

        {!busy && !blockingCommand && (
          <div className="relative">
            {ftpSession?.active ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                  {prompt?.trim() === 'ftp>' ? 'ftp> ' : prompt}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                  style={{ color, caretColor: color, minWidth: '50px' }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            ) : sshSession?.active ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0" style={{ color }}>
                  {prompt}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                  style={{ color, caretColor: color, minWidth: '50px' }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            ) : isMsfActive() ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color, caretColor: color }}
                  autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(undefined, isRoot, promptColors)}</span>
                  <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color, caretColor: color }}
                    autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
                </div>
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <AutocompletePanel
                suggestions={suggestions}
                selectedIndex={suggestionIdx}
                onSelect={(suggestion) => {
                  const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);
                  const textBeforeCursor = input.slice(0, result.replaceStart);
                  setInput(textBeforeCursor + suggestion);
                  setShowSuggestions(false);
                  setSuggestions([]);
                  setSuggestionIdx(-1);
                  inputRef.current?.focus();
                }}
                termColor={color}
              />
            )}
          </div>
        )}
        {busy && blockingCommand && (
          <>
            <div className="flex items-center gap-2 bg-blue-900/20 py-1 px-2 rounded -ml-2 border-l-2 border-blue-500">
              <span className="font-bold text-xs flex-shrink-0" style={{ color }}>⏳ </span>
              <span className="text-xs font-mono" style={{ color }}>{blockingCommand.message}</span>
            </div>
            <input ref={inputRef} type="text" value={''} onChange={() => {}}
              onKeyDown={handleKeyDown}
              className="opacity-0 w-[1px] h-[1px] p-0 border-none outline-none"
              autoFocus spellCheck={false} autoComplete="off" />
          </>
        )}
        {busy && !blockingCommand && (
          <>
            <div className="flex flex-col gap-0.5 opacity-40">
              <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt, promptColors)}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(undefined, isRoot, promptColors)}</span>
                <span className="text-sm animate-pulse">_</span>
              </div>
            </div>
            <input ref={inputRef} type="text" value={''} onChange={() => {}}
              onKeyDown={handleKeyDown}
              className="opacity-0 w-[1px] h-[1px] p-0 border-none outline-none"
              autoFocus spellCheck={false} autoComplete="off" />
          </>
        )}
      </div>
      <style>{`@keyframes fadeInEntry{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
