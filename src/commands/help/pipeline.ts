// ── commands/help/pipeline.ts ─────────────────────────────────────
// Ayudas de los filtros de pipe (builtin/pipeline.ts).

export const help_grep = `grep - Filter input by pattern

Usage:
  grep [OPTIONS] PATTERN [FILE]
  command | grep PATTERN

Options:
  -i   Ignore case
  -v   Invert match (print non-matching lines)
  -n   Show line numbers
  -r   Recursive search under a directory
  -c   Count matching lines
  -o   Print only the matched fragment

Examples:
  grep root /etc/passwd
  grep -i error app.log
  ls -la | grep rw
  grep -rn password /var/www

Description:
  PATTERN is a regular expression. Reads from the pipe when present,
  otherwise from FILE.`;

export const help_head = `head - Output the first part of a file

Usage:
  head [OPTIONS] [FILE]
  command | head

Options:
  -n N      Print the first N lines (default 10)
  -n5, -5   Shorthand for -n 5
  --lines=N Same as -n N

Examples:
  head /etc/passwd
  head -n 5 /var/log/syslog
  ls -la | head

Description:
  Works with a pipe or a file. Reading a file reports metadata
  for lab validation.`;

export const help_tail = `tail - Output the last part of a file

Usage:
  tail [OPTIONS] [FILE]
  command | tail

Options:
  -n N      Print the last N lines (default 10)
  -n5, -5   Shorthand for -n 5
  --lines=N Same as -n N

Examples:
  tail /var/log/syslog
  tail -n 3 /etc/passwd
  ps aux | tail

Description:
  Works with a pipe or a file (same options as head).`;

export const help_wc = `wc - Count lines, words and characters

Usage:
  wc [FILE]
  command | wc

Examples:
  wc /etc/passwd
  ls -la | wc

Description:
  Prints "lines words chars [file]". Flags are accepted but the
  full triple is always printed.`;

export const help_sort = `sort - Sort lines of input

Usage:
  sort [FILE]
  command | sort

Options:
  -r, --reverse        Reverse the result
  -n, --numeric-sort   Compare as numbers instead of text

Examples:
  sort /etc/passwd
  sort -r scores.txt
  cat ports.txt | sort -n`;

export const help_uniq = `uniq - Remove adjacent duplicate lines

Usage:
  uniq [FILE]
  command | uniq

Examples:
  uniq sorted.txt
  sort names.txt | uniq
  sort names.txt | uniq -c | sort -rn

Description:
  Drops consecutive duplicates only — sort first for global
  deduplication.`;
