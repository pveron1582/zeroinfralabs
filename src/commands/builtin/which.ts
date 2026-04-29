// ── commands/builtin/which.ts ──────────────────────────────────────
// Simulador de which - localiza ejecutables
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';

// Comandos disponibles en el sistema y sus paths
const COMMAND_PATHS: Record<string, string> = {
  // Built-in commands
  'ls': '/bin/ls',
  'cat': '/bin/cat',
  'cd': '/bin/cd',
  'pwd': '/bin/pwd',
  'mkdir': '/bin/mkdir',
  'rmdir': '/bin/rmdir',
  'rm': '/bin/rm',
  'cp': '/bin/cp',
  'mv': '/bin/mv',
  'touch': '/usr/bin/touch',
  'echo': '/bin/echo',
  'whoami': '/usr/bin/whoami',
  'id': '/usr/bin/id',
  'who': '/usr/bin/who',
  'w': '/usr/bin/w',
  'ifconfig': '/sbin/ifconfig',
  'ip': '/sbin/ip',
  'ping': '/bin/ping',
  'traceroute': '/usr/bin/traceroute',
  'ps': '/bin/ps',
  'top': '/usr/bin/top',
  'which': '/usr/bin/which',
  'whereis': '/usr/bin/whereis',
  'file': '/usr/bin/file',
  'grep': '/bin/grep',
  'awk': '/usr/bin/awk',
  'sed': '/bin/sed',
  'cut': '/usr/bin/cut',
  'sort': '/usr/bin/sort',
  'uniq': '/usr/bin/uniq',
  'wc': '/usr/bin/wc',
  'head': '/usr/bin/head',
  'tail': '/usr/bin/tail',
  'clear': '/usr/bin/clear',
  'exit': '/bin/exit',
  'help': '/usr/bin/help',
  'sudo': '/usr/bin/sudo',
  'su': '/bin/su',
  'passwd': '/usr/bin/passwd',
  'hashcat': '/usr/bin/hashcat',
  
  // Pentesting tools
  'nmap': '/usr/bin/nmap',
  'arp-scan': '/usr/bin/arp-scan',
  'netdiscover': '/usr/bin/netdiscover',
  'gobuster': '/usr/bin/gobuster',
  'hydra': '/usr/bin/hydra',
  'john': '/usr/bin/john',
  'nc': '/bin/nc',
  'netcat': '/bin/nc',
  'ssh': '/usr/bin/ssh',
  'scp': '/usr/bin/scp',
  'ftp': '/usr/bin/ftp',
  'sftp': '/usr/bin/sftp',
  'msfconsole': '/usr/bin/msfconsole',
  'msfvenom': '/usr/bin/msfvenom',
  'curl': '/usr/bin/curl',
  'wget': '/usr/bin/wget',
  'python': '/usr/bin/python3',
  'python3': '/usr/bin/python3',
  'perl': '/usr/bin/perl',
  'ruby': '/usr/bin/ruby',
  'php': '/usr/bin/php',
  'bash': '/bin/bash',
  'sh': '/bin/sh',
  'vim': '/usr/bin/vim',
  'vi': '/usr/bin/vi',
  'nano': '/usr/bin/nano',
  'apache2': '/usr/sbin/apache2',
  'nginx': '/usr/sbin/nginx',
  'mysql': '/usr/bin/mysql',
  'psql': '/usr/bin/psql',
};

export const cmd_which = {
  name: 'which',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.length === 0) {
      return { output: '', isError: false };
    }

    let output = '';
    let notFound: string[] = [];

    for (const cmd of args) {
      if (cmd.startsWith('-')) {
        // Skip options (like --all)
        continue;
      }
      
      const path = COMMAND_PATHS[cmd.toLowerCase()];
      if (path) {
        if (output) output += '\n';
        output += path;
      } else {
        notFound.push(cmd);
      }
    }

    if (notFound.length > 0 && output === '') {
      // No commands found - return empty (like real which)
      return { output: '' };
    }

    return { output };
  }
};
