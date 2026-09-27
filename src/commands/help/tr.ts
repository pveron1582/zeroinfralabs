export const help_tr = `tr - Translate, squeeze or delete characters

Usage:
  tr [OPTION] SET1 [SET2]

Options:
  -d       Delete characters in SET1
  -s       Squeeze repeats (of SET2, or SET1 with -d)
  -c       Complement of SET1

Sets:
  Ranges a-z A-Z 0-9, escapes \\n \\t \\\\

Examples:
  echo hello | tr a-z A-Z
  echo hello | tr -d l
  cat file | tr -s ' '`;
