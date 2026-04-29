// ── commands/builtin/top.ts ────────────────────────────────────────
// Simulador de top - vista dinámica de procesos
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Implementado como comando bloqueante interactivo.

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_top = {
  name: 'top',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const machineOs = machine?.machine_info?.os || 'Linux';
    const hostname = machine?.machine_info?.hostname || 'localhost';
    const isWindows = machineOs.toLowerCase().includes('windows');
    
    // Generate simulated uptime
    const days = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const uptime = `${days} day${days !== 1 ? 's' : ''}, ${hours}:${minutes.toString().padStart(2, '0')}`;
    
    // Generate load averages
    const load1 = (Math.random() * 2).toFixed(2);
    const load5 = (Math.random() * 1.5).toFixed(2);
    const load15 = (Math.random() * 1).toFixed(2);
    
    // Generate users count
    const users = Math.floor(Math.random() * 3) + 1;
    
    // Generate process counts
    const totalTasks = Math.floor(Math.random() * 50) + 100;
    const running = Math.floor(Math.random() * 5) + 1;
    const sleeping = totalTasks - running;
    
    // Generate CPU stats
    const us = Math.floor(Math.random() * 20);
    const sy = Math.floor(Math.random() * 10);
    const ni = Math.floor(Math.random() * 5);
    const id = 100 - us - sy - ni - Math.floor(Math.random() * 10);
    const wa = Math.floor(Math.random() * 5);
    
    // Generate memory stats
    const totalMem = 8192;
    const freeMem = Math.floor(Math.random() * 2000) + 1000;
    const usedMem = totalMem - freeMem;
    
    // Header
    let output = `top - ${new Date().toLocaleTimeString()} up ${uptime}, ${users} user, load average: ${load1}, ${load5}, ${load15}\n`;
    output += `Tasks: ${totalTasks} total,   ${running} running, ${sleeping} sleeping,   0 stopped,   0 zombie\n`;
    output += `%Cpu(s): ${us.toString().padStart(3)}.0 us, ${sy.toString().padStart(3)}.0 sy, ${ni.toString().padStart(3)}.0 ni, ${id.toString().padStart(3)}.0 id, ${wa.toString().padStart(3)}.0 wa\n`;
    output += `MiB Mem : ${totalMem.toString().padStart(5)}.0 total, ${freeMem.toString().padStart(5)}.0 free, ${usedMem.toString().padStart(5)}.0 used\n`;
    output += `MiB Swap: 2048.0 total, 2048.0 free,    0.0 used\n`;
    output += '\n';
    
    // Process header
    output += '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n';
    
    // Generate fake processes with varying CPU/MEM
    const processes = [
      { pid: 1, user: 'root', cmd: isWindows ? 'System' : 'systemd', cpu: 0.0, mem: 0.1 },
      { pid: 100, user: 'root', cmd: isWindows ? 'svchost.exe' : 'sshd', cpu: 0.3, mem: 0.5 },
      { pid: 200, user: 'www-data', cmd: isWindows ? 'httpd.exe' : 'nginx', cpu: 1.5, mem: 2.0 },
      { pid: 300, user: 'mysql', cmd: 'mysqld', cpu: 2.0, mem: 5.5 },
      { pid: 500, user: 'root', cmd: 'bash', cpu: 0.1, mem: 0.3 },
      { pid: 600, user: 'root', cmd: 'top', cpu: 1.2, mem: 0.4 },
    ];
    
    processes.forEach(proc => {
      const pr = 20;
      const ni = 0;
      const virt = Math.floor(Math.random() * 50000 + 10000);
      const res = Math.floor(virt * 0.1);
      const shr = Math.floor(res * 0.5);
      const s = proc.cmd === 'top' ? 'R' : 'S';
      const cpu = proc.cpu.toFixed(1);
      const mem = proc.mem.toFixed(1);
      const time = `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}.${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
      
      output += `${proc.pid.toString().padStart(5)} ${proc.user.padEnd(8)} ${pr.toString().padStart(3)} ${ni.toString().padStart(3)} ${virt.toString().padStart(7)} ${res.toString().padStart(6)} ${shr.toString().padStart(6)} ${s} ${cpu.toString().padStart(5)} ${mem.toString().padStart(5)} ${time.padStart(9)} ${proc.cmd}\n`;
    });
    
    output += '\nPress \'q\' to exit.';

    // Return as blocking command - user needs to press 'q' to exit
    return {
      output,
      blockingCommand: {
        message: 'top running...',
        cancelKey: 'q',
        clearScreen: true,
      }
    };
  }
};
