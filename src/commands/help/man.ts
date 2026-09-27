export const help_man = `man - Display manual pages

Usage:
  man <command>

Examples:
  man ls
  man nmap

Description:
  Shows the manual page of a command (same content as
  'help <command>' with a man-style header).`;

export const help_whatis = `whatis - Display one-line manual descriptions

Usage:
  whatis <command>

Examples:
  whatis ls
  whatis ssh

Description:
  Prints the one-line description of a command from the
  manual index.`;

export const help_apropos = `apropos - Search manual descriptions by keyword

Usage:
  apropos <keyword>

Examples:
  apropos network
  apropos firewall

Description:
  Lists every command whose name or description matches
  the keyword.`;