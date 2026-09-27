export const help_cut = `cut - Remove sections from lines

Usage:
  cut -d DELIM -f LIST [FILE]
  cut -c LIST [FILE]

Options:
  -d DELIM   Field delimiter (default: TAB)
  -f LIST    Fields: N, N-M, N-, -M (e.g. 1,3-5)
  -c LIST    Character positions (same LIST syntax)
  -s         Skip lines without delimiter
  --complement  Invert the selection

Examples:
  cut -d: -f1 /etc/passwd
  cut -d: -f1,7 /etc/passwd
  echo a:b:c | cut -d: -f2`;
