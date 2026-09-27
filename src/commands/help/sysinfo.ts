export const help_uptime = `uptime - Show how long the system has been running

Usage:
  uptime [OPTION]

Options:
  -p  Show uptime in pretty format
  -s  System up since

Examples:
  uptime
  uptime -p
  uptime -s`;

export const help_free = `free - Display amount of free and used memory

Usage:
  free [OPTION]

Options:
  -h  Human-readable (default)
  -m  Show in megabytes

Examples:
  free
  free -m
  free -h`;

export const help_arch = `arch - Print machine architecture

Usage:
  arch

Description:
  Prints 'x86_64' for all virtual machines.`;

export const help_hostnamectl = `hostnamectl - Show host name and system settings

Usage:
  hostnamectl

Description:
  Shows hostname, machine ID, operating system, kernel
  and architecture (as in systemd systems).`;

export const help_lsb_release = `lsb_release - Show distribution information

Usage:
  lsb_release [OPTION]

Options:
  -a  All fields
  -d  Description
  -r  Release
  -c  Codename
  -i  Distributor ID

Examples:
  lsb_release -a
  lsb_release -d`;

export const help_w = `w - Show who is logged in and what they are doing

Usage:
  w

Description:
  Shows uptime, users, and their current activity
  (like top's header + user table).`;

export const help_last = `last - Show listing of last logged in users

Usage:
  last

Description:
  Shows recent logins and reboots from the virtual wtmp.`;

export const help_lscpu = `lscpu - Display CPU information

Usage:
  lscpu

Examples:
  lscpu

Description:
  Shows architecture, CPU model, cores and flags of the
  virtual machine.`;
