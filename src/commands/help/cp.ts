export const help_cp = `cp - Copy files or directories

Usage:
  cp [-r] source destination

Options:
  -r  Copy directories recursively

Examples:
  cp file.txt /tmp/copy.txt          # Copy file
  cp -r /home/user /backup           # Copy directory

Description:
  Copies files and directories. Verifies read permission on source
  and write permission on destination parent directory.`;
