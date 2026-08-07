export const help_echo = `echo - Display text or write to file

Usage:
  echo [text]
  echo [text] > file
  echo [text] >> file

Examples:
  echo hello                        # Display text
  echo hello > file.txt             # Write to file
  echo world >> file.txt            # Append to file

Description:
  Prints the specified text. Supports redirection with > (overwrite)
  and >> (append) to write to files.`;
