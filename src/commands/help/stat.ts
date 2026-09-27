export const help_stat = `stat - Display file status

Usage:
  stat [OPTION] FILE...

Options:
  -c FORMAT  Use FORMAT (%n name, %s size, %a octal, %U user, %G group, %F type)

Examples:
  stat /etc/passwd
  stat -c '%a %n' script.sh

Description:
  Shows size, blocks, permissions, owner and timestamps of each
  file. Sizes come from the real virtual content; dates are stable
  per path.`;