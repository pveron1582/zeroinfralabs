// ── commands/index.ts ─────────────────────────────────────────────
// Registro central de comandos + API pública del executor.
// Auto-registro desde barrel files; ejecución delegada en executor.ts,
// shells en shellIntegration.ts y SUID/SGID en suid.ts.

import * as builtin from './builtin';
import * as tools from './tools';
import { useScenarioStore } from '../store/scenarioStore';
import { getContextPrompt } from '../frameworks/metasploit/orchestrators/msfContextHelp';
import { createMsfCommand, executeCommandInternal, type Command } from './executor';
import type { CommandContext, CommandRequest, MsfState } from '../types';

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
// Dos firmas (overloads): el objeto de opciones CommandRequest (preferida en
// hooks — evita repetir 13 parámetros posicionales) y la firma posicional
// legada, que se mantiene por compatibilidad con tests y call sites.

/** Ensambla el CommandContext a partir de un CommandRequest. */
function buildCommandCtx(req: CommandRequest): CommandContext {
  return {
    machine: req.machine,
    allMachines: req.allMachines,
    currentMissionId: req.currentMissionId,
    terminalId: req.terminalId,
    currentDir: req.currentDir ?? '/',
    setCurrentDir: req.setCurrentDir,
    ftpSession: req.ftpSession,
    language: req.language,
    umask: req.umask,
    setUmask: req.setUmask,
    env: req.env,
    setEnv: req.setEnv,
  };
}

/** Convierte la firma posicional legada (13 args) en un CommandRequest. */
function legacyArgsToRequest(line: string, rest: unknown[]): CommandRequest {
  return {
    line,
    machine: rest[0] as CommandRequest['machine'],
    allMachines: rest[1] as CommandRequest['allMachines'],
    currentMissionId: rest[2] as number,
    onMsfStateChange: rest[3] as CommandRequest['onMsfStateChange'],
    currentDir: rest[4] as CommandRequest['currentDir'],
    setCurrentDir: rest[5] as CommandRequest['setCurrentDir'],
    ftpSession: rest[6] as CommandRequest['ftpSession'],
    language: rest[7] as CommandRequest['language'],
    umask: rest[8] as CommandRequest['umask'],
    setUmask: rest[9] as CommandRequest['setUmask'],
    env: rest[10] as CommandRequest['env'],
    setEnv: rest[11] as CommandRequest['setEnv'],
  };
}

export function executeCommand(req: CommandRequest): ReturnType<typeof executeCommandInternal>;
export function executeCommand(
  line: string,
  machine: CommandContext['machine'],
  allMachines: CommandContext['allMachines'],
  currentMissionId: number,
  onMsfStateChange?: (state: MsfState | null) => void,
  currentDir?: string,
  setCurrentDir?: (dir: string) => void,
  ftpSession?: CommandContext['ftpSession'],
  language?: 'en' | 'es',
  umask?: number,
  setUmask?: (mask: number) => void,
  env?: Record<string, string>,
  setEnv?: (env: Record<string, string>) => void
): ReturnType<typeof executeCommandInternal>;
export function executeCommand(
  lineOrReq: string | CommandRequest,
  ...rest: unknown[]
): ReturnType<typeof executeCommandInternal> {
  const req: CommandRequest = typeof lineOrReq === 'string' ? legacyArgsToRequest(lineOrReq, rest) : lineOrReq;
  return executeCommandInternal(req.line, buildCommandCtx(req), COMMANDS, _getMsf, req.onMsfStateChange);
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

// ── Re-export types for consumers ────────────────────────────────
export type { MsfState } from '../types';
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
    lineOrReq: string | CommandRequest,
    ...rest: unknown[]
  ) => {
    const req: CommandRequest = typeof lineOrReq === 'string' ? legacyArgsToRequest(lineOrReq, rest) : lineOrReq;
    return executeCommandInternal(req.line, buildCommandCtx(req), _isolatedCommands, _getIsolated, req.onMsfStateChange);
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
