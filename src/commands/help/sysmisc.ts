// ── commands/help/sysmisc.ts ──────────────────────────────────────
// Ayudas de sesión/entorno/tiempo. Reutiliza los textos internos de
// `-h` (alias/unalias/type/history) para no duplicar contenido.

import { ALIAS_HELP, UNALIAS_HELP } from '../builtin/alias';
import { TYPE_HELP } from '../builtin/type';
import { HISTORY_HELP } from '../builtin/history';

export const help_whoami = `whoami - Print the effective username

Usage:
  whoami

Examples:
  whoami

Description:
  Shows the current user of this terminal (root after su/sudo).`;

export const help_history = `history - Show the command history of this terminal

${HISTORY_HELP}`;

export const help_date = `date - Show the current (virtual) time

Usage:
  date

Examples:
  date

Description:
  Prints the machine's virtual clock, which advances with sleep
  and cron (see crontab).`;

export const help_sleep = `sleep - Advance the virtual clock

Usage:
  sleep <seconds>

Examples:
  sleep 60
  sleep 3600

Description:
  "Waits" N seconds by moving the virtual clock forward and
  running any cron jobs scheduled in that window.`;

export const help_crontab = `crontab - Manage scheduled tasks

Usage:
  crontab [-u user] {-l | -e | -r}

Options:
  -l   List the current crontab
  -e   Edit the crontab (opens the editor)
  -r   Remove the crontab
  -u   Act on another user's crontab (root only)

Examples:
  crontab -l
  crontab -e

Description:
  Jobs run against the virtual clock when time advances
  (sleep / cron runner).`;

export const help_env = `env - Show environment variables

Usage:
  env

Examples:
  env
  echo $PATH

Description:
  Lists the session environment (per-terminal, not persisted).`;

export const help_export = `export - Set an environment variable

Usage:
  export
  export VAR=value

Examples:
  export TOKEN=abc123
  export PATH=$PATH:/opt/tools

Description:
  Without arguments lists variables as declare -x. Values are
  expanded with $VAR when used by commands.`;

export const help_unset = `unset - Remove an environment variable

Usage:
  unset VAR

Examples:
  unset TOKEN

Description:
  Deletes VAR from the session environment.`;

export const help_alias = `alias - Define or list shell aliases

${ALIAS_HELP}`;

export const help_unalias = `unalias - Remove shell aliases

${UNALIAS_HELP}`;

export const help_type = `type - Describe how a name would be interpreted

${TYPE_HELP}`;

export const help_help = `help - Show available commands

Usage:
  help
  help <command>

Examples:
  help
  help nmap
  help xrdp

Description:
  Without arguments lists every available command by category.
  With a command, shows its manual page (same as man).`;
