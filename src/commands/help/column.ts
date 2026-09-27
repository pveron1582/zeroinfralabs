export const help_column = `column - Align output into a table

Usage:
  column -t [-s delim] [-o sep] [FILE]

Options:
  -t       Table mode (align columns)
  -s DELIM Input delimiter (default: whitespace)
  -o SEP   Output separator (default: two spaces)

Examples:
  column -t file.txt
  cat /etc/passwd | column -t -s: -o' | '`;
