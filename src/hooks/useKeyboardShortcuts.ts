// ── hooks/useKeyboardShortcuts.ts ──────────────────────────────────
import { useState } from 'react';
import type { Machine } from '../types';
import type { MsfState } from '../commands';
import { isMsfActive, resetMsfState } from '../commands';
import { getAutocompleteSuggestions, findCommonPrefix } from '../utils/autocomplete';

interface UseKeyboardShortcutsOptions {
  input: string;
  setInput: (value: string) => void;
  machine: Machine;
  currentDir: string;
  msfState: MsfState | null;
  cmdHistory: string[];
  setCmdHistory: (fn: (prev: string[]) => string[]) => void;
  histIdx: number;
  setHistIdx: (value: number) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
  blockingCommand: any;
  setBlockingCommand: (value: any) => void;
  setListeningPort: (value: number | null) => void;
  setHistory: (fn: ((prev: any[]) => any[]) | any[]) => void;
  prompt: string;
  runCommand: (cmd: string) => void;
  makeWelcome: (machines: Machine[]) => any;
  allMachines: Machine[];
  goHome: () => void;
  setMsfState: (state: MsfState | null) => void;
}

interface UseKeyboardShortcutsReturn {
  showSuggestions: boolean;
  suggestions: string[];
  suggestionIdx: number;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  setShowSuggestions: (value: boolean) => void;
  setSuggestions: (value: string[]) => void;
  setSuggestionIdx: (value: number) => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): UseKeyboardShortcutsReturn {
  const {
    input, setInput, machine, currentDir, msfState,
    cmdHistory, setCmdHistory, histIdx, setHistIdx,
    busy, setBusy, blockingCommand, setBlockingCommand,
    setListeningPort, setHistory, prompt, runCommand,
    makeWelcome, allMachines, goHome, setMsfState,
  } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (blockingCommand) {
      // Check for cancelKey first (e.g., 'q' for top/htop)
      if (blockingCommand.cancelKey && e.key === blockingCommand.cancelKey) {
        e.preventDefault();
        setBlockingCommand(null);
        setBusy(false);
        setListeningPort(null);
        setHistIdx(-1);
        return;
      }
      // F10 also exits htop (and other tools that use function keys)
      if (e.key === 'F10' && blockingCommand.message?.includes('htop')) {
        e.preventDefault();
        setBlockingCommand(null);
        setBusy(false);
        setListeningPort(null);
        setHistIdx(-1);
        return;
      }
      // Ctrl+C always cancels
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

    if (e.key === 'Tab') {
      e.preventDefault();

      if (showSuggestions && suggestions.length > 0) {
        const nextIdx = (suggestionIdx + 1) % suggestions.length;
        setSuggestionIdx(nextIdx);

        const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);
        if (result.suggestions.length > 0) {
          const selectedSuggestion = result.suggestions[nextIdx];
          const textBeforeCursor = input.slice(0, result.replaceStart);
          setInput(textBeforeCursor + selectedSuggestion);
        }
      } else {
        const result = getAutocompleteSuggestions(input, input.length, machine, currentDir, msfState);

        if (result.suggestions.length === 1) {
          setInput(result.completedText);
          setSuggestions([]);
          setShowSuggestions(false);
        } else if (result.suggestions.length > 1) {
          const commonPrefix = findCommonPrefix(result.suggestions);
          if (commonPrefix.length > (input.slice(result.replaceStart).length)) {
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
        const prevIdx = suggestionIdx <= 0 ? suggestions.length - 1 : suggestionIdx - 1;
        setSuggestionIdx(prevIdx);
      } else if (histIdx < cmdHistory.length - 1) {
        const i = histIdx + 1;
        setHistIdx(i);
        setInput(cmdHistory[i]);
      }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        const nextIdx = (suggestionIdx + 1) % suggestions.length;
        setSuggestionIdx(nextIdx);
      } else if (histIdx > 0) {
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
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }
    else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([makeWelcome(allMachines)]);
      setHistIdx(-1);
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }
    else if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      setInput('');
      setShowSuggestions(false);
      setSuggestions([]);
      setSuggestionIdx(-1);
    }
    else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (busy) {
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
        resetMsfState();
        setMsfState(null);
        setHistIdx(-1);
        setHistory(prev => [...prev, {
          command: '',
          output: '^C\n[*] Exiting Metasploit...',
          streaming: false,
          prompt: prompt,
          timestamp: Date.now()
        }]);
      } else {
        setInput('');
        setHistIdx(-1);
        setShowSuggestions(false);
        setSuggestions([]);
        setSuggestionIdx(-1);
      }
    }
  };

  return {
    showSuggestions,
    suggestions,
    suggestionIdx,
    handleKeyDown,
    setShowSuggestions,
    setSuggestions,
    setSuggestionIdx,
  };
}
