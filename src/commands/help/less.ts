export const help_less = `less/more - Show file contents

Usage:
  less [OPTION] [FILE]
  more [OPTION] [FILE]

Options:
  -N  Show line numbers

Examples:
  less /etc/passwd
  cat log.txt | less -N
  more README.md

Description:
  There is no interactive scrolling in this simulator: both
  commands dump the content (from file or pipe) and respect
  read permissions like cat.`;