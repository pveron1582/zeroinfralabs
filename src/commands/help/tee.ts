export const help_tee = `tee - Copy stdin to files and stdout

Usage:
  tee [OPTION] [FILE...]

Options:
  -a  Append instead of overwriting

Examples:
  echo hello | tee out.txt
  cat log | tee -a a.txt b.txt

Description:
  Writes respect Unix permissions like redirections do.`;
