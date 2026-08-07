// ── commands/builtin/ps.ts ─────────────────────────────────────────
// Simulador de ps - reporta estado de procesos (ROADMAP Fase 5.2)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';
import { list, type SimProcess } from '../../frameworks/process/processManager';
import { getCurrentUser } from '../../utils/users';

const START_TIME = '10:15';

function vszFor(pid: number): number {
  return 10000 + (pid % 50) * 800;
}

function rssFor(proc: SimProcess): number {
  return Math.floor(vszFor(proc.pid) * (proc.mem / 10 + 0.05));
}

function selfProcess(command: string): SimProcess {
  return {
    pid: 600,
    name: 'ps',
    user: 'root',
    cpu: 0.0,
    mem: 0.1,
    state: 'R+',
    tty: 'pts/0',
    time: '00:00:00',
    command,
  };
}

export const cmd_ps = {
  name: 'ps',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const procs = list(machine);
    const currentUser = getCurrentUser(machine).username;
    const commandLine = `ps ${args.join(' ')}`.trim();

    const isAux = args.includes('aux') || args.includes('-e');
    const isEf = args.includes('-ef') || args.includes('-f');

    if (isAux) {
      // ps aux / ps -e — listado completo estilo BSD
      const all = [...procs, { ...selfProcess(commandLine), user: currentUser }];
      let output = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n';
      all.forEach(proc => {
        output += `${proc.user.padEnd(10)} ${proc.pid.toString().padStart(5)} ${proc.cpu.toFixed(1).padStart(4)} ${proc.mem.toFixed(1).padStart(4)} ${vszFor(proc.pid).toString().padStart(6)} ${rssFor(proc).toString().padStart(5)} ${proc.tty.padEnd(8)} ${proc.state.padStart(4)} ${START_TIME} ${proc.time.padStart(6)} ${proc.command}\n`;
      });
      return { output };
    }

    if (isEf) {
      // ps -ef — formato estándar (UID PID PPID C STIME TTY TIME CMD)
      const all = [...procs, { ...selfProcess(commandLine), user: currentUser }];
      let output = 'USER       PID  PPID  C STIME TTY         TIME     CMD\n';
      all.forEach(proc => {
        const ppid = proc.pid === 1 ? 0 : proc.pid - 1;
        output += `${proc.user.padEnd(10)} ${proc.pid.toString().padStart(5)} ${ppid.toString().padStart(5)} ${Math.min(99, Math.round(proc.cpu)).toString().padStart(2)} ${START_TIME} ${proc.tty.padEnd(10)} ${proc.time.padStart(8)} ${proc.command}\n`;
      });
      return { output };
    }

    // ps — solo procesos del shell actual
    let output = '  PID TTY          TIME CMD\n';
    const shellProcs = [...procs, { ...selfProcess(commandLine), user: currentUser }].filter(p =>
      p.tty === 'pts/0' || p.command === 'bash'
    );
    shellProcs.forEach(proc => {
      output += `${proc.pid.toString().padStart(5)} ${proc.tty.padEnd(12)} ${proc.time.padStart(8)} ${proc.command}\n`;
    });
    return { output };
  }
};
