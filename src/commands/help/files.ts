// ── commands/help/files.ts ────────────────────────────────────────
// Ayudas de filesystem: pwd, find, ln, mount, umount, df, du.

export const help_pwd = `pwd - Print the current working directory

Usage:
  pwd

Examples:
  pwd

Description:
  Shows this terminal's cwd (per-terminal state).`;

export const help_find = `find - Search files by name, permission or owner

Usage:
  find [path] [expression]

Expressions:
  -name "*.txt"   Match name glob (or full path if it contains /)
  -perm -4000     Files with the SUID bit
  -user root      Files owned by a user
  -type f         Regular files only
  -type d         Directories only
  -writable       Writable by the current user
  -readable       Readable by the current user
  -executable     Executable by the current user

Examples:
  find / -name "*.conf"
  find / -perm -4000
  find /var/www -type f
  find /home -user www-data`;

export const help_ln = `ln - Create links between files

Usage:
  ln TARGET LINK_NAME
  ln -s TARGET LINK_NAME

Options:
  -s, --symbolic   Create a symbolic link (target may not exist)
  -f, --force      Replace an existing link/file

Examples:
  ln /etc/passwd /tmp/p
  ln -s /var/log/syslog /tmp/log

Description:
  Hard links without -s; symlinks with -s.`;

export const help_mount = `mount - List or create filesystem mounts

Usage:
  mount
  mount <device> <mountpoint>

Examples:
  mount
  mount /dev/sdb1 /mnt/data

Description:
  Without arguments lists all mounts (fstab + user mounts).
  Requires root. The mountpoint directory must exist.`;

export const help_umount = `umount - Unmount a filesystem

Usage:
  umount <mountpoint>

Examples:
  umount /mnt/data

Description:
  Requires root. The mountpoint must be currently mounted.`;

export const help_df = `df - Report filesystem disk space usage

Usage:
  df [OPTIONS]

Options:
  -h, --human-readable   Show sizes in KB/MB/GB

Examples:
  df
  df -h`;

export const help_du = `du - Estimate file space usage

Usage:
  du [OPTIONS] [DIR]

Options:
  -h   Human-readable sizes
  -s   Summarize (total only)
  -a   Include every subdirectory in the listing

Examples:
  du
  du -sh /var/www
  du -a /etc`;
