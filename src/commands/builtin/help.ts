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
  Displays the contents of one or more files in the terminal.`,

  ping: `ping - Send ICMP echo requests to a host

Usage:
  ping [options] <destination>

Options:
  -c <count>    Stop after sending <count> packets (default: 4)
  -i <interval> Wait <interval> seconds between packets (default: 1)
  -W <timeout>  Time to wait for response (default: 3)
  -s <size>     Packet size (default: 56 bytes)

Examples:
  ping 192.168.1.10                  # Ping host 4 times
  ping -c 3 10.0.0.5                   # Ping 3 times
  ping -c 5 -i 2 192.168.1.1         # Ping 5 times with 2s interval

Description:
  Tests network connectivity by sending ICMP packets. Reports latency
  statistics and packet loss percentage.`,

  traceroute: `traceroute - Trace route to a host

Usage:
  traceroute [options] <host>

Options:
  -m <max_ttl>  Set max number of hops (default: 30)
  -q <nqueries> Set probes per hop (default: 3)
  -w <waittime> Time to wait for response in seconds (default: 5)

Examples:
  traceroute 192.168.1.10            # Trace route to host
  traceroute -m 20 8.8.8.8            # Max 20 hops

Description:
  Displays the network path/route taken to reach a destination,
  showing each intermediate hop with response times.`,

  ps: `ps - Report process status

Usage:
  ps [options]

Options:
  aux            Show all processes for all users
  -e             Show all processes
  -ef            Full listing

Examples:
  ps                                 # Show current shell processes
  ps aux                             # Show all system processes
  ps -ef                             # Full process listing

Description:
  Displays information about active processes.`,

  top: `top - Display dynamic real-time process information

Usage:
  top

Keys:
  q              Quit top

Description:
  Shows a dynamic real-time view of running processes,
  including CPU usage, memory usage, and system load.`,

  htop: `htop - Interactive process viewer with colors

Usage:
  htop

Keys:
  q, F10         Quit htop
  F1             Help
  F3             Search for process
  F6             Sort by column
  F9             Kill process

Description:
  An enhanced version of top with:
  - Color-coded CPU and memory bars
  - Multiple CPU core visualization
  - Visual memory and swap usage bars
  - Interactive function key menu
  - Better process highlighting`,

  which: `which - Locate a command

Usage:
  which [command ...]

Examples:
  which nmap                         # Find path to nmap
  which ls cat pwd                   # Find paths to multiple commands

Description:
  Returns the pathnames of the commands which would be executed
  in the current environment.`
};

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
  ifconfig       - Network configuration
  ls [dir]       - List files
  cd [dir]       - Change directory
  cat [file]     - Display file contents
  mkdir [-p] dir - Create directories
  rmdir [-p] dir - Remove empty directories
  ps [aux]       - Show process status
  top            - Real-time process viewer
  htop           - Interactive process viewer (colorful)
  which [cmd]    - Locate command path
  exit           - Close SSH session
  end            - Exit the lab

--- Network Commands ---
  ping [ip]      - Test network connectivity
  traceroute [ip]- Trace route to host
  arp-scan [net] - Discover active hosts
  netdiscover    - Network host discovery
  nc [args]      - Netcat utility

--- Pentesting Tools ---
  nmap [ip]      - Scan ports and services
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
