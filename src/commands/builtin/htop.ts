// ── commands/builtin/htop.ts ────────────────────────────────────────
// Simulador de htop - visor de procesos interactivo con colores
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Implementado como comando bloqueante interactivo.

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_htop = {
  name: 'htop',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const machineOs = machine?.machine_info?.os || 'Linux';
    const hostname = machine?.machine_info?.hostname || 'localhost';
    const isWindows = machineOs.toLowerCase().includes('windows');
    
    // Generate simulated uptime
    const days = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const uptime = `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Generate load averages
    const load1 = (Math.random() * 2).toFixed(2);
    const load5 = (Math.random() * 1.5).toFixed(2);
    const load15 = (Math.random() * 1).toFixed(2);
    
    // Generate CPU stats with visual bars
    const cpus = [
      { num: 0, usage: Math.floor(Math.random() * 80) + 10 },
      { num: 1, usage: Math.floor(Math.random() * 80) + 10 },
    ];
    
    // Generate memory stats with visual bars
    const totalMem = 8192;
    const usedMem = Math.floor(Math.random() * 6000) + 1000;
    const memPercent = Math.floor((usedMem / totalMem) * 100);
    
    // Generate swap stats
    const totalSwap = 2048;
    const usedSwap = Math.floor(Math.random() * 500);
    const swapPercent = Math.floor((usedSwap / totalSwap) * 100);
    
    // Build htop-style output with ASCII art bars
    let output = '┌─────────────────────────────────────────────────────────────────┐\n';
    
    // CPU bars
    cpus.forEach(cpu => {
      const bar = '█'.repeat(Math.floor(cpu.usage / 5)) + '░'.repeat(20 - Math.floor(cpu.usage / 5));
      output += `│ CPU${cpu.num} [${bar}] ${cpu.usage.toString().padStart(3)}% │\n`;
    });
    
    // Memory bar
    const memBar = '█'.repeat(Math.floor(memPercent / 5)) + '░'.repeat(20 - Math.floor(memPercent / 5));
    output += `│ Mem [${memBar}] ${memPercent.toString().padStart(3)}% ${usedMem}M/${totalMem}M │\n`;
    
    // Swap bar
    const swapBar = '█'.repeat(Math.floor(swapPercent / 5)) + '░'.repeat(20 - Math.floor(swapPercent / 5));
    output += `│ Swp [${swapBar}] ${swapPercent.toString().padStart(3)}% ${usedSwap}M/${totalSwap}M │\n`;
    
    output += '└─────────────────────────────────────────────────────────────────┘\n';
    
    // Header info
    output += `Tasks: ${Math.floor(Math.random() * 50 + 100)}, ${Math.floor(Math.random() * 5 + 1)} thr; ${load1} ${load5} ${load15} load average\n`;
    output += `Uptime: ${uptime}\n\n`;
    
    // Process list header
    output += '  PID USER  PRI NI  VIRT   RES   SHR S  CPU% MEM%   TIME+   Command\n';
    
    // Generate processes with colorful indicators
    const processes = [
      { pid: 1, user: 'root', pri: 20, ni: 0, cpu: 0.0, mem: 0.1, cmd: isWindows ? 'System' : 'systemd', color: 'green' },
      { pid: 100, user: 'root', pri: 20, ni: 0, cpu: 1.2, mem: 0.5, cmd: isWindows ? 'svchost.exe' : 'sshd', color: 'blue' },
      { pid: 200, user: 'www-data', pri: 20, ni: 0, cpu: 5.5, mem: 2.8, cmd: isWindows ? 'httpd.exe' : 'nginx', color: 'cyan' },
      { pid: 300, user: 'mysql', pri: 20, ni: 0, cpu: 8.2, mem: 6.5, cmd: 'mysqld', color: 'yellow' },
      { pid: 500, user: 'root', pri: 20, ni: 0, cpu: 0.5, mem: 0.4, cmd: 'bash', color: 'white' },
      { pid: 600, user: 'root', pri: 20, ni: 0, cpu: 12.5, mem: 0.8, cmd: 'htop', color: 'green' },
    ];
    
    processes.forEach((proc, idx) => {
      const virt = Math.floor(Math.random() * 50000 + 10000);
      const res = Math.floor(virt * 0.1);
      const shr = Math.floor(res * 0.5);
      const s = proc.cmd === 'htop' ? 'R' : 'S';
      const cpu = proc.cpu.toFixed(1);
      const mem = proc.mem.toFixed(1);
      const time = `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}.${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
      const marker = idx === 5 ? '>' : ' '; // Highlight htop process
      
      output += `${marker}${proc.pid.toString().padStart(5)} ${proc.user.padEnd(6)} ${proc.pri.toString().padStart(3)} ${proc.ni.toString().padStart(3)} ${virt.toString().padStart(6)} ${res.toString().padStart(5)} ${shr.toString().padStart(5)} ${s} ${cpu.padStart(5)} ${mem.padStart(4)} ${time.padStart(7)}  ${proc.cmd}\n`;
    });
    
    output += '\n';
    output += 'F1Help  F2Setup F3SearchF4FilterF5Tree  F6SortByF7Nice-F8Nice+F9Kill F10Quit\n';
    output += '\nPress \'q\' or F10 to exit.';

    // Return as blocking command - user needs to press 'q' or F10 to exit
    return {
      output,
      blockingCommand: {
        message: 'htop running...',
        cancelKey: 'q',
        clearScreen: true,
      }
    };
  }
};
