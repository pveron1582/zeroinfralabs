// ── commands/builtin/top.ts ────────────────────────────────────────
// Simulador de top - vista dinámica de procesos (ROADMAP Fase 5.3)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Implementado como comando bloqueante interactivo.

import type { CommandContext, CommandResponse } from '../../types';
import { list, type SimProcess } from '../../frameworks/process/processManager';
import { getCurrentUser } from '../../utils/users';

function virtFor(pid: number): number {
  return 10000 + (pid % 50) * 800;
}

export const cmd_top = {
  name: 'top',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const currentUser = getCurrentUser(machine).username;
    const procs: SimProcess[] = [
      ...list(machine),
      { pid: 600, name: 'top', user: currentUser, cpu: 1.2, mem: 0.4, state: 'R', tty: 'pts/0', time: '00:00:01', command: 'top' },
    ];

    // Datos del sistema simulados
    const days = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const uptime = `${days} day${days !== 1 ? 's' : ''}, ${hours}:${minutes.toString().padStart(2, '0')}`;

    const load1 = (Math.random() * 2).toFixed(2);
    const load5 = (Math.random() * 1.5).toFixed(2);
    const load15 = (Math.random() * 1).toFixed(2);
    const users = Math.floor(Math.random() * 3) + 1;

    const totalTasks = Math.floor(Math.random() * 50) + 100;
    const running = Math.floor(Math.random() * 5) + 1;
    const sleeping = totalTasks - running;

    const us = Math.floor(Math.random() * 20);
    const sy = Math.floor(Math.random() * 10);
    const ni = Math.floor(Math.random() * 5);
    const id = Math.max(1, 100 - us - sy - ni - Math.floor(Math.random() * 10));
    const wa = Math.floor(Math.random() * 5);

    const totalMem = 8192;
    const freeMem = Math.floor(Math.random() * 2000) + 1000;
    const usedMem = totalMem - freeMem;

    let output = `top - ${new Date().toLocaleTimeString()} up ${uptime}, ${users} user, load average: ${load1}, ${load5}, ${load15}\n`;
    output += `Tasks: ${totalTasks} total,   ${running} running, ${sleeping} sleeping,   0 stopped,   0 zombie\n`;
    output += `%Cpu(s): ${us.toString().padStart(3)}.0 us, ${sy.toString().padStart(3)}.0 sy, ${ni.toString().padStart(3)}.0 ni, ${id.toString().padStart(3)}.0 id, ${wa.toString().padStart(3)}.0 wa\n`;
    output += `MiB Mem : ${totalMem.toString().padStart(5)}.0 total, ${freeMem.toString().padStart(5)}.0 free, ${usedMem.toString().padStart(5)}.0 used\n`;
    output += `MiB Swap: 2048.0 total, 2048.0 free,    0.0 used\n`;
    output += '\n';

    output += '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n';

    procs.forEach(proc => {
      const pr = 20;
      const ni = 0;
      const virt = virtFor(proc.pid);
      const res = Math.floor(virt * (proc.mem / 10 + 0.05));
      const shr = Math.floor(res * 0.5);
      const s = proc.state;
      const cpu = proc.cpu.toFixed(1);
      const mem = proc.mem.toFixed(1);
      const time = proc.time;

      output += `${proc.pid.toString().padStart(5)} ${proc.user.padEnd(8)} ${pr.toString().padStart(3)} ${ni.toString().padStart(3)} ${virt.toString().padStart(7)} ${res.toString().padStart(6)} ${shr.toString().padStart(6)} ${s} ${cpu.padStart(5)} ${mem.padStart(5)} ${time.padStart(9)} ${proc.name}\n`;
    });

    output += '\nPress \'q\' to exit.';

    // Comando bloqueante - el usuario debe presionar 'q' para salir
    return {
      output,
      type: 'blocking',
      blockingCommand: {
        message: 'top running...',
        cancelKey: 'q',
        clearScreen: true,
      }
    };
  }
};
