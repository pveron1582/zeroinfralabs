export const help_awk = `awk - Pattern scanning with fields (subset)

Usage:
  awk [-F sep] 'program' [FILE...]

Program:
  /re/ { print $1 }        Regex match on the line
  $3 > 100 { print $1 }    Field compare (== != > < >= <= ~ !~)
  $0 $N $NF NF NR FNR       Whole line, fields, counters
  BEGIN { ... } / END ...   Run before/after input
  { print $1, $2 }          Comma separates with space
  { next }                 Skip to next line

Limits: no functions, arrays, printf or getline.

Examples:
  awk -F: '{print $1}' /etc/passwd
  awk '$3 > 1000 {print $1}' /etc/passwd
  awk 'END {print NR}' log.txt`;
