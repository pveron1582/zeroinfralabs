// ── hooks/useTerminalMountReset.ts ────────────────────────────────
// Reset LOCAL al montar cada terminal. Cada ventana arranca limpia
// (historial, cwd, env, msf aislado) sin tocar estado GLOBAL compartido:
// sesiones SSH/FTP, shells apiladas, managers de red/procesos/cron/mounts
// e identidad. Así abrir una segunda terminal no reinicia el laboratorio
// de la primera.

import { useEffect } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { Machine, BlockingCommand } from '../types';
import type { IsolatedExecutor, MsfState, PsState } from '../commands';
import type { HistoryEntry } from './processCommandResult';
import type { PendingPython } from './usePendingPythonInput';
import { DEFAULT_ENV } from '../utils/environment';
import { initialCwd } from '../utils/users';

export interface TerminalMountResetDeps {
  scenarioId: string;
  machine: Machine;
  allMachines: Machine[];
  executor: IsolatedExecutor;
  inputRef: RefObject<HTMLInputElement | null>;
  makeWelcome: (machines: Machine[]) => HistoryEntry;
  setHistory: Dispatch<SetStateAction<HistoryEntry[]>>;
  setCmdHistory: Dispatch<SetStateAction<string[]>>;
  setHistIdx: Dispatch<SetStateAction<number>>;
  setInput: Dispatch<SetStateAction<string>>;
  setBusy: Dispatch<SetStateAction<boolean>>;
  setBlockingCommand: Dispatch<SetStateAction<BlockingCommand | null>>;
  setListeningPort: Dispatch<SetStateAction<number | null>>;
  setCurrentDir: Dispatch<SetStateAction<string>>;
  setMsfState: Dispatch<SetStateAction<MsfState | null>>;
  setPsState: Dispatch<SetStateAction<PsState | null>>;
  setPendingPython: Dispatch<SetStateAction<PendingPython | null>>;
  setUmask: Dispatch<SetStateAction<number>>;
  setEnv: Dispatch<SetStateAction<Record<string, string> | undefined>>;
}

export function useTerminalMountReset(d: TerminalMountResetDeps) {
  useEffect(() => {
    d.setHistory([d.makeWelcome(d.allMachines)]);
    d.setCmdHistory([]); d.setHistIdx(-1); d.setInput(''); d.setBusy(false);
    d.setBlockingCommand(null);
    d.setListeningPort(null);
    d.setCurrentDir(initialCwd(d.machine));
    d.setMsfState(null);
    d.setPsState(null);
    d.setPendingPython(null);
    d.executor.resetMsfState();
    d.executor.resetPsState();
    d.setUmask(0o022);
    d.setEnv(DEFAULT_ENV(d.machine));
    const timer = setTimeout(() => d.inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.scenarioId]);
}
