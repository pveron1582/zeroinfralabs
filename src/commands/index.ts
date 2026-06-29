// ── commands/index.ts ─────────────────────────────────────────────
// Central command registry. Importa comandos desde subcarpetas.
// Estructura:
//   - builtin/: Comandos del sistema (help, clear, ls, cat, whoami, ifconfig, hashcat)
//   - tools/: Herramientas de pentesting (nmap, hydra, ssh, gobuster, arp-scan, msfconsole)

import type { CommandContext, CommandResponse } from '../types';
import {
  cmd_help, cmd_clear, cmd_whoami, cmd_ifconfig,
  cmd_ls, cmd_cat, cmd_hashcat, cmd_sudo,
  cmd_cd, cmd_exit, cmd_end, cmd_mkdir, cmd_rmdir,
  cmd_ping, cmd_traceroute, cmd_ps, cmd_top, cmd_htop, cmd_which
} from './builtin';
import {
  cmd_arpScan, cmd_netdiscover, cmd_nmap, cmd_gobuster, cmd_hydra,
  cmd_ssh, cmd_nc, cmd_msfconsole, executeMsfCommand, type MsfState,
  cmd_ftp
} from './tools';
import { shellManager, type ShellContext as ManagerContext, type ShellResult } from '../frameworks/shells';
import { getContextPrompt } from '../frameworks/metasploit/orchestrators/msfContextHelp';

interface Command {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

// ── MSF session state (persisted across calls within same session) ─
let _msfState: MsfState | null = null;

// ── Shell Manager Integration ───────────────────────────────────
// Helper para convertir CommandContext a ShellContext
function toShellContext(ctx: CommandContext): ManagerContext {
  return {
    machine: ctx.machine,
    allMachines: ctx.allMachines,
    currentMissionId: ctx.currentMissionId,
    currentDir: ctx.currentDir,
    setCurrentDir: ctx.setCurrentDir || (() => {}),
    language: ctx.language,
  };
}

// ── Command registry ──────────────────────────────────────────────
const COMMANDS: Command[] = [
  // Built-in commands
  cmd_help,
  cmd_clear,
  cmd_whoami,
  cmd_ifconfig,
  cmd_ls,
  cmd_cat,
  cmd_hashcat,
  cmd_sudo,
  cmd_cd,
  cmd_mkdir,
  cmd_rmdir,
  cmd_exit,
  cmd_end,
  cmd_ping,
  cmd_traceroute,
  cmd_ps,
  cmd_top,
  cmd_htop,
  cmd_which,
  // Pentesting tools
  cmd_arpScan,
  cmd_netdiscover,
  cmd_nmap,
  cmd_gobuster,
  cmd_hydra,
  cmd_ssh,
  cmd_nc,
  cmd_ftp,
  // MSF console wrapper (handles stateful sessions)
  {
    name: 'msfconsole',
    execute: (args, ctx) => {
      if (_msfState?.active) {
        const line = args.join(' ');
        const result = executeMsfCommand(line, _msfState, ctx);
        if (result.output.startsWith('MSF_STATE:')) {
          const nl = result.output.indexOf('\n');
          try {
            const parsedState = JSON.parse(result.output.slice('MSF_STATE:'.length, nl));
            // If exiting the session (active: false), clear state completely
            _msfState = parsedState.active ? parsedState : null;
          } catch {}
          return { ...result, output: result.output.slice(nl + 1) };
        }
        return result;
      }
      const result = cmd_msfconsole.execute();
      if (result.output.startsWith('MSF_STATE:')) {
        const nl = result.output.indexOf('\n');
        try {
          _msfState = JSON.parse(result.output.slice('MSF_STATE:'.length, nl));
        } catch {}
        return { ...result, output: result.output.slice(nl + 1) };
      }
      return result;
    }
  },
];

// ── Shell Manager Integration ─────────────────────────────────────
// El ShellManager gestiona sesiones interactivas (FTP, SSH interactivo, etc.)

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

  if (result.isError) {
    return result;
  }

