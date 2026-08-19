// ── commands/index.ts ─────────────────────────────────────────────
// Registro central de comandos + API pública del executor.
// Auto-registro desde barrel files; ejecución delegada en executor.ts,
// shells en shellIntegration.ts y SUID/SGID en suid.ts.

import * as builtin from './builtin';
import * as tools from './tools';
import { useScenarioStore } from '../store/scenarioStore';
import { getContextPrompt } from '../frameworks/metasploit/orchestrators/msfContextHelp';
import { createMsfCommand, executeCommandInternal, type Command } from './executor';
import type { MsfState } from './tools';

// Re-export de la integración con ShellManager (sesiones SSH/FTP/NC)
export {
  isShellSessionActive, getCurrentShellName, getShellPrompt,
  startShellSession, executeShellCommand, closeShellSession,
  resetShellManager, resetShellSessions,
} from './shellIntegration';

// ── MSF state backed by Zustand store (non-isolated / test use) ─
const _getMsf = () => useScenarioStore.getState().msfState ?? null;
const _setMsf = (s: MsfState | null) => useScenarioStore.getState().setMsfState(s);

// ── Auto-registro de comandos ─────────────────────────────────────
// Construye el Map a partir de las exportaciones de los barrel files.
// Cada exportación con nombre `cmd_*` se registra por su propiedad `.name`.
// Esto elimina la necesidad de mantener un Map manual de 72 entradas.

function autoRegisterCommands(): Map<string, Command> {
  const map = new Map<string, Command>();
  const modules = [builtin, tools];

  for (const mod of modules) {
    for (const [key, value] of Object.entries(mod)) {
      // Solo procesar objetos que parecen comandos (tienen name + execute)
      if (key.startsWith('cmd_') && value && typeof value === 'object' && 'name' in value && 'execute' in value) {
        const cmd = value as Command;
        map.set(cmd.name, cmd);
      }
    }
  }

  return map;
}

const COMMANDS = autoRegisterCommands();

// Registrar el comando msfconsole con estado (factory, no exportación directa)
COMMANDS.set('msfconsole', createMsfCommand(_getMsf, _setMsf));

/** Lista derivada de nombres de comandos disponibles para autocompletado.
 *  Incluye msfconsole: se autocompleta el comando para ARRANCAR el REPL
 *  (msf + Tab → msfconsole). Dentro del REPL, msfState está activo y el
 *  autocompletado usa autocompleteMsf con sus propios sub-comandos. */
export const AVAILABLE_COMMAND_NAMES: string[] = Array.from(COMMANDS.keys())
  .sort();

// ── Public API: executeCommand (uses module-level singleton MSF state) ─

export const executeCommand = (
  line: string,
  machine: import('../types').CommandContext['machine'],
  allMachines: import('../types').CommandContext['allMachines'],
  currentMissionId: number,
  onMsfStateChange?: (state: MsfState | null) => void,
  currentDir: string = '/',
  setCurrentDir?: (dir: string) => void,
  ftpSession?: import('../types').CommandContext['ftpSession'],
  language?: 'en' | 'es',
  umask?: number,
  setUmask?: (mask: number) => void,
  env?: Record<string, string>,
  setEnv?: (env: Record<string, string>) => void
) => {
  const ctx = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language, umask, setUmask, env, setEnv };
  return executeCommandInternal(line, ctx, COMMANDS, _getMsf, onMsfStateChange);
};

// ── MSF state management (backed by store; `restoreMsfState` removed) ─

export const resetMsfState = () => useScenarioStore.getState().setMsfState(null);
export const isMsfActive = () => !!useScenarioStore.getState().msfState?.active;
export const getMsfPrompt = () => {
  const s = useScenarioStore.getState().msfState;
  return s?.active ? getContextPrompt(s) : null;
};
export const getMsfState = () => {
  const s = useScenarioStore.getState().msfState;
  return s ? { ...s } : null;
};

// ── Re-export types for consumers ────────────────────────────────
export type { MsfState } from './tools';
export type { Command } from './executor';

// ── Isolated Executor ─────────────────────────────────────────────
export interface IsolatedExecutor {
  executeCommand: typeof executeCommand;
  isMsfActive: () => boolean;
  getMsfPrompt: () => string | null;
  getMsfState: () => MsfState | null;
  resetMsfState: () => void;
  getMsfStateSnapshot: () => MsfState | null;
}

export function createIsolatedExecutor(): IsolatedExecutor {
  let _isolatedMsfState: MsfState | null = null;

  const _getIsolated = () => _isolatedMsfState;
  const _setIsolated = (s: MsfState | null) => { _isolatedMsfState = s; };

  const _isolatedCommands = new Map([
    ...Array.from(COMMANDS.entries()).filter(([name]) => name !== 'msfconsole'),
    ['msfconsole', createMsfCommand(_getIsolated, _setIsolated)] as const,
  ]);

  const _execute: typeof executeCommand = (
    line, machine, allMachines, currentMissionId,
    onMsfStateChange, currentDir = '/', setCurrentDir,
    ftpSession, language, umask, setUmask, env, setEnv
  ) => {
    const ctx = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language, umask, setUmask, env, setEnv };
    return executeCommandInternal(line, ctx, _isolatedCommands, _getIsolated, onMsfStateChange);
  };

  return {
    executeCommand: _execute,
    isMsfActive: () => !!_isolatedMsfState?.active,
    getMsfPrompt: () => _isolatedMsfState?.active ? getContextPrompt(_isolatedMsfState) : null,
    getMsfState: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
    resetMsfState: () => { _isolatedMsfState = null; },
    getMsfStateSnapshot: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
  };
}
