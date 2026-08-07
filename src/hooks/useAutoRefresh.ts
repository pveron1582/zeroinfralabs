// ── hooks/useAutoRefresh.ts ────────────────────────────────────────
// Refresca la salida de `top`/`htop` cada segundo mientras el comando
// bloqueante correspondiente está activo.

import { useEffect } from 'react';
import type { Machine, BlockingCommand } from '../types';
import type { IsolatedExecutor } from '../commands';

export interface RefreshEntry {
  command: string | null;
  output?: string;
  streaming: boolean;
  prompt?: string;
  timestamp: number;
}

interface UseAutoRefreshOptions {
  busy: boolean;
  blockingCommand: BlockingCommand | null;
  executor: IsolatedExecutor;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  currentDir: string;
  umask: number;
  setUmask: (u: number) => void;
  env: Record<string, string> | undefined;
  setEnv: (e: Record<string, string> | undefined) => void;
  prompt: string;
  setHistory: React.Dispatch<React.SetStateAction<RefreshEntry[]>>;
}

export function useAutoRefresh({
  busy, blockingCommand, executor, machine, allMachines,
  currentMissionId, currentDir, umask, setUmask, env, setEnv, prompt, setHistory,
}: UseAutoRefreshOptions) {
  useEffect(() => {
    if (busy && blockingCommand?.cancelKey === 'q' && blockingCommand?.clearScreen) {
      const cmdName = blockingCommand?.message?.includes('htop') ? 'htop' : 'top';
      const refreshInterval = setInterval(() => {
        const result = executor.executeCommand(
          cmdName, machine, allMachines, currentMissionId,
          undefined, currentDir, undefined, undefined, undefined,
          umask, setUmask, env, setEnv,
        );
        if (!result.isError && result.output) {
          const out = result.output;
          setHistory(prev => {
            const lastEntry = prev[prev.length - 1];
            const isTopHtopEntry = lastEntry &&
              lastEntry.command === null &&
              (lastEntry.output?.includes('top -') || lastEntry.output?.includes('CPU0 ['));
            const entry: RefreshEntry = {
              command: null,
              output: out,
              streaming: false,
              prompt,
              timestamp: Date.now(),
            };
            if (isTopHtopEntry) {
              return [...prev.slice(0, -1), entry];
            }
            return [...prev, entry];
          });
        }
      }, 1000);
      return () => clearInterval(refreshInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, blockingCommand, machine, allMachines, currentMissionId, currentDir, prompt]);
}
