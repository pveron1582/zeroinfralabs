// ── commands/builtin/htop.ts ────────────────────────────────────────
// Simulador de htop - visor de procesos interactivo con colores (ROADMAP Fase 5.3)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Implementado como comando bloqueante interactivo.

import type { CommandContext, CommandResponse } from '../../types';
import { list, type SimProcess } from '../../frameworks/process/processManager';
import { getCurrentUser } from '../../utils/users';

function virtFor(pid: number): number {
  return 10000 + (pid % 50) * 800;
}

export const cmd_htop = {
  name: 'htop',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const currentUser = getCurrentUser(machine).username;
    const procs: SimProcess[] = [
      ...list(machine),
      { pid: 600, name: 'htop', user: currentUser, cpu: 12.5, mem: 0.8, state: 'R', tty: 'pts/0', time: '00:00:02', command: 'htop' },
    ];

    // Datos del sistema simulados
    const days = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const uptime = `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const load1 = (Math.random() * 2).toFixed(2);
    const load5 = (Math.random() * 1.5).toFixed(2);
    const load15 = (Math.random() * 1).toFixed(2);

    const cpus = [
      { num: 0, usage: Math.floor(Math.random() * 80) + 10 },
      { num: 1, usage: Math.floor(Math.random() * 80) + 10 },
    ];

    const totalMem = 8192;
    const usedMem = Math.floor(Math.random() * 6000) + 1000;
    const memPercent = Math.floor((usedMem / totalMem) * 100);

    const totalSwap = 2048;
    const usedSwap = Math.floor(Math.random() * 500);
    const swapPercent = Math.floor((usedSwap / totalSwap) * 100);

    let output = '┌─────────────────────────────────────────────────────────────────┐\n';

    cpus.forEach(cpu => {
      const bar = '█'.repeat(Math.floor(cpu.usage / 5)) + '░'.repeat(20 - Math.floor(cpu.usage / 5));
      output += `│ CPU${cpu.num} [${bar}] ${cpu.usage.toString().padStart(3)}% │\n`;
    });

    const memBar = '█'.repeat(Math.floor(memPercent / 5)) + '░'.repeat(20 - Math.floor(memPercent / 5));
    output += `│ Mem [${memBar}] ${memPercent.toString().padStart(3)}% ${usedMem}M/${totalMem}M │\n`;

    const swapBar = '█'.repeat(Math.floor(swapPercent / 5)) + '░'.repeat(20 - Math.floor(swapPercent / 5));
    output += `│ Swp [${swapBar}] ${swapPercent.toString().padStart(3)}% ${usedSwap}M/${totalSwap}M │\n`;

    output += '└─────────────────────────────────────────────────────────────────┘\n';

    output += `Tasks: ${Math.floor(Math.random() * 50 + 100)}, ${Math.floor(Math.random() * 5 + 1)} thr; ${load1} ${load5} ${load15} load average\n`;
    output += `Uptime: ${uptime}\n\n`;

    output += '  PID USER  PRI NI  VIRT   RES   SHR S  CPU% MEM%   TIME+   Command\n';

    procs.forEach(proc => {
      const pri = 20;
      const ni = 0;
      const virt = virtFor(proc.pid);
      const res = Math.floor(virt * (proc.mem / 10 + 0.05));
      const shr = Math.floor(res * 0.5);
      const marker = proc.name === 'htop' ? '>' : ' ';

      output += `${marker}${proc.pid.toString().padStart(5)} ${proc.user.padEnd(6)} ${pri.toString().padStart(3)} ${ni.toString().padStart(3)} ${virt.toString().padStart(6)} ${res.toString().padStart(5)} ${shr.toString().padStart(5)} ${proc.state} ${proc.cpu.toFixed(1).padStart(5)} ${proc.mem.toFixed(1).padStart(4)} ${proc.time.padStart(7)}  ${proc.name}\n`;
    });

    output += '\n';
    output += 'F1Help  F2Setup F3SearchF4FilterF5Tree  F6SortByF7Nice-F8Nice+F9Kill F10Quit\n';
    output += '\nPress \'q\' or F10 to exit.';

    // Comando bloqueante - el usuario debe presionar 'q' o F10 para salir
    return {
      output,
      type: 'blocking',
      blockingCommand: {
        message: 'htop running...',
        cancelKey: 'q',
        clearScreen: true,
      }
    };
  }
};
