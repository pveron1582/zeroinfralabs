// ── components/Terminal.tsx ───────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { executeCommand, isMsfActive, getMsfPrompt, resetMsfState } from '../commands';
import { getAutocompleteSuggestions, findCommonPrefix } from '../utils/autocomplete';

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
  onVerifyCredentials, onFailedUser,
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Identical logic to whoami.ts to accurately display the connected SSH user
  const rceCred = Array.isArray(machine.found_credentials) 
    ? machine.found_credentials.find(c => c.service === 'reverse-shell')
    : null;

  const getSshUser = () => {
    if (machine.id.includes('attacker')) return 'root';
    if (rceCred) return rceCred.user;
    
    if (machine.found_credentials) {
      // Find verified SSH credential
      const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
      if (sshCred) return sshCred.user;
      
      // Fallback: any verified credential
      const verified = machine.found_credentials.find(c => c.verified);
      if (verified) return verified.user;
    }
    
    // Fallback: any available unverified SSH port credential mapping
    const sshPort = machine.scan_results?.ports?.find(p => p.service === 'ssh');
    if (sshPort?.credentials?.user) return sshPort.credentials.user;
    
    return 'user';
  };
  
  const sshUser = getSshUser();
  const isRoot = sshUser === 'root' || machine.id === 'attacker-01';
  
  // Función para obtener la ruta corta del directorio (~/... o /...)
  const getShortPath = (dir: string): string => {
    if (!dir || dir === '/') return '/';
    // Si está en home o subdirectorio de home, mostrar ~/
    if (dir.startsWith('/home/') || dir === '/home') {
      const homeRelative = dir.slice(6); // Quitar '/home/'
      if (!homeRelative || homeRelative === '') return '~';
      return '~/' + homeRelative.replace(/\/$/, ''); // Quitar trailing /
    }
    // Para otros directorios, mostrar ruta completa sin trailing /
    return dir.replace(/\/$/, '') || '/';
  };
  
  const displayPath = getShortPath(currentDir || '/');
  const basePrompt = machine.id === 'attacker-01'
    ? `root@${machine.machine_info.hostname}:${displayPath}#`
    : `${sshUser}@${machine.machine_info.hostname}:${displayPath}${isRoot ? '#' : '$'}`;
  // Show msf6 prompt when inside a Metasploit session
  const prompt = isMsfActive() ? (getMsfPrompt() || 'msf6 >') : basePrompt;
  
  // Kali Linux style prompt colors (verde claro/celeste estilo Kali moderno)
  const promptColors = {
    user: '#7fffd4',      // Verde claro/celeste (aquamarine) para usuario
    at: '#7fffd4',        // Verde claro/celeste (aquamarine) para @
    host: '#7fffd4',      // Verde claro/celeste (aquamarine) para host
    colon: '#ffffff',     // Blanco para :
    path: '#ffffff',      // Blanco para ruta
    symbol: '#7fffd4',    // Verde claro/celeste (aquamarine) para # o $
    bracket: '#0000ff',   // Azul para corchetes y paréntesis
    line: '#0000ff',      // Azul para líneas
  };

  // Enfocar input automáticamente cuando la terminal queda libre o entra en comando bloqueante
  useEffect(() => {
    if (!busy || (busy && blockingCommand)) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [busy, blockingCommand]);

  // Determina si un texto de prompt pertenece a Metasploit
  const isMsfPromptText = (promptText: string): boolean =>
    promptText.includes('msf6') ||
    promptText.includes('meterpreter') ||
    promptText.includes('C:\\Windows\\system32>');

  // Función para renderizar el prompt estilo Kali Linux moderno
  // Usa el contenido del texto para decidir el estilo, NO el estado global
  const renderKaliPrompt = (promptText: string) => {
    if (isMsfPromptText(promptText)) {
      // Para prompts de Metasploit, usar color uniforme
      return <span style={{ color: promptColors.user }}>{promptText}</span>;
    }

    // Parsear el prompt: user@host:path$
    const match = promptText.match(/^([^@]+)@([^:]+):([^$#]+)([$#])$/);
    if (!match) {
      // Si no coincide con el formato esperado, mostrar con color uniforme
      return <span style={{ color: promptColors.user }}>{promptText}</span>;
    }

    const [, user, host, path, symbol] = match;
    return (
      <span>
        <span style={{ color: promptColors.line }}>┌──(</span>
        <span style={{ color: promptColors.user }}>{user}</span>
        <span style={{ color: promptColors.at }}>㉿</span>
        <span style={{ color: promptColors.host }}>{host}</span>
        <span style={{ color: promptColors.line }}>)</span>
        <span style={{ color: promptColors.line }}>-[</span>
        <span style={{ color: promptColors.path }}>{path}</span>
        <span style={{ color: promptColors.line }}>]</span>
      </span>
    );
  };

  // Función para renderizar el símbolo del prompt en línea separada
  // Acepta promptText opcional: si se pasa, lo usa para determinar el estilo (para historial)
  // Si no se pasa promptText, usa el estado actual (para el prompt activo)
  const renderKaliPromptSymbol = (promptText?: string) => {
    const inMsf = promptText !== undefined ? isMsfPromptText(promptText) : isMsfActive();
    if (inMsf) {
      return <span style={{ color: promptColors.user }}>{'>'}</span>;
    }
    return (
      <span>
        <span style={{ color: promptColors.line }}>└─</span>
        <span style={{ color: promptColors.symbol }}>{isRoot ? '#' : '$'}</span>
      </span>
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      // Scroll al final siempre que cambie el historial
      // Usar scrollTop para compatibilidad con jsdom en tests
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, busy, input]);

  useEffect(() => {
    setHistory([makeWelcome(allMachines)]);
    setCmdHistory([]); setHistIdx(-1); setInput(''); setBusy(false);
    setBlockingCommand(null);
    setListeningPort(null);
    // Asegurar foco inicial con pequeño delay para que el DOM esté listo
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [scenarioId, allMachines.length]);

  // Re-enfocar cuando cambia el estado busy para comandos bloqueantes o al volver a la ventana
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

  // Detectar cuando el comando bloqueante se "conecta" (ej: reverse shell desde el navegador)
  useEffect(() => {
    if (blockingCommand?.connected && busy) {
      // Buscar la máquina víctima (la que no es el atacante)
      const victimMachine = allMachines.find(m => m.id !== 'attacker-01');

      // Simular que la conexión RCE se recibió en el listener
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

      // Cambiar sesión activa a la máquina víctima si es un RCE
      if (victimMachine) {
        onChangeMachine(victimMachine.id);
        setCurrentDir('/var/www/html/');
      }
    }
  }, [blockingCommand?.connected, busy, allMachines, listeningPort, prompt, setBlockingCommand, setListeningPort, onChangeMachine, setCurrentDir]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || busy) return;
    setCmdHistory(prev => [trimmed, ...prev]);
    setInput(''); setHistIdx(-1);

    // Capturar el prompt actual ANTES de ejecutar el comando
    const currentPrompt = prompt;
    const result = executeCommand(trimmed, machine as any, allMachines as any, currentMissionId, setMsfState, currentDir, setCurrentDir);
    if (result.output === 'CLEAR_TERMINAL') { setHistory([]); return; }
    if (result.output === 'EXIT_TO_LANDING') { goHome(); return; }

    const cmdName = trimmed.split(/\s+/)[0].toLowerCase();
    const cfg = CMD_DELAYS[cmdName] || CMD_DELAYS['default'];
    const useStreaming = cfg.minTotal > 0;

    if (!useStreaming) {
      setHistory(prev => [...prev, { command: trimmed, output: result.output, streaming: false, prompt: currentPrompt, timestamp: Date.now() }]);
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);
      if (result.blockingCommand) {
        setBlockingCommand(result.blockingCommand);
        if (result.blockingCommand.listeningPort) {
          setListeningPort(result.blockingCommand.listeningPort);
        }
        setBusy(true);
      }
      if (result.foundCredentials)   onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file, result.foundCredentials.service);
      if (result.newMachineId)       onChangeMachine(result.newMachineId);
      if (result.failedUser && onFailedUser) onFailedUser(result.failedUser.machineId, result.failedUser.user);
      if (result.foundVulnerability) reportVulnerability(result.foundVulnerability.machineId, result.foundVulnerability.vulnId, result.foundVulnerability.status);
      // Si SSH fue exitoso (newMachineId + foundCredentials), marcar credenciales como verificadas
      if (result.newMachineId && result.foundCredentials && onVerifyCredentials) {
        onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
      }
      return;
    }

    const entryTs = Date.now();
    setBusy(true);
    const lines = (result.output as string).split('\n');
    const totalDelay = Math.max(cfg.minTotal, lines.length * 42 + 200);

    setHistory(prev => [...prev, { command: trimmed, streaming: true, lines, prompt: currentPrompt, timestamp: entryTs, result }]);

    setTimeout(() => {
      setBusy(false);
      if (result.completedMissionId) onMissionComplete(result.completedMissionId);
      if (result.blockingCommand) {
        setBlockingCommand(result.blockingCommand);
        if (result.blockingCommand.listeningPort) {
          setListeningPort(result.blockingCommand.listeningPort);
        }
        setBusy(true);
      }
      if (result.foundCredentials)   onCredentialsFound(result.foundCredentials.machineId, result.foundCredentials.user, result.foundCredentials.pass, result.foundCredentials.file, result.foundCredentials.service);
      if (result.newMachineId)       onChangeMachine(result.newMachineId);
      if (result.failedUser && onFailedUser) onFailedUser(result.failedUser.machineId, result.failedUser.user);
      // Si SSH fue exitoso (newMachineId + foundCredentials), marcar credenciales como verificadas
      if (result.newMachineId && result.foundCredentials && onVerifyCredentials) {
        onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
      }
      setHistory(prev => prev.map(e =>
        e.timestamp === entryTs ? { ...e, streaming: false, output: result.output } : e
      ));
      setTimeout(() => inputRef.current?.focus(), 60);
    }, totalDelay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Si hay un comando bloqueante, solo aceptar Ctrl+C para cancelar
    if (blockingCommand) {
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        setBlockingCommand(null);
        setBusy(false);
        setListeningPort(null);
        setHistIdx(-1);
        setHistory(prev => [...prev, {
          command: null,
          output: '^C\nConexión cancelada.',
          streaming: false,
          prompt,
          timestamp: Date.now()
        }]);
      }
      e.preventDefault();
      return;
    }

    // Manejar Tab para autocompletado
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (showSuggestions && suggestions.length > 0) {
        // Si ya estamos mostrando sugerencias, seleccionar la siguiente
        const nextIdx = (suggestionIdx + 1) % suggestions.length;
        setSuggestionIdx(nextIdx);
        
        // Aplicar la sugerencia seleccionada
        const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);
        if (result.suggestions.length > 0) {
          const selectedSuggestion = result.suggestions[nextIdx];
          const textBeforeCursor = input.slice(0, result.replaceStart);
          setInput(textBeforeCursor + selectedSuggestion);
        }
      } else {
        // Obtener sugerencias de autocompletado
        const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);
        
        if (result.suggestions.length === 1) {
          // Una sola sugerencia: completar automáticamente
          setInput(result.completedText);
          setSuggestions([]);
          setShowSuggestions(false);
        } else if (result.suggestions.length > 1) {
          // Múltiples sugerencias: mostrar lista
          const commonPrefix = findCommonPrefix(result.suggestions);
          if (commonPrefix.length > (input.slice(result.replaceStart).length)) {
            // Si hay un prefijo común más largo, completar hasta ese punto
            const textBeforeCursor = input.slice(0, result.replaceStart);
            setInput(textBeforeCursor + commonPrefix);
          }
          setSuggestions(result.suggestions);
          setSuggestionIdx(0);
          setShowSuggestions(true);
        }
      }
      return;
    }

    // Cerrar sugerencias si se presiona cualquier otra tecla (excepto Tab)
    if (showSuggestions && e.key !== 'Tab') {
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }

    if (e.key === 'Enter') { 
      e.preventDefault(); 
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
      runCommand(input); 
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        // Navegar entre sugerencias
        const prevIdx = suggestionIdx <= 0 ? suggestions.length - 1 : suggestionIdx - 1;
        setSuggestionIdx(prevIdx);
      } else if (histIdx < cmdHistory.length - 1) { 
        // Navegar en historial de comandos
        const i = histIdx + 1; 
        setHistIdx(i); 
        setInput(cmdHistory[i]); 
      }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        // Navegar entre sugerencias
        const nextIdx = (suggestionIdx + 1) % suggestions.length;
        setSuggestionIdx(nextIdx);
      } else if (histIdx > 0) { 
        // Navegar en historial de comandos
        const i = histIdx - 1; 
        setHistIdx(i); 
        setInput(cmdHistory[i]); 
      }
      else { 
        setHistIdx(-1); 
        setInput(''); 
      }
    }
    else if (e.key === 'Escape') {
      // Cerrar sugerencias con Escape
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }
    else if (e.ctrlKey && e.key === 'l') {
      // Ctrl+L: Limpiar pantalla (como clear) - preservar input actual
      e.preventDefault();
      setHistory([makeWelcome(allMachines)]);
      setHistIdx(-1);
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
      // NO borrar el input: setInput('') eliminado intencionalmente
    }
    else if (e.ctrlKey && e.key === 'u') {
      // Ctrl+U: Limpiar línea actual
      e.preventDefault();
      setInput('');
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }
    else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      // Ctrl+C: Detener proceso o salir de programa
      e.preventDefault();
      if (busy) {
        // Detener comando bloqueante o streaming
        setBlockingCommand(null);
        setBusy(false);
        setListeningPort(null);
        setHistIdx(-1);
        setHistory(prev => [...prev, {
          command: null,
          output: '^C',
          streaming: false,
          prompt,
          timestamp: Date.now()
        }]);
      } else if (isMsfActive()) {
        // Salir de Metasploit (igual que comando 'exit')
        resetMsfState();
        setMsfState(null);
        setHistIdx(-1);
        // Agregar entrada con comando vacío para mostrar el output y luego el prompt se actualizará
        setHistory(prev => [...prev, {
          command: '',
          output: '^C\n[*] Exiting Metasploit...',
          streaming: false,
          prompt: prompt, // Guardar el prompt de MSF para referencia
          timestamp: Date.now()
        }]);
      } else if (busy) {
        // Detener cualquier otro proceso
        setBusy(false);
        setHistIdx(-1);
        setHistory(prev => [...prev, {
          command: null,
          output: '^C',
          streaming: false,
          prompt,
          timestamp: Date.now()
        }]);
      } else {
        // Limpiar línea si no hay proceso
        setInput('');
        setHistIdx(-1);
        setShowSuggestions(false);
        setSuggestions([]);
        setSuggestionIdx(-1);
      }
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
          <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{renderKaliPrompt(prompt)}</span>
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
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(entry.prompt || prompt)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol(entry.prompt)}</span>
                  <span className="text-sm" style={{ color }}>{entry.command}</span>
                </div>
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

        {!busy && !blockingCommand && (
          <div className="relative">
            {isMsfActive() ? (
              // Para Metasploit: mostrar solo una línea con el prompt completo
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt)}</span>
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color, caretColor: color }}
                  autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
              </div>
            ) : (
              // Para Linux normal: mantener el formato de dos líneas
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol()}</span>
                  <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color, caretColor: color }}
                    autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
                </div>
              </div>
            )}
            {/* Panel de sugerencias de autocompletado */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                className="absolute left-0 right-0 mt-1 py-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
              >
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={suggestion}
                    className={`px-3 py-1 text-xs cursor-pointer flex items-center gap-2 ${
                      idx === suggestionIdx 
                        ? 'bg-gray-700' 
                        : 'hover:bg-gray-800'
                    }`}
                    style={{ color }}
                    onClick={() => {
                      const textBeforeCursor = input.slice(0, input.lastIndexOf(' ') + 1);
                      setInput(textBeforeCursor + suggestion);
                      setShowSuggestions(false);
                      setSuggestions([]);
                      setSuggestionIdx(-1);
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion.endsWith('/') ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>{suggestion}</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <span>{suggestion}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
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
              <span className="font-bold text-xs flex-shrink-0">{renderKaliPrompt(prompt)}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs flex-shrink-0">{renderKaliPromptSymbol()}</span>
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
