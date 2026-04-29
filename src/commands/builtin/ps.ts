// ── commands/builtin/ps.ts ─────────────────────────────────────────
// Simulador de ps - reporta estado de procesos
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';

interface Process {
  pid: number;
  tty: string;
  stat: string;
  time: string;
  command: string;
}

function generateProcesses(machineOs: string): Process[] {
  const isWindows = machineOs.toLowerCase().includes('windows');
  
  const commonProcesses: Process[] = [
    { pid: 1, tty: '?', stat: 'Ss', time: '00:00:01', command: isWindows ? 'System Idle Process' : 'init' },
    { pid: 2, tty: '?', stat: 'S', time: '00:00:00', command: isWindows ? 'System' : 'kthreadd' },
    { pid: 100, tty: '?', stat: 'Ss', time: '00:00:02', command: isWindows ? 'services.exe' : 'sshd' },
    { pid: 200, tty: '?', stat: 'S', time: '00:01:15', command: isWindows ? 'svchost.exe' : 'crond' },
    { pid: 300, tty: '?', stat: 'Ssl', time: '00:02:30', command: isWindows ? 'explorer.exe' : 'systemd-journal' },
    { pid: 500, tty: 'pts/0', stat: 'R+', time: '00:00:05', command: 'bash' },
    { pid: 600, tty: 'pts/0', stat: 'R+', time: '00:00:01', command: 'ps aux' },
  ];

  // Add OS-specific processes
  if (isWindows) {
    commonProcesses.push(
      { pid: 400, tty: '?', stat: 'S', time: '00:00:45', command: 'lsass.exe' },
      { pid: 450, tty: '?', stat: 'Ssl', time: '00:01:20', command: 'winlogon.exe' },
    );
  } else {
    commonProcesses.push(
      { pid: 350, tty: '?', stat: 'Ss', time: '00:00:30', command: 'nginx' },
      { pid: 360, tty: '?', stat: 'Ssl', time: '00:00:25', command: 'mysqld' },
      { pid: 370, tty: '?', stat: 'S', time: '00:00:15', command: 'rsyslogd' },
    );
  }

  return commonProcesses;
}

export const cmd_ps = {
  name: 'ps',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const isAux = args.includes('aux') || args.includes('-e') || args.includes('-ef');
    const machineOs = ctx.machine?.machine_info?.os || 'Linux';
    
    const processes = generateProcesses(machineOs);

    if (isAux) {
      // Full listing (ps aux)
      let output = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n';
      
      const users = ['root', 'root', 'www-data', 'mysql', 'syslog'];
      
      processes.forEach((proc, idx) => {
        const user = users[idx % users.length];
        const cpu = (Math.random() * 5).toFixed(1);
        const mem = (Math.random() * 10).toFixed(1);
        const vsz = Math.floor(Math.random() * 50000 + 10000);
        const rss = Math.floor(vsz * 0.3);
        
        output += `${user.padEnd(10)} ${proc.pid.toString().padStart(5)} ${cpu.padStart(4)} ${mem.padStart(4)} ${vsz.toString().padStart(6)} ${rss.toString().padStart(5)} ${proc.tty.padEnd(8)} ${proc.stat.padStart(4)} 00:00 ${proc.time.padStart(6)} ${proc.command}\n`;
      });
      
      return { output };
    } else {
      // Basic listing (ps)
      let output = '  PID TTY          TIME CMD\n';
      
      // Only show current shell processes
      const currentProcesses = processes.filter(p => 
        p.tty === 'pts/0' || p.command === 'bash'
      );
      
      currentProcesses.forEach(proc => {
        output += `${proc.pid.toString().padStart(5)} ${proc.tty.padEnd(12)} ${proc.time.padStart(8)} ${proc.command}\n`;
      });
      
      return { output };
    }
  }
};
