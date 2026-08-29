// ── commands/builtin/help.ts ──────────────────────────────────────
// Shows available command help

import type { CommandResponse } from '../../types';
import { COMMAND_HELP } from '../help';

export const cmd_help = {
  name: 'help',
  execute: (args: string[]): CommandResponse => {
    if (args.length === 0) {
      return {
        output: `Available commands:

--- System Commands ---
  help           - Show this help
  clear          - Clear the terminal
  whoami         - Current user info
  id [user]      - Display user identity
  groups [user]  - Show group membership
  su [user]      - Switch user
  sudo           - Execute command as root
  ifconfig       - Network configuration
  ls [dir]       - List files
  cd [dir]       - Change directory
  pwd            - Print working directory
  cat [file]     - Display file contents
  touch file     - Create empty file
  echo           - Display text or write file
  nano file      - File editor
  mkdir [-p] dir - Create directories
  rmdir [-p] dir - Remove empty directories
  rm [-rf] file  - Remove files
  cp [-r] src dst- Copy files
  mv src dst     - Move/rename files
  chmod mode file- Change permissions
  chown user file- Change owner
  chgrp group fl - Change group
  umask [mask]   - Set file creation mask
  ps [aux]       - Show process status
  top            - Real-time process viewer
  htop           - Interactive process viewer
  kill [pid]     - Terminate processes
  systemctl      - Control system services
  journalctl     - Query system logs
  iptables       - Manage firewall rules
  ufw            - Uncomplicated Firewall
  ip             - Show/manipulate network interfaces
  ss             - Socket statistics
  netstat        - Network statistics
  apt            - Package manager (update/install/remove/list)
  dpkg           - Debian package tool (list/install .deb)
  export         - Set environment variable
  env            - Show environment variables
  unset          - Remove environment variable
  grep           - Filter input by pattern
  head           - Show first lines
  tail           - Show last lines
  wc             - Count lines/words/chars
  sort           - Sort lines
  uniq           - Remove duplicate lines
  crontab        - Manage scheduled tasks (-l, -e, -r)
  date           - Show current (virtual) time
  sleep [secs]   - Wait: advances time and runs cron jobs
  mount          - Show/manage filesystem mounts
  umount         - Unmount a filesystem
  df             - Show disk space usage
  du             - Show directory sizes
  ln [-s]        - Create links (symbolic/hard)
  find           - Search files by name/perm/user
  which [cmd]    - Locate command path
  exit           - Close session / return
  end            - Exit the lab

--- Network Commands ---
  ping [host]    - Test network connectivity
  traceroute [h] - Trace route to host
  arp-scan [net] - Discover active hosts
  netdiscover    - Network host discovery
  nc [args]      - Netcat utility
  nmap [ip]      - Scan ports and services

--- Pentesting Tools ---
  gobuster dir   - Enumerate web directories
  hydra [args]   - Credential brute force
  hashcat [args] - Password cracking
  ssh user@ip    - Connect via SSH
  ftp [ip]       - Connect via FTP
  msfconsole     - Start Metasploit Framework

Usage: help <command> for more information about a specific command.`,
        isError: false
      };
    }

    const command = args[0];
    const helpText = COMMAND_HELP[command];

    if (helpText) {
      return { output: helpText, isError: false };
    }

    return {
      output: `No help available for command: ${command}\nType 'help' without arguments to see the list of available commands.`,
      isError: true
    };
  }
};