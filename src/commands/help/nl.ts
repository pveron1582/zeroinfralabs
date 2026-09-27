export const help_nl = `nl - Number lines of files

Usage:
  nl [OPTION] [FILE]

Options:
  -b a|t   Number all lines (a) or non-blank only (t, default)
  -i N     Increment (default 1)
  -v N     Starting number (default 1)
  -w N     Width (default 6)
  -s SEP   Separator (default TAB)

Examples:
  nl file.txt
  nl -ba -s': ' file.txt`;
