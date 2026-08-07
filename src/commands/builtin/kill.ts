// ── commands/builtin/kill.ts ────────────────────────────────────────
// Simulador de kill - termina procesos (ROADMAP Fase 5.4)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';
import { getProcess, killPid } from '../../frameworks/process/processManager';
import { getCurrentUser, isRoot } from '../../utils/users';

const SIGNALS: Record<string, number> = {
  HUP: 1, INT: 2, QUIT: 3, ILL: 4, TRAP: 5, ABRT: 6, BUS: 7, FPE: 8,
  KILL: 9, USR1: 10, SEGV: 11, USR2: 12, PIPE: 13, ALRM: 14, TERM: 15,
  STKFLT: 16, CHLD: 17, CONT: 18, STOP: 19, TSTP: 20, TTIN: 21, TTOU: 22,
  URG: 23, XCPU: 24, XFSZ: 25, VTALRM: 26, PROF: 27, WINCH: 28, IO: 29, PWR: 30, SYS: 31,
};

const SIGNAL_NAMES = Object.keys(SIGNALS);

// Señales que no terminan el proceso en Linux (handlers u operaciones de control)
const NON_FATAL_SIGNALS = new Set(['CONT', 'STOP', 'TSTP', 'TTIN', 'TTOU', 'USR1', 'USR2', 'WINCH', 'CHLD', 'URG', 'PWR', 'PROF', 'VTALRM', 'SYS']);

function signalNameOrNumber(value: string): string | null {
  const upper = value.toUpperCase();
  if (SIGNALS[upper] !== undefined) return upper;
  const num = Number(value);
  if (!isNaN(num) && SIGNAL_NAMES[num - 1]) return SIGNAL_NAMES[num - 1];
  return null;
}

export const cmd_kill = {
  name: 'kill',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.length === 0) {
      return { output: "kill: uso: kill [-s senal | -n | -SIGNAL] pid...", isError: true };
    }

    if (args.includes('-l') || args.includes('--list')) {
      let out = '';
      SIGNAL_NAMES.forEach((name, i) => {
        out += `${String(i + 1).padStart(2)} ${name}${(i + 1) % 5 === 0 ? '\n' : '   '}`;
      });
      return { output: out.trimEnd() };
    }

    // Parseo de señal y pids
    let signal = 'TERM';
    const pids: number[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-s' || arg === '--signal') {
        const raw = args[i + 1];
        if (raw) {
          const sig = signalNameOrNumber(raw);
          if (sig) signal = sig;
          else return { output: `kill: señal inválida: '${raw}'`, isError: true };
          i++;
        }
        continue;
      }
      if (/^-\d+$/.test(arg)) {
        const sig = signalNameOrNumber(arg.slice(1));
        if (sig) signal = sig;
        else return { output: `kill: señal inválida: '${arg.slice(1)}'`, isError: true };
        continue;
      }
      if (/^-[A-Za-z][A-Za-z0-9]*$/.test(arg)) {
        const sig = signalNameOrNumber(arg.slice(1));
        if (sig) signal = sig;
        else return { output: `kill: señal inválida: '${arg.slice(1)}'`, isError: true };
        continue;
      }
      const pid = Number(arg);
      if (Number.isInteger(pid) && pid > 0) pids.push(pid);
      else return { output: `kill: pid inválido: '${arg}'`, isError: true };
    }

    if (pids.length === 0) {
      return { output: "kill: uso: kill [-s senal | -n | -SIGNAL] pid...", isError: true };
    }

    const machine = ctx.machine;
    const currentUser = getCurrentUser(machine);

    for (const pid of pids) {
      const proc = getProcess(machine, pid);
      if (!proc) {
        return { output: `kill: (${pid}) - No existe tal proceso`, isError: true };
      }
      if (!isRoot(currentUser) && proc.user !== currentUser.username) {
        return { output: `kill: (${pid}) - Operation not permitted`, isError: true };
      }
      if (!NON_FATAL_SIGNALS.has(signal)) {
        killPid(machine, pid);
      }
    }

    // Como kill real, no imprime nada en caso de éxito
    return { output: '', isError: false };
  }
};
