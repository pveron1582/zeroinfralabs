// ── commands/executor.ts ─────────────────────────────────────────
// Núcleo de ejecución: parseo (env, pipes, redirección), dispatch de
// comandos, manejo de shells activos, estado MSF y bits SUID/SGID.

import type { CommandContext, CommandResponse, FileEntry } from '../types';
import { shellManager } from '../frameworks/shells';
import { getCurrentUser, getExecutionSuUser, setExecutionSuUser } from '../utils/users';
import { writeOutputToFile } from '../utils/redirection';
import { capOutput } from '../utils/format';
import { splitTopLevel, extractRedirection, expandCommandLine, splitArgs } from '../utils/shellParse';
import { getSuidEffectiveUser } from './suid';
import { cmd_msfconsole, executeMsfCommand } from './tools';
import { WINDOWS_COMMANDS } from './windows';
import { executePsLine } from './powershell';
import type { MsfState, PsState } from '../types';
import { executeShellCommand } from './shellIntegration';

export interface Command {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

export type MsfStateGetter = () => MsfState | null;
export type MsfStateSetter = (state: MsfState | null) => void;
export type PsStateGetter = () => PsState | null;
export type PsStateSetter = (state: PsState | null) => void;

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

function parsePsResponse(
  result: CommandResponse,
  setState: PsStateSetter
): CommandResponse {
  if (!('psStateUpdate' in result)) return result;
  const state = result.psStateUpdate ?? null;
  setState(state?.active ? state : null);
  const { psStateUpdate: _discarded, ...rest } = result;
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

// ── Expansión de alias (primera palabra de cada segmento) ─────────
// Reemplazo textual del primer token preservando el resto verbatim
// (no se re-tokeniza: el quoting del resto queda intacto). Sin
// recursión infinita: máximo 8 niveles y corte en ciclos.
function firstTokenSpan(s: string): { token: string; start: number; end: number } | null {
  let i = 0;
  while (i < s.length && /\s/.test(s[i])) i++;
  if (i >= s.length) return null;
  if (s[i] === '"' || s[i] === "'") {
    const q = s[i];
    const j = s.indexOf(q, i + 1);
    const end = j === -1 ? s.length : j + 1;
    return { token: s.slice(i + 1, j === -1 ? s.length : j), start: i, end };
  }
  let j = i;
  while (j < s.length && !/\s/.test(s[j])) j++;
  return { token: s.slice(i, j), start: i, end: j };
}

export function expandAlias(line: string, aliases?: Map<string, string>): string {
  if (!aliases || aliases.size === 0) return line;
  let cur = line;
  const seen = new Set<string>();
  for (let d = 0; d < 8; d++) {
    const span = firstTokenSpan(cur);
    if (!span) return cur;
    const val = aliases.get(span.token);
    if (val === undefined || seen.has(span.token)) return cur;
    seen.add(span.token);
    cur = cur.slice(0, span.start) + val + cur.slice(span.end);
  }
  return cur;
}

function runPipeline(
  segments: string[],
  ctx: CommandContext,
  commands: Map<string, Command>,
  getMsfState: MsfStateGetter,
  onMsfStateChange?: (state: MsfState | null) => void,
  getPsState?: PsStateGetter,
  setPsState?: PsStateSetter,
  onPsStateChange?: (state: PsState | null) => void
): CommandResponse {
  let pipedInput: string | undefined;
  let result: CommandResponse = { output: '' };
  const allChanged: FileEntry[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segCtx: CommandContext = i === 0 ? ctx : { ...ctx, pipedInput };
    const segResult = executeCommandInternal(
      segments[i], segCtx, commands, getMsfState, onMsfStateChange,
      getPsState, setPsState, onPsStateChange,
    );
    if (segResult.filesChanged) allChanged.push(...segResult.filesChanged);
    if (i === 0) {
      result = segResult;
    } else {
      // Merge de metadatos: la salida es la del último segmento, pero los
      // metadatos (fileRead, privesc, blockingCommand, foundCredentials,
      // httpRequest, ...) de TODOS los segmentos se preservan para el
      // LabValidator (ej. `cat flag | grep x` debe validar fileRead).
      const hadError = result.isError || segResult.isError;
      result = { ...result, ...segResult, output: segResult.output };
      if (hadError) result.isError = true;
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
  onMsfStateChange?: (state: MsfState | null) => void,
  getPsState?: PsStateGetter,
  setPsState?: PsStateSetter,
  onPsStateChange?: (state: PsState | null) => void
): CommandResponse {
  // Identidad de ejecución (aislamiento por terminal): el su del frame de
  // ESTA terminal gana sobre machine.su_user compartido mientras corre el
  // comando y se restaura siempre (try/finally). Cubre los ~72 call sites de
  // getCurrentUser sin tocarlos — pipes, MSF y PowerShell pasan por aquí.
  const prevSu = getExecutionSuUser();
  setExecutionSuUser(ctx.suUserOverride);
  try {
    // `cmd /c <comando>` (y análogos) necesita reentrar al dispatcher con el
    // mismo registro/estado. Se inyecta acá para que el comando no tenga que
    // conocer los getters de MSF/PowerShell; `childLines` corta los ciclos de
    // alias que expanden a `cmd /c <mismo alias>` (un guard por nivel no basta).
    const chain = [...(ctx.childLines ?? []), line];
    const childCtx: CommandContext = {
      ...ctx,
      runChild: (childLine: string): CommandResponse => {
        if (chain.includes(childLine)) {
          return {
            output: `Ciclo detectado al expandir '${childLine}' (alias recursivo).`,
            isError: true,
          };
        }
        return executeCommandInternal(
          childLine, { ...ctx, childLines: chain },
          commands, getMsfState, onMsfStateChange,
          getPsState, setPsState, onPsStateChange,
        );
      },
    };
    // Un solo punto de recorte para TODA salida de comando (P1 3.7): sin
    // esto, una sola llamada puede dejar 1.7 MB / 100k líneas en el estado
    // del terminal y la pestaña deja de responder.
    const result = executeCommandBody(
      line, childCtx, commands, getMsfState, onMsfStateChange,
      getPsState, setPsState, onPsStateChange,
    );
    if (typeof result.output !== 'string') return result;
    const capped = capOutput(result.output);
    return capped === result.output ? result : { ...result, output: capped };
  } finally {
    setExecutionSuUser(prevSu);
  }
}

function executeCommandBody(
  line: string, ctx: CommandContext, commands: Map<string, Command>, getMsfState: MsfStateGetter,
  onMsfStateChange?: (state: MsfState | null) => void, getPsState?: PsStateGetter,
  setPsState?: PsStateSetter, onPsStateChange?: (state: PsState | null) => void
): CommandResponse {
  if (shellManager.isActive(ctx.terminalId)) {
    // executeShellCommand emite los metadatos de cierre del tipo correcto
    // (ftp/ssh): no sobrescribir con un estado FTP genérico.
    return executeShellCommand(line, ctx);
  }

  const msfState = getMsfState();

  if (msfState?.active) {
    const msfCmd = commands.get('msfconsole')!;
    const result = msfCmd.execute([line], ctx);
    if (onMsfStateChange) onMsfStateChange(getMsfState());
    return result;
  }

  // ── Sesión PowerShell activa (W2): toda la línea va al dispatcher PS ──
  // Antes del split de pipes: executePsLine maneja pipes internamente.
  const psState = getPsState?.();
  if (psState?.active) {
    // PowerShell ejecuta exes nativos cuando el nombre no es cmdlet/alias.
    // Mismo dual que el camino normal: WINDOWS_COMMANDS en máquinas
    // Windows y el registro base como fallback.
    const nativeDispatch = (rawStage: string): CommandResponse | null => {
      const parts = splitArgs(rawStage);
      const name = parts[0];
      if (!name) return null;
      const isWin = ctx.machine?.machine_info?.family === 'windows';
      const nativeCmd = (isWin ? WINDOWS_COMMANDS.get(name) : undefined) ?? commands.get(name);
      if (!nativeCmd) return null;
      return nativeCmd.execute(parts.slice(1), ctx);
    };
    const result = executePsLine(line, ctx, nativeDispatch);
    if ('psStateUpdate' in result) {
      const state = result.psStateUpdate ?? null;
      const next: PsState | null = state?.active ? state : null;
      setPsState?.(next);
      onPsStateChange?.(next);
      const { psStateUpdate: _out, ...rest } = result;
      return rest;
    }
    return result;
  }

  // ── Normal command path: env expansion + pipes + redirection ──
  const expanded = ctx.env ? expandCommandLine(line, ctx.env) : line;

  // Alias por segmento de pipe (solo primera palabra, como bash)
  const aliased = ctx.shellAliases && ctx.shellAliases.size > 0
    ? splitTopLevel(expanded, '|').map(seg => expandAlias(seg, ctx.shellAliases)).join(' | ')
    : expanded;

  const pipeSegments = splitTopLevel(aliased, '|');
  if (pipeSegments.length > 1) {
    return runPipeline(
      pipeSegments, ctx, commands, getMsfState, onMsfStateChange,
      getPsState, setPsState, onPsStateChange,
    );
  }

  const redir = extractRedirection(aliased);
  const cmdLine = redir ? redir.command : aliased;
  const parts = splitArgs(cmdLine);
  const cmdName = parts[0] ?? '';
  const args = parts.slice(1);

  // Dispatch dual: máquinas Windows usan WINDOWS_COMMANDS (cmd.exe);
  // los nombres no listados caen al registro POSIX base.
  const isWinMachine = ctx.machine?.machine_info?.family === 'windows';
  const cmd = (isWinMachine ? WINDOWS_COMMANDS.get(cmdName) : undefined)
    ?? commands.get(cmdName);
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
      const suidResult = cmd.execute(finalArgs, ctx);
      result = {
        ...suidResult,
        // El intento se reporta siempre; la escalada SOLO se marca si el
        // comando tuvo éxito (un SUID que falla no otorga root).
        privescAttempted: true,
        privescTool: cmdName,
        ...(suidResult.isError ? {} : { privescCompleted: ctx.machine.id }),
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

  // Aplicar actualizaciones de estado PS emitidas por cmd_powershell
  // (inicio de sesión o one-shot que emita psStateUpdate).
  if (setPsState && 'psStateUpdate' in result) {
    result = parsePsResponse(result, setPsState);
    // Tras aplicar, notificar al hook con el estado ya mutado
    onPsStateChange?.(getPsState?.() ?? null);
  }

  if (onMsfStateChange) onMsfStateChange(getMsfState());

  return result;
}

