// ── commands/builtin/which.ts ──────────────────────────────────────
// Simulador de which - localiza ejecutables
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';
import { isInstalled } from '../../frameworks/packages/packageManager';

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
  'ftp': '/usr/bin/ftp',
  'sftp': '/usr/bin/sftp',
  'msfconsole': '/usr/bin/msfconsole',
  'msfvenom': '/usr/bin/msfvenom',
  'curl': '/usr/bin/curl',
  'wget': '/usr/bin/wget',
  'dig': '/usr/bin/dig',
  'nslookup': '/usr/bin/nslookup',
  'whois': '/usr/bin/whois',
  'tcpdump': '/usr/bin/tcpdump',
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
  'kill': '/bin/kill',
  'systemctl': '/bin/systemctl',
  'service': '/usr/sbin/service',
  'journalctl': '/usr/bin/journalctl',
  'iptables': '/usr/sbin/iptables',
  'ufw': '/usr/sbin/ufw',
  'ss': '/usr/sbin/ss',
  'netstat': '/usr/bin/netstat',
  'apache2': '/usr/sbin/apache2',
  'nginx': '/usr/sbin/nginx',
  'mysql': '/usr/bin/mysql',
  'psql': '/usr/bin/psql',
  'apt': '/usr/bin/apt',
  'apt-get': '/usr/bin/apt-get',
  'dpkg': '/usr/bin/dpkg',
  'env': '/usr/bin/env',
  'export': '/bin/export',
  'unset': '/bin/unset',
  'crontab': '/usr/bin/crontab',
  'date': '/bin/date',
  'sleep': '/bin/sleep',
  'mount': '/usr/bin/mount',
  'umount': '/usr/bin/umount',
  'df': '/usr/bin/df',
  'du': '/usr/bin/du',
  'ln': '/bin/ln',
  'basename': '/usr/bin/basename',
  'dirname': '/usr/bin/dirname',
  'realpath': '/usr/bin/realpath',
  'md5sum': '/usr/bin/md5sum',
  'sha256sum': '/usr/bin/sha256sum',
  'base64': '/usr/bin/base64',
  'strings': '/usr/bin/strings',
  'find': '/usr/bin/find',
  'stat': '/usr/bin/stat',
  'less': '/usr/bin/less',
  'more': '/bin/more',
  'uname': '/bin/uname',
  'hostname': '/bin/hostname',
  'uptime': '/usr/bin/uptime',
  'free': '/usr/bin/free',
  'arch': '/usr/bin/arch',
  'hostnamectl': '/usr/bin/hostnamectl',
  'lsb_release': '/usr/bin/lsb_release',
  'last': '/usr/bin/last',
  'lscpu': '/usr/bin/lscpu',
  'man': '/usr/bin/man',
  'whatis': '/usr/bin/whatis',
  'apropos': '/usr/bin/apropos',
  'tr': '/usr/bin/tr',
  'tac': '/usr/bin/tac',
  'nl': '/usr/bin/nl',
  'rev': '/usr/bin/rev',
  'column': '/usr/bin/column',
  'diff': '/usr/bin/diff',
  'nproc': '/usr/bin/nproc',
  'seq': '/usr/bin/seq',
  'tee': '/usr/bin/tee',
};

const CMD_TO_PACKAGE: Record<string, string> = {
  nmap: 'nmap',
  hydra: 'hydra',
  gobuster: 'gobuster',
  curl: 'curl',
  wget: 'wget',
  python3: 'python3',
  python: 'python3',
  vim: 'vim',
  vi: 'vim',
  nano: 'nano',
  iptables: 'iptables',
  ufw: 'ufw',
  ifconfig: 'net-tools',
  netstat: 'net-tools',
  ip: 'iproute2',
  ss: 'iproute2',
  hashcat: 'hashcat',
  john: 'john',
  msfconsole: 'metasploit-framework',
  ssh: 'openssh-client',
  scp: 'openssh-client',
  nc: 'netcat-traditional',
  netcat: 'netcat-traditional',
  git: 'git',
};

export const cmd_which = {
  name: 'which',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.length === 0) {
      return { output: '', isError: false };
    }

    const showAll = args.includes('-a') || args.includes('--all');
    void showAll;

    let output = '';
    const notFound: string[] = [];

    for (const cmd of args) {
      if (cmd.startsWith('-')) {
        continue;
      }
      const key = cmd.toLowerCase();
      const path = COMMAND_PATHS[key];
      if (path) {
        const pkg = CMD_TO_PACKAGE[key];
        if (pkg && ctx.machine?.id && !isInstalled(ctx.machine, pkg)) {
          notFound.push(cmd);
          continue;
        }
        if (output) output += '\n';
        output += path;
      } else {
        notFound.push(cmd);
      }
    }

    if (notFound.length > 0 && output === '') {
      return { output: '' };
    }

    return { output };
  }
};
