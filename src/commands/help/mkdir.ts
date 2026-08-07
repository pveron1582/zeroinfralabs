export const help_mkdir = `mkdir - Create directories

Usage:
  mkdir [-p] directory...

Options:
  -p  Create parent directories if they don't exist

Examples:
  mkdir new_folder                   # Create in current directory
  mkdir -p /var/www/html/new         # Create full path
  mkdir /tmp/test                    # Create at absolute path

Description:
  Creates one or more directories. With -p, creates the entire directory tree.
  Without -p, parent directories must already exist.`;
