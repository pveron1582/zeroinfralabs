export const help_fileutil = `basename/dirname/realpath - Path manipulation

Usage:
  basename NAME [SUFFIX]
  dirname NAME
  realpath [-e|-m] NAME...

Examples:
  basename /usr/bin/sort            # sort
  dirname /usr/bin/sort             # /usr/bin
  realpath ../etc/passwd            # resolved against cwd
  realpath link                     # resolves symlinks

Description:
  basename/dirname are pure path ops (do NOT check existence);
  realpath resolves relative paths and symlinks.`;
