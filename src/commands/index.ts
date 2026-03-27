// ── commands/index.ts ─────────────────────────────────────────────
// Central command registry. Importa comandos desde subcarpetas.
// Estructura:
//   - builtin/: Comandos del sistema (help, clear, ls, cat, whoami, ifconfig, hashcat)
//   - tools/: Herramientas de pentesting (nmap, hydra, ssh, gobuster, arp-scan, msfconsole)

import type { CommandContext, CommandResponse } from '../types';
import {
  cmd_help, cmd_clear, cmd_whoami, cmd_ifconfig,
  cmd_ls, cmd_cat, cmd_hashcat, cmd_sudo,
  cmd_cd, cmd_exit, cmd_end, cmd_mkdir, cmd_rmdir
} from './builtin';
import {
  cmd_arpScan, cmd_nmap, cmd_gobuster, cmd_hydra,
  cmd_ssh, cmd_nc, cmd_msfconsole, executeMsfCommand, type MsfState
} from './tools';

interface Command {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

// ── MSF session state (persisted across calls within same session) ─
let _msfState: MsfState | null = null;

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
  // Pentesting tools
  cmd_arpScan,
  cmd_nmap,
  cmd_gobuster,
  cmd_hydra,
  cmd_ssh,
  cmd_nc,
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

export const executeCommand = (
  line: string,
  machine: CommandContext['machine'],
  allMachines: CommandContext['allMachines'],
  currentMissionId: number,
  onMsfStateChange?: (state: MsfState | null) => void,
  currentDir: string = '/',
  setCurrentDir?: (dir: string) => void
): CommandResponse => {
  const parts = line.trim().split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);

  let result: CommandResponse;

  const ctx: CommandContext = { machine, allMachines, currentMissionId, currentDir, setCurrentDir };

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
export const getMsfPrompt = () => {
  if (!_msfState?.active) return null;
  // Windows cmd shell takes priority
  if (_msfState.shellMode) {
    return 'C:\\Windows\\system32> ';
  }
  // If meterpreter session is open, show meterpreter prompt
  if (_msfState.sessionOpen) {
    return 'meterpreter > ';
  }
  if (_msfState.module) {
    const short = _msfState.module.split('/').slice(-2).join('/');
    const type = _msfState.module.startsWith('auxiliary') ? 'auxiliary' : 'exploit';
    return `msf6 ${type}(${short}) > `;
  }
  return 'msf6 > ';
};

// ── Get a snapshot of the current MSF state (for UI components) ──
export const getMsfState = () => _msfState ? { ...(_msfState) } : null;

// ── Re-export types for consumers ────────────────────────────────
export type { MsfState } from './tools';