  // Obtener el prompt inicial del shell
  const prompt = shellManager.getPrompt();
  const current = shellManager.current();

  // Para FTP, devolver el estado compatible con el store
  if (shellName === 'ftp' && current) {
    const state = current.state;
    const targetIp = args[0] || state.targetIp || 'localhost';

    return {
      output: `Connected to ${targetIp}.\n220 (vsFTPd 3.0.3)`,
      ftpSession: {
        active: true,
        connected: state.connected,
        targetIp: state.targetIp,
        targetId: state.targetId,
        username: state.username,
        loggedIn: state.loggedIn,
        step: state.step,
      }
    };
  }

  // Para SSH, devolver el estado compatible con el store
  if (shellName === 'ssh' && current) {
    const state = current.state;

    return {
      output: `${state.username}@${state.targetIp}'s password: `,
      sshSession: {
        active: true,
        connected: state.connected,
        targetIp: state.targetIp,
        targetId: state.targetId,
        username: state.username,
        authenticated: state.authenticated,
        step: state.step,
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

  // Convertir el resultado del shell a CommandResponse compatible
  const response: CommandResponse = {
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
  };

  // Si es sesión FTP, mantener compatibilidad con el store
  if (shellName === 'ftp' || current?.shell.name === 'ftp') {
    const state = current?.state;
    response.ftpSession = {
      active: shellManager.isActive(),
      connected: state?.connected,
      targetIp: state?.targetIp,
      targetId: state?.targetId,
      username: state?.username,
      loggedIn: state?.loggedIn,
      step: state?.step,
    };
  }

  // Si es sesión SSH, mantener compatibilidad con el store
  if (shellName === 'ssh' || current?.shell.name === 'ssh') {
    const state = current?.state;
    response.sshSession = {
      active: shellManager.isActive(),
      connected: state?.connected,
      targetIp: state?.targetIp,
      targetId: state?.targetId,
      username: state?.username,
      authenticated: state?.authenticated,
      step: state?.step,
    };
  }

  return response;
};

/** Cerrar la sesión de shell actual */
export const closeShellSession = (): CommandResponse => {
  shellManager.closeCurrentSession();
  return {
    output: '221 Goodbye.',
    ftpSession: { active: false, connected: false }
  };
};

/** Reset del ShellManager al cambiar de escenario */
export const resetShellManager = () => shellManager.reset();

export const executeCommand = (
  line: string,
  machine: CommandContext['machine'],
  allMachines: CommandContext['allMachines'],
  currentMissionId: number,
  onMsfStateChange?: (state: MsfState | null) => void,
  currentDir: string = '/',
  setCurrentDir?: (dir: string) => void,
  ftpSession?: CommandContext['ftpSession'],
  language?: 'en' | 'es'
): CommandResponse => {
  const parts = line.trim().split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);

  let result: CommandResponse;

  const ctx: CommandContext = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language };

  // ── Si hay una sesión de shell activa (FTP, etc.), enviar el comando al shell
  if (shellManager.isActive()) {
    result = executeShellCommand(line, ctx);

    // Si el shell se cerró, devolver el estado actualizado
    if (!shellManager.isActive()) {
      result.ftpSession = { active: false, connected: false };
    }

    return result;
  }

  // ── If inside an active MSF session, forward ALL commands to MSF handler
  if (_msfState?.active) {
    const msfCmd = COMMANDS.find(c => c.name === 'msfconsole')!;
    result = msfCmd.execute([line], ctx);
  } else {
    const cmd = COMMANDS.find(c => c.name === cmdName);
    if (!cmd) return {
      output: `Command not found: ${cmdName}\nEscribe 'help' para ver los comandos disponibles.`,
      isError: true
    };
    result = cmd.execute(args, ctx);
  }

  // Sync MSF state with Zustand store ALWAYS
  // This ensures any changes (including exit/quit) are persisted
  if (onMsfStateChange) {
    onMsfStateChange(_msfState);
  }

  return result;
};

// ── Reset MSF state when a new scenario is loaded (call from App on scenario change)
export const resetMsfState = () => { _msfState = null; };

// ── Restore MSF state from store (call from App on mount)
export const restoreMsfState = (storedState: MsfState | null) => { _msfState = storedState; };

// ── Check if currently inside an MSF session (for prompt display)
export const isMsfActive = () => !!_msfState?.active;

// ── Get current MSF prompt (for dynamic prompt display)
// Fase 3: Now uses context-aware prompt detection
export const getMsfPrompt = () => {
  if (!_msfState?.active) return null;

  // Use context-aware prompt generation from msfContextHelp
  return getContextPrompt(_msfState);
};

// ── Get a snapshot of the current MSF state (for UI components) ──
export const getMsfState = () => _msfState ? { ...(_msfState) } : null;

// ── Re-export types for consumers ────────────────────────────────
export type { MsfState } from './tools';

// ── Resetea todas las sesiones de shell (útil al cambiar de escenario) ──
export const resetShellSessions = () => {
  shellManager.reset();
};

// ── Isolated Executor ─────────────────────────────────────────────
// Cada terminal en modo desktop obtiene su propio executor con estado
// aislado (msfState, etc.) para no contaminar otras terminales.
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

