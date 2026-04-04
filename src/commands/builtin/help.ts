// ── commands/builtin/help.ts ──────────────────────────────────────
// Shows available command help

import type { CommandResponse } from '../../types';

const COMMAND_HELP: Record<string, string> = {
  mkdir: `mkdir - Create directories

Usage:
  mkdir [-p] directory...

Options:
  -p  Create parent directories if they don't exist

Examples:
  mkdir new_folder                   # Create in current directory
  mkdir -p /var/www/html/new         # Create full path
  mkdir /tmp/test                    # Create at absolute path

Description:
  Creates one or more directories. With -p, creates the entire directory tree.
  Without -p, parent directories must already exist.`,

  rmdir: `rmdir - Remove empty directories

Usage:
  rmdir [-p] directory...

Options:
  -p  Remove parent directories if left empty

Examples:
  rmdir empty_folder                 # Remove empty directory
  rmdir -p /var/www/html/new         # Remove full path

Description:
  Removes directories that are empty. With -p, also removes parents
  if they become empty. Only root can remove in system directories.`,

  ls: `ls - List files and directories

Usage:
  ls [options] [directory]

Options:
  -l  Long format (permissions, size, date)
  -a  Show hidden files (starting with .)
  -la Combination of -l and -a

Examples:
  ls                                 # List current directory
  ls -l /etc                         # Long format of /etc
  ls -la ~                           # Hidden + long format in home`,

  cd: `cd - Change directory

Usage:
  cd [directory]

Examples:
  cd /etc                            # Go to /etc
  cd ..                              # Parent directory
  cd ~                               # User's home
  cd                                 # User's home

Description:
  Changes the current working directory.`,

  cat: `cat - Display file contents

Usage:
  cat file...

Examples:
  cat /etc/passwd                    # Show user file
  cat log.txt                        # Show log file

Description:
  Displays the contents of one or more files in the terminal.`
};

export const cmd_help = {
  name: 'help',
  execute: (args: string[]): CommandResponse => {
    if (args.length === 0) {
      return {
        output: `Available commands:
  help           - Show this help
  clear          - Clear the terminal
  whoami         - Current user info
  ifconfig       - Network configuration
  arp-scan [net] - Discover active hosts
  nmap [ip]      - Scan ports and services
  gobuster dir   - Enumerate web directories
  hydra [args]   - Credential brute force
  hashcat [args] - Password cracking
  ssh user@ip    - Connect via SSH
  msfconsole     - Start Metasploit Framework
  ls [dir]       - List files
  cd [dir]       - Change directory
  cat [file]     - Display file contents
  mkdir [-p] dir - Create directories
  rmdir [-p] dir - Remove empty directories
  nc [args]      - Netcat utility
  exit           - Close SSH session
  end            - Exit the lab

Usage: help <command> for more information about a specific command.`,
        isError: false
      };
    }

    const command = args[0].toLowerCase();
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
