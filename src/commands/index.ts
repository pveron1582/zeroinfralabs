// ── commands/index.ts ─────────────────────────────────────────────
// Registro central de comandos + API pública del executor.
// Auto-registro desde barrel files; ejecución delegada en executor.ts,
// shells en shellIntegration.ts y SUID/SGID en suid.ts.

import * as builtin from './builtin';
import * as tools from './tools';
import { useScenarioStore } from '../store/scenarioStore';
import { getContextPrompt } from '../frameworks/metasploit/orchestrators/msfContextHelp';
import { createMsfCommand, executeCommandInternal, type Command, type PsStateGetter, type PsStateSetter } from './executor';
import { WINDOWS_COMMANDS } from './windows';
import type { CommandContext, CommandRequest, MsfState, PsState } from '../types';

// Re-export de la integración con ShellManager (sesiones SSH/FTP/NC)
export {
  isShellSessionActive, getCurrentShellName, getShellPrompt,
  startShellSession, executeShellCommand, closeShellSession,
  resetShellManager,
} from './shellIntegration';

// ── MSF state backed by Zustand store (non-isolated / test use) ─
const _getMsf = () => useScenarioStore.getState().msfState ?? null;
const _setMsf = (s: MsfState | null) => useScenarioStore.getState().setMsfState(s);
// ── PS state (sesión PowerShell) backed by Zustand store ──────────
const _getPs: PsStateGetter = () => useScenarioStore.getState().psState ?? null;
const _setPs: PsStateSetter = (s) => useScenarioStore.getState().setPsState(s);

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
// Dos firmas (overloads): el objeto de opciones CommandRequest (preferida en
// hooks — evita repetir 13 parámetros posicionales) y la firma posicional
// legada, que se mantiene por compatibilidad con tests y call sites.

/** Tabla de alias por registro (aislada por terminal en executors aislados). */
const aliasTables = new WeakMap<Map<string, Command>, Map<string, string>>();
function tableFor(commands: Map<string, Command>): Map<string, string> {
  let t = aliasTables.get(commands);
  if (!t) {
    t = new Map();
    aliasTables.set(commands, t);
  }
  return t;
}

/** Ensambla el CommandContext a partir de un CommandRequest. */
function buildCommandCtx(req: CommandRequest, commands: Map<string, Command>): CommandContext {
  return {
    machine: req.machine,
    allMachines: req.allMachines,
    currentMissionId: req.currentMissionId,
    terminalId: req.terminalId,
    suUserOverride: req.suUserOverride,
    currentDir: req.currentDir ?? '/',
    setCurrentDir: req.setCurrentDir,
    ftpSession: req.ftpSession,
    language: req.language,
    umask: req.umask,
    setUmask: req.setUmask,
    env: req.env,
    setEnv: req.setEnv,
    cmdHistory: req.cmdHistory,
    shellAliases: tableFor(commands),
    // En máquinas Windows también existen los comandos cmd.exe (W1).
    hasCommand: (name: string) =>
      commands.has(name) ||
      (req.machine?.machine_info?.family === 'windows' && WINDOWS_COMMANDS.has(name)),
  };
}

export function executeCommand(req: CommandRequest): ReturnType<typeof executeCommandInternal> {
  return executeCommandInternal(
    req.line, buildCommandCtx(req, COMMANDS), COMMANDS, _getMsf, req.onMsfStateChange,
    _getPs, _setPs, req.onPsStateChange,
  );
}

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

// ── PS state management (store-backed) ────────────────────────────

export const resetPsState = () => useScenarioStore.getState().setPsState(null);
export const isPsActive = () => !!useScenarioStore.getState().psState?.active;
export const getPsState = () => {
  const s = useScenarioStore.getState().psState;
  return s ? { ...s } : null;
};

// ── Re-export types for consumers ────────────────────────────────
export type { MsfState, PsState } from '../types';
export type { Command } from './executor';

// ── Isolated Executor ─────────────────────────────────────────────
export interface IsolatedExecutor {
  executeCommand: typeof executeCommand;
  isMsfActive: () => boolean;
  getMsfPrompt: () => string | null;
  getMsfState: () => MsfState | null;
  resetMsfState: () => void;
  getMsfStateSnapshot: () => MsfState | null;
  isPsActive: () => boolean;
  getPsState: () => PsState | null;
  resetPsState: () => void;
}

export function createIsolatedExecutor(): IsolatedExecutor {
  let _isolatedMsfState: MsfState | null = null;
  let _isolatedPsState: PsState | null = null;

  const _getIsolated = () => _isolatedMsfState;
  const _setIsolated = (s: MsfState | null) => { _isolatedMsfState = s; };
  const _getIsolatedPs: PsStateGetter = () => _isolatedPsState;
  const _setIsolatedPs: PsStateSetter = (s) => { _isolatedPsState = s; };

  const _isolatedCommands = new Map([
    ...Array.from(COMMANDS.entries()).filter(([name]) => name !== 'msfconsole'),
    ['msfconsole', createMsfCommand(_getIsolated, _setIsolated)] as const,
  ]);

  const _execute: typeof executeCommand = (req: CommandRequest) => {
    return executeCommandInternal(
      req.line, buildCommandCtx(req, _isolatedCommands), _isolatedCommands,
      _getIsolated, req.onMsfStateChange,
      _getIsolatedPs, _setIsolatedPs, req.onPsStateChange,
    );
  };

  return {
    executeCommand: _execute,
    isMsfActive: () => !!_isolatedMsfState?.active,
    getMsfPrompt: () => _isolatedMsfState?.active ? getContextPrompt(_isolatedMsfState) : null,
    getMsfState: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
    resetMsfState: () => { _isolatedMsfState = null; },
    getMsfStateSnapshot: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
    isPsActive: () => !!_isolatedPsState?.active,
    getPsState: () => _isolatedPsState ? { ..._isolatedPsState } : null,
    resetPsState: () => { _isolatedPsState = null; },
  };
}
