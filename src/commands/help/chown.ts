export const help_chown = `chown - Change file owner

Usage:
  chown [options] owner[:group] file...

Options:
  -R  Recursive

Examples:
  chown user file.txt                # Change owner to user
  chown user:admin file.txt          # Change owner and group

Description:
  Changes the owner (and optionally group) of files and directories.
  Only root can change ownership.`;
