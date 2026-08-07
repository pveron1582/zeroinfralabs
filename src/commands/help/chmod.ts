export const help_chmod = `chmod - Change file permissions

Usage:
  chmod [options] mode file...

Options:
  -R  Recursive (change files and directories)
  -v  Verbose (show changes)

Examples:
  chmod 755 script.sh               # rwxr-xr-x
  chmod -R 644 public/              # Recursive to directory
  chmod u+x file.txt                # Add execute for owner

Description:
  Changes the permissions (mode) of files and directories.
  Supports octal (755) and symbolic (u+x, g=rw, o-rwx) notation.`;
