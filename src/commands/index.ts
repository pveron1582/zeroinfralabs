// ── commands/index.ts ─────────────────────────────────────────────
// Central command registry. Auto-registro desde barrel files.

import type { CommandContext, CommandResponse, FileEntry } from '../types';
import * as builtin from './builtin';
import * as tools from './tools';
import { shellManager, type ShellContext as ManagerContext } from '../frameworks/shells';
import { getContextPrompt } from '../frameworks/metasploit/orchestrators/msfContextHelp';
import { useScenarioStore } from '../store/scenarioStore';
import { getCurrentUser } from '../utils/users';
import { hasSuid, hasSgid } from '../utils/permissions';
import { writeOutputToFile } from '../utils/redirection';
import { splitTopLevel, extractRedirection, expandCommandLine, splitArgs } from '../utils/shellParse';
import type { User } from '../types';
import { cmd_msfconsole, executeMsfCommand, type MsfState } from './tools';

// ── Types ─────────────────────────────────────────────────────────
interface Command {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

// ── Helpers ───────────────────────────────────────────────────────
function toShellContext(ctx: CommandContext): ManagerContext {
  return {
    machine: ctx.machine,
    allMachines: ctx.allMachines,
    currentMissionId: ctx.currentMissionId,
    currentDir: ctx.currentDir,
    setCurrentDir: ctx.setCurrentDir || (() => {}),
    language: ctx.language,
    umask: ctx.umask,
  };
}

function parseMsfResponse(
  result: CommandResponse,
  setState: (state: MsfState | null) => void
): CommandResponse {
  if (!('msfStateUpdate' in result)) return result;
  const state = result.msfStateUpdate ?? null;
  setState(state?.active ? state : null);
  const { msfStateUpdate: _discarded, ...rest } = result;
  return rest;
}

function createMsfCommand(
  getState: () => MsfState | null,
  setState: (state: MsfState | null) => void
): Command {
  return {
    name: 'msfconsole',
    execute: (args, ctx) => {
      const currentState = getState();
      if (currentState?.active) {
        return parseMsfResponse(
          executeMsfCommand(args.join(' '), currentState, ctx),
          setState
        );
      }
      return parseMsfResponse(cmd_msfconsole.execute(), setState);
    }
  };
}

/**
 * Find a binary file in the machine's filesystem by command name.
 * Checks common binary paths: /bin/<cmd>, /usr/bin/<cmd>, /usr/sbin/<cmd>, /sbin/<cmd>
 */
function findBinaryFile(machine: { files: Array<{ path: string; mode?: number; owner?: string; group?: string }> }, cmdName: string) {
  const binaryPaths = [
    `/bin/${cmdName}`,
    `/usr/bin/${cmdName}`,
    `/usr/sbin/${cmdName}`,
    `/sbin/${cmdName}`,
    `/usr/local/bin/${cmdName}`,
  ];
  for (const bp of binaryPaths) {
    const file = machine.files.find(f => f.path === bp);
    if (file) return file;
  }
  return null;
}

/**
 * Check if a binary has SUID/SGID bits and return the effective user to run as.
 * Returns null if no special bits, or a User object to use as effective identity.
 */
function getSuidEffectiveUser(
  machine: { files: Array<{ path: string; mode?: number; owner?: string; group?: string }> },
  cmdName: string,
  currentUser: User
): { effectiveUser: User; isSuid: boolean; isSgid: boolean } | null {
  const binary = findBinaryFile(machine, cmdName);
  if (!binary) return null;

  const mode = binary.mode ?? 0o755;
  const isSuid = hasSuid(mode);
  const isSgid = hasSgid(mode);

  if (!isSuid && !isSgid) return null;

  const owner = binary.owner ?? 'root';

  if (isSuid) {
    return {
      effectiveUser: { username: owner, uid: owner === 'root' ? 0 : 1000, gid: 0, home: `/home/${owner}`, shell: '/bin/bash', groups: [0] },
      isSuid: true,
      isSgid: false,
    };
  }

  // For SGID: run with the file's group (keep same user but change gid)
  return {
    effectiveUser: currentUser,
    isSuid: false,
    isSgid: true,
  };
}

function runPipeline(
  segments: string[],
  ctx: CommandContext,
  commands: Map<string, Command>,
  getMsfState: () => MsfState | null,
  onMsfStateChange?: (state: MsfState | null) => void
): CommandResponse {
  let pipedInput: string | undefined;
  let result: CommandResponse = { output: '' };
  const allChanged: FileEntry[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segCtx: CommandContext = i === 0 ? ctx : { ...ctx, pipedInput };
    const segResult = executeCommandInternal(segments[i], segCtx, commands, getMsfState, onMsfStateChange);
    if (segResult.filesChanged) allChanged.push(...segResult.filesChanged);
    if (i === 0) {
      result = segResult;
    } else {
      result = { ...result, output: segResult.output };
      if (segResult.isError) result = { ...result, isError: true };
    }
    pipedInput = segResult.output;
  }

  if (allChanged.length > 0) {
    result = { ...result, filesChanged: allChanged };
  }
  return result;
}

function executeCommandInternal(
  line: string,
  ctx: CommandContext,
  commands: Map<string, Command>,
  getMsfState: () => MsfState | null,
  onMsfStateChange?: (state: MsfState | null) => void
): CommandResponse {
  if (shellManager.isActive()) {
    const result = executeShellCommand(line, ctx);
    if (!shellManager.isActive()) {
      return { ...result, type: 'hybrid', ftpSession: { active: false, connected: false } };
    }
    return result;
  }

  const msfState = getMsfState();

  if (msfState?.active) {
    const msfCmd = commands.get('msfconsole')!;
    const result = msfCmd.execute([line], ctx);
    if (onMsfStateChange) onMsfStateChange(getMsfState());
    return result;
  }

  // ── Normal command path: env expansion + pipes + redirection ──
  const expanded = ctx.env ? expandCommandLine(line, ctx.env) : line;

  const pipeSegments = splitTopLevel(expanded, '|');
  if (pipeSegments.length > 1) {
    return runPipeline(pipeSegments, ctx, commands, getMsfState, onMsfStateChange);
  }

  const redir = extractRedirection(expanded);
  const cmdLine = redir ? redir.command : expanded;
  const parts = splitArgs(cmdLine);
  const cmdName = parts[0] ?? '';
  const args = parts.slice(1);

  const cmd = commands.get(cmdName);
  if (!cmd) return {
    output: `Command not found: ${cmdName}\nEscribe 'help' para ver los comandos disponibles.`,
    isError: true
  };

  // ── Redirección de entrada < archivo ──
  let finalArgs = args;
  if (redir?.inputFile) {
    finalArgs = [...args, redir.inputFile];
  }

  // ── SUID/SGID detection ──────────────────────────────────────
  const currentUser = getCurrentUser(ctx.machine);
  const suidInfo = getSuidEffectiveUser(ctx.machine, cmdName, currentUser);

  let result: CommandResponse;

  // No aplicar SUID handler a sudo ni su (ambos manejan su propia escalada)
  if (suidInfo && suidInfo.isSuid && cmdName !== 'sudo' && cmdName !== 'su') {
    const originalPrivesc = ctx.machine.privesc_completed;
    ctx.machine.privesc_completed = true;

    try {
      result = {
        ...cmd.execute(finalArgs, ctx),
        privescAttempted: true,
        privescTool: cmdName,
        privescCompleted: ctx.machine.id,
      };
    } finally {
      ctx.machine.privesc_completed = originalPrivesc;
    }
  } else {
    result = cmd.execute(finalArgs, ctx);
  }

  // ── Redirección de salida > y >> ──
  if (redir?.operator && redir.outputFile) {
    const write = writeOutputToFile(
      ctx.machine,
      ctx.currentDir,
      ctx.umask ?? 0o022,
      redir.outputFile,
      result.output + '\n',
      redir.operator
    );
    if (!write.ok) {
      return { output: `bash: ${write.error}`, isError: true };
    }
    result = { ...result, filesChanged: write.filesChanged };
  }

  if (onMsfStateChange) onMsfStateChange(getMsfState());

  return result;
}

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

// ── Shell Manager Integration ─────────────────────────────────────

/** Verifica si hay una sesión de shell activa */
export const isShellSessionActive = () => shellManager.isActive();

/** Obtiene el nombre del shell activo */
export const getCurrentShellName = () => shellManager.getCurrentShellName();

/** Obtiene el prompt del shell activo */
export const getShellPrompt = () => shellManager.getPrompt();

/** Iniciar una sesión de shell (llamado desde comandos como ftp, ssh -i, etc.) */
export const startShellSession = (shellName: string, args: string[], ctx: CommandContext): CommandResponse => {
  const shellCtx = toShellContext(ctx);
  const result = shellManager.startSession(shellName, args, shellCtx);

  if (result.isError) return result;

  const prompt = shellManager.getPrompt();
  const current = shellManager.current();

  if (shellName === 'ftp' && current) {
    const state = current.state;
    const targetIp = args[0] || state.targetIp || 'localhost';
    return {
      type: 'ftp',
      output: `Connected to ${targetIp}.\n220 (vsFTPd 3.0.3)`,
      ftpSession: {
        active: true, connected: state.connected,
        targetIp: state.targetIp, targetId: state.targetId,
        username: state.username, loggedIn: state.loggedIn, step: state.step,
      }
    };
  }

  if (shellName === 'ssh' && current) {
    const state = current.state;
    return {
      type: 'ssh',
      output: '',
      sshSession: {
        active: true, connected: state.connected,
        targetIp: state.targetIp, targetId: state.targetId,
        username: state.username, authenticated: state.authenticated, step: state.step,
      }
    };
  }

  return { output: prompt || '' };
};

/** Ejecutar un comando en el shell activo */
export const executeShellCommand = (line: string, ctx: CommandContext): CommandResponse => {
  if (!shellManager.isActive()) {
    return { output: 'No active shell session', isError: true };
  }

  const shellCtx = toShellContext(ctx);
  const shellName = shellManager.getCurrentShellName();
  const result = shellManager.execute(line, shellCtx);
  const current = shellManager.current();

  const state = current?.state;

  const response: CommandResponse = {
    type: 'hybrid',
    output: result.output,
    isError: result.isError,
    newMachineId: result.newMachineId,
    blockingCommand: result.blockingCommand,
    downloadedFile: result.downloadedFile,
    foundCredentials: result.foundCredentials,
    failedUser: result.failedUser,
    foundVulnerability: result.foundVulnerability,
    sshSessionClosed: result.sshSessionClosed,
    sshLoginUser: result.sshLoginUser,
    ...(shellName === 'ftp' || current?.shell.name === 'ftp' ? {
      ftpSession: {
        active: shellManager.isActive(), connected: state?.connected,
        targetIp: state?.targetIp, targetId: state?.targetId,
        username: state?.username, loggedIn: state?.loggedIn, step: state?.step,
      }
    } : {}),
    ...(shellName === 'ssh' || current?.shell.name === 'ssh' ? {
      sshSession: {
        active: shellManager.isActive(), connected: state?.connected,
        targetIp: state?.targetIp, targetId: state?.targetId,
        username: state?.username, authenticated: state?.authenticated, step: state?.step,
      }
    } : {}),
  };

  return response;
};

/** Cerrar la sesión de shell actual */
export const closeShellSession = (): CommandResponse => {
  shellManager.closeCurrentSession();
  return { type: 'ftp', output: '221 Goodbye.', ftpSession: { active: false, connected: false } };
};

/** Reset del ShellManager al cambiar de escenario */
export const resetShellManager = () => shellManager.reset();

/** Resetea todas las sesiones de shell (útil al cambiar de escenario) */
export const resetShellSessions = () => shellManager.reset();

// ── Public API: executeCommand (uses module-level singleton MSF state) ─

export const executeCommand = (
  line: string,
  machine: CommandContext['machine'],
  allMachines: CommandContext['allMachines'],
  currentMissionId: number,
  onMsfStateChange?: (state: MsfState | null) => void,
  currentDir: string = '/',
  setCurrentDir?: (dir: string) => void,
  ftpSession?: CommandContext['ftpSession'],
  language?: 'en' | 'es',
  umask?: number,
  setUmask?: (mask: number) => void,
  env?: Record<string, string>,
  setEnv?: (env: Record<string, string>) => void
): CommandResponse => {
  const ctx: CommandContext = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language, umask, setUmask, env, setEnv };
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
    const ctx: CommandContext = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language, umask, setUmask, env, setEnv };
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