export const help_rm = `rm - Remove files or directories

Usage:
  rm [-rf] file...

Options:
  -r  Recursively remove directories
  -f  Force (ignore nonexistent files)

Examples:
  rm file.txt                        # Remove file
  rm -r /tmp/dir                     # Remove directory recursively
  rm -f /tmp/missing.txt             # Force (no error if missing)

Description:
  Removes files and directories. Use -r for directories. Respects sticky bit:
  users can only delete their own files in /tmp.`;
