// ── commands/executor.ts ─────────────────────────────────────────
// Núcleo de ejecución: parseo (env, pipes, redirección), dispatch de
// comandos, manejo de shells activos, estado MSF y bits SUID/SGID.

import type { CommandContext, CommandResponse, FileEntry } from '../types';
import { shellManager } from '../frameworks/shells';
import { getCurrentUser } from '../utils/users';
import { writeOutputToFile } from '../utils/redirection';
import { splitTopLevel, extractRedirection, expandCommandLine, splitArgs } from '../utils/shellParse';
import { getSuidEffectiveUser } from './suid';
import { cmd_msfconsole, executeMsfCommand, type MsfState } from './tools';
import { executeShellCommand } from './shellIntegration';

export interface Command {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

export type MsfStateGetter = () => MsfState | null;
export type MsfStateSetter = (state: MsfState | null) => void;

function parseMsfResponse(
  result: CommandResponse,
  setState: MsfStateSetter
): CommandResponse {
  if (!('msfStateUpdate' in result)) return result;
  const state = result.msfStateUpdate ?? null;
  setState(state?.active ? state : null);
  const { msfStateUpdate: _discarded, ...rest } = result;
  return rest;
}

export function createMsfCommand(
  getState: MsfStateGetter,
  setState: MsfStateSetter
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

function runPipeline(
  segments: string[],
  ctx: CommandContext,
  commands: Map<string, Command>,
  getMsfState: MsfStateGetter,
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

export function executeCommandInternal(
  line: string,
  ctx: CommandContext,
  commands: Map<string, Command>,
  getMsfState: MsfStateGetter,
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
