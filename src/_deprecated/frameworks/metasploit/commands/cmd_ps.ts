// ── frameworks/metasploit/commands/cmd_ps.ts ───────────────────
// Ps command - list processes
// Available in: meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

const PROCESSES = [
  { pid: 0, ppid: 0, name: 'System Idle Process', arch: '', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 4, ppid: 0, name: 'System', arch: '', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 280, ppid: 4, name: 'smss.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 372, ppid: 280, name: 'csrss.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 428, ppid: 372, name: 'wininit.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 512, ppid: 428, name: 'services.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 520, ppid: 428, name: 'lsass.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 788, ppid: 512, name: 'svchost.exe', arch: 'x64', user: 'NT AUTHORITY\\SYSTEM' },
  { pid: 864, ppid: 512, name: 'svchost.exe', arch: 'x64', user: 'NT AUTHORITY\\NETWORK SERVICE' },
  { pid: 1204, ppid: 788, name: 'explorer.exe', arch: 'x64', user: 'WIN7-PC\\john' },
  { pid: 1456, ppid: 1204, name: 'notepad.exe', arch: 'x64', user: 'WIN7-PC\\john' },
];

export const cmd_ps: MsfCommand = {
  name: 'ps',
  description: 'List running processes',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    
    let out = '\nProcess List\n============\n\n';
    out += ' PID   PPID  Name                Arch  Session  User\n';
    out += ' ---   ----  ----                ----  -------  ----\n';
    
    PROCESSES.forEach(p => {
      out += ` ${p.pid.toString().padEnd(5)} ${p.ppid?.toString().padEnd(5) || '0    '} ${p.name.padEnd(19)} ${(p.arch || '').padEnd(5)} 0        ${p.user}\n`;
    });
    
    out += '\n';
    return withState(out, state);
  }
};
