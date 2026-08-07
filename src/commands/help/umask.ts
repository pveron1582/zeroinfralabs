export const help_umask = `umask - Set file creation mask

Usage:
  umask [mask]
  umask -S

Examples:
  umask                             # Show current mask (e.g. 0022)
  umask 077                         # Restrictive: files created as 600
  umask -S                          # Symbolic: u=rwx,g=rx,o=rx

Description:
  Sets the file mode creation mask. The mask determines which permission
  bits are removed when creating new files. Files: base 666, dirs: base 777.`;
