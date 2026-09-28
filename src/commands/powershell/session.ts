// ── commands/powershell/session.ts ────────────────────────────────
// Sesión PowerShell (PLAN_WINDOWS W2): cmd_powershell inicia el REPL o
// ejecuta un one-shot con -Command/-c. executePsLine parsea la línea,
// resuelve alias, encadena pipes (splitTopLevel) y dispatcha a cmdlets.
// `exit`/`quit` desactivan la sesión vía psStateUpdate: null.

import type { CommandContext, CommandResponse, PsState } from '../../types';
import { splitTopLevel } from '../../utils/shellParse';
import { winUser } from '../windows/helpers';
import { parsePsLine, type PsInvocation } from './parser';
import { resolvePsCommand, PS_ALIASES } from './aliases';
import { getPsCmdlet, listPsCmdletNames } from './cmdlets';

// El prompt NO va en el banner: lo dibuja la terminal en la línea de input.
// Si lo imprimiéramos acá aparecería dos veces (una en el output y otra en
// la línea editable), que es justo el "prompt un renglón abajo" del reporte.
const PS_BANNER = [
  'Windows PowerShell',
  'Copyright (C) Microsoft Corporation. All rights reserved.',
  '',
  'Instala la última versión de PowerShell: https://aka.ms/PSWindowsUpdate',
].join('\n');

/**
 * Dispatcher nativo inyectado por el executor: PowerShell ejecuta exes de
 * cmd.exe (`whoami`, `ping`, `echo`, ...) cuando el nombre no es cmdlet.
 * Devuelve null si tampoco existe, para que session.ts emita su error.
 */
export type PsNativeDispatch = (rawStage: string) => CommandResponse | null;

function startSession(_ctx: CommandContext): CommandResponse {
  const state: PsState = { active: true };
  return {
    output: PS_BANNER,
    psStateUpdate: state,
  };
}

function oneShot(commandLine: string, ctx: CommandContext): CommandResponse {
  return executePsLine(commandLine, ctx);
}

function runInvocation(
  inv: PsInvocation,
  ctx: CommandContext,
  native?: PsNativeDispatch,
  rawStage?: string,
): CommandResponse {
  const canonical = resolvePsCommand(inv.rawName);
  // Sesión: exit/quit terminan el REPL
  if (canonical === 'exit' || inv.rawName.toLowerCase() === 'exit' || inv.rawName.toLowerCase() === 'quit') {
    return { output: '', psStateUpdate: null };
  }

  const exec = getPsCmdlet(canonical);
  if (!exec) {
    // No es cmdlet/alias: PowerShell intenta el exe nativo (cmd.exe/POSIX)
    // antes de fallar, igual que la shell real.
    if (native && rawStage) {
      const nativeResult = native(rawStage);
      if (nativeResult) return nativeResult;
    }
    const names = listPsCmdletNames().join(', ');
    return {
      output: `get-command : El término '${inv.rawName}' no se reconoce como cmdlet. Cmdlets disponibles: ${names}`,
      isError: true,
    };
  }

  // Aplicar nombre canónico para cmdlets que inspeccionan inv.rawName
  const resolved: PsInvocation = { ...inv, name: canonical };
  const result = exec(resolved, ctx);
  // Los cmdlets pueden emitir clearScreen u otros flags — pasar tal cual
  return result;
}

/**
 * Ejecuta una línea completa dentro de la sesión PS (o one-shot).
 * Soporta pipes `a | b | c` reutilizando splitTopLevel; la salida de cada
 * etapa se pasa como stdin de texto a la siguiente (mismo contrato que el shell).
 * `native` (opcional) resuelve exes de cmd.exe/POSIX cuando no hay cmdlet.
 */
export function executePsLine(
  line: string,
  ctx: CommandContext,
  native?: PsNativeDispatch,
): CommandResponse {
  const trimmed = line.trim();
  if (!trimmed) return { output: '' };

  // exit fuera de pipe (caso común)
  const low = trimmed.toLowerCase();
  if (low === 'exit' || low === 'quit') {
    return { output: '', psStateUpdate: null };
  }

  const stages = splitTopLevel(trimmed, '|');
  if (stages.length === 0) return { output: '' };

  let last: CommandResponse = { output: '' };
  let pipedInput = '';

  for (const stage of stages) {
    const inv = parsePsLine(stage);
    if (!inv) continue;

    // Inyectar stdin textual como si fuera un positional extra (v1):
    // los cmdlets de texto (Get-Content) no lo usan; Select-String no existe aún.
    // Dejamos pipedInput disponible para futuros cmdlets de filtro.
    void pipedInput;

    last = runInvocation(inv, ctx, native, stage);
    if (last.isError && stages.length > 1) break;
    pipedInput = last.output ?? '';
  }

  // Propagar psStateUpdate de cualquier etapa (exit en pipe)
  return last;
}

/**
 * cmd_powershell — único punto de entrada desde el executor normal.
 *  · sin args            → inicia sesión (psStateUpdate: { active: true })
 *  · -Command/-c "/c"    → one-shot, NO activa sesión
 *  · ya activo           → no debería llegar aquí (executor intercepta antes)
 */
export const cmd_powershell = {
  name: 'powershell',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    void winUser(context);

    // -Command / -c / /c → one-shot
    const flagIdx = args.findIndex(a => {
      const l = a.toLowerCase();
      return l === '-command' || l === '-c' || l === '/c' || l === '-command:';
    });
    if (flagIdx !== -1) {
      // Valor pegado con : o como token siguiente (puede contener espacios)
      const flag = args[flagIdx];
      const inline = flag.includes(':') ? flag.slice(flag.indexOf(':') + 1) : '';
      const rest = inline || args.slice(flagIdx + 1).join(' ');
      if (!rest) {
        return { output: 'powershell: -Command requiere un comando.', isError: true };
      }
      return oneShot(rest, context);
    }

    // -Help / -? → ayuda sin sesión
    if (args.length > 0 && (args[0] === '-?' || args[0].toLowerCase() === '-help')) {
      return {
        output: [
          'USAGE',
          '  powershell                  Inicia la sesión interactiva',
          '  powershell -Command "<ps>"  Ejecuta un cmdlet sin abrir sesión',
          '  exit                        Cierra la sesión (dentro del REPL)',
          '',
          `Cmdlets: ${listPsCmdletNames().join(', ')}`,
          `Alias:   ${Object.keys(PS_ALIASES).filter(a => a !== 'exit' && a !== 'quit').join(', ')}`,
        ].join('\n'),
      };
    }

    if (args.length > 0) {
      // Sin flag reconocido: tratar como one-shot defensivo
      return oneShot(args.join(' '), context);
    }

    return startSession(context);
  },
};