  const _isolatedCommands: Command[] = COMMANDS.map(cmd => {
    if (cmd.name === 'msfconsole') {
      return {
        name: 'msfconsole',
        execute: (args: string[], ctx: CommandContext): CommandResponse => {
          if (_isolatedMsfState?.active) {
            const line = args.join(' ');
            const result = executeMsfCommand(line, _isolatedMsfState, ctx);
            if (result.output.startsWith('MSF_STATE:')) {
              const nl = result.output.indexOf('\n');
              try {
                const parsedState = JSON.parse(result.output.slice('MSF_STATE:'.length, nl));
                _isolatedMsfState = parsedState.active ? parsedState : null;
              } catch {}
              return { ...result, output: result.output.slice(nl + 1) };
            }
            return result;
          }
          const result = cmd_msfconsole.execute();
          if (result.output.startsWith('MSF_STATE:')) {
            const nl = result.output.indexOf('\n');
            try {
              _isolatedMsfState = JSON.parse(result.output.slice('MSF_STATE:'.length, nl));
            } catch {}
            return { ...result, output: result.output.slice(nl + 1) };
          }
          return result;
        }
      };
    }
    return cmd;
  });

  const _execute: typeof executeCommand = (
    line, machine, allMachines, currentMissionId,
    onMsfStateChange, currentDir = '/', setCurrentDir,
    ftpSession, language
  ) => {
    const parts = line.trim().split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);
    const ctx: CommandContext = { machine, allMachines, currentMissionId, currentDir, setCurrentDir, ftpSession, language };

    if (shellManager.isActive()) {
      const result = executeShellCommand(line, ctx);
      if (!shellManager.isActive()) {
        result.ftpSession = { active: false, connected: false };
      }
      return result;
    }

    let result: CommandResponse;
    if (_isolatedMsfState?.active) {
      const msfCmd = _isolatedCommands.find(c => c.name === 'msfconsole')!;
      result = msfCmd.execute([line], ctx);
    } else {
      const cmd = _isolatedCommands.find(c => c.name === cmdName);
      if (!cmd) return {
        output: `Command not found: ${cmdName}\nEscribe 'help' para ver los comandos disponibles.`,
        isError: true
      };
      result = cmd.execute(args, ctx);
    }

    if (onMsfStateChange) {
      onMsfStateChange(_isolatedMsfState);
    }

    return result;
  };

  return {
    executeCommand: _execute,
    isMsfActive: () => !!_isolatedMsfState?.active,
    getMsfPrompt: () => {
      if (!_isolatedMsfState?.active) return null;
      return getContextPrompt(_isolatedMsfState);
    },
    getMsfState: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
    resetMsfState: () => { _isolatedMsfState = null; },
    getMsfStateSnapshot: () => _isolatedMsfState ? { ..._isolatedMsfState } : null,
  };
}