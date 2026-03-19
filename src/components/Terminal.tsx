// ── components/Terminal.tsx ───────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { executeCommand, isMsfActive, getMsfPrompt } from '../commands';

interface Props {
  scenarioId: string;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  onMissionComplete: (id: number) => void;
  onChangeMachine: (id: string) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file: string) => void;
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
}

const CMD_DELAYS: Record<string, { lineDelay: number; minTotal: number }> = {
  'arp-scan': { lineDelay: 55, minTotal: 800  },
  'nmap':     { lineDelay: 70, minTotal: 1200 },
  'gobuster': { lineDelay: 40, minTotal: 1500 },
  'hydra':    { lineDelay: 50, minTotal: 2000 },
  'ssh':      { lineDelay: 0,  minTotal: 500  },
  'default':  { lineDelay: 0,  minTotal: 0    },
};

function StreamingOutput({ lines, color }: { lines: string[]; color: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown(s => s + 1), 38 + Math.random() * 30);
    return () => clearTimeout(t);
  }, [shown, lines.length]);
  return (
    <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color }}>
      {lines.slice(0, shown).join('\n')}
    </pre>
  );
}

export function Terminal({
  scenarioId, machine, allMachines, currentMissionId,
  onMissionComplete, onChangeMachine, onCredentialsFound,
  termColor = '#10b981'
}: Props) {
  const color = termColor;
  const setMsfState = useScenarioStore(state => state.setMsfState);

  const makeWelcome = (machines: Machine[]): HistoryEntry => {
    const atk = machines.find(m => m.id === 'attacker-01');
    return {
      command: null, streaming: false,
      output: `ZeroInfra Labs Terminal v2.0.0\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSistema: ${atk?.machine_info.os || 'Kali Linux'}\nIP:      ${atk?.machine_info.ip || '—'}\n\nEscribe 'help' para ver los comandos disponibles.`,
      timestamp: Date.now()
    };
  };

  const [history, setHistory]       = useState<HistoryEntry[]>([makeWelcome(allMachines)]);
  const [input, setInput]           = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [busy, setBusy]             = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const sshUser = (machine.found_credentials as any)?.user
    || machine.scan_results?.ports?.find((p: any) => p.service === 'ssh')?.credentials?.user
    || 'user';
  const isRoot = sshUser === 'root' || machine.id === 'attacker-01';
  const basePrompt = machine.id === 'attacker-01'
    ? `root@${machine.machine_info.hostname}:~#`
    : `${sshUser}@${machine.machine_info.hostname}:~${isRoot ? '#' : '$'}`;
  // Show msf6 prompt when inside a Metasploit session
  const prompt = isMsfActive() ? (getMsfPrompt() || 'msf6 >') : basePrompt;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    setHistory([makeWelcome(allMachines)]);
    setCmdHistory([]); setHistIdx(-1); setInput(''); setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [scenarioId]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || busy) return;
    setCmdHistory(prev => [trimmed, ...prev]);
    setInput(''); setHistIdx(-1);

    const result = executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState);
    if (result.output === 'CLEAR_TERMINAL') { setHistory([]); return; }

    const cmdName = trimmed.split(/\s+/)[0].toLowerCase();
    const cfg = CMD_DELAYS[cmdName] || CMD_DELAYS['default'];
    const useStreaming = cfg.minTotal > 0;

    if (!useStreaming) {
      setHistory(prev => [...prev, { command: trimmed, output: result.output, streaming: false, prompt, timestamp: Date.now() }]);
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);
      if (result.foundCredentials)   onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file);
      if (result.newMachineId)       onChangeMachine(result.newMachineId);
      return;
    }

    const entryTs = Date.now();
    setBusy(true);
    const lines = (result.output as string).split('\n');
    const totalDelay = Math.max(cfg.minTotal, lines.length * 42 + 200);

    setHistory(prev => [...prev, { command: trimmed, streaming: true, lines, prompt, timestamp: entryTs, result }]);

    setTimeout(() => {
      setBusy(false);
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);
      if (result.foundCredentials)   onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file);
      if (result.newMachineId)       onChangeMachine(result.newMachineId);
      setHistory(prev => prev.map(e =>
        e.timestamp === entryTs ? { ...e, streaming: false, output: result.output } : e
      ));
      setTimeout(() => inputRef.current?.focus(), 60);
    }, totalDelay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); runCommand(input); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) { const i = histIdx + 1; setHistIdx(i); setInput(cmdHistory[i]); }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { const i = histIdx - 1; setHistIdx(i); setInput(cmdHistory[i]); }
      else { setHistIdx(-1); setInput(''); }
    }
  };

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
          <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{prompt}</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {busy
            ? <><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} /><span className="text-xs font-mono" style={{ color }}>running…</span></>
            : <><div className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.6 }} /><span className="text-xs font-mono" style={{ color, opacity: 0.5 }}>ready</span></>
          }
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
        {history.map((entry, i) => (
          <div key={entry.timestamp + i} className="space-y-0.5" style={{ animation: 'fadeInEntry 0.12s ease-out' }}>
            {entry.command !== null && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs flex-shrink-0" style={{ color }}>{entry.prompt || prompt}</span>
                <span className="text-sm" style={{ color }}>{entry.command}</span>
              </div>
            )}
            {entry.streaming && entry.lines
              ? <StreamingOutput lines={entry.lines} color={color} />
              : <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: entry.command === null ? color + '99' : color }}>
                  {entry.output}
                </pre>
            }
          </div>
        ))}

        {!busy && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs flex-shrink-0" style={{ color }}>{prompt}</span>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{ color, caretColor: color }}
              autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
          </div>
        )}
        {busy && (
          <div className="flex items-center gap-2 opacity-40">
            <span className="font-bold text-xs flex-shrink-0" style={{ color }}>{prompt}</span>
            <span className="text-xs animate-pulse" style={{ color }}>▌</span>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeInEntry{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
