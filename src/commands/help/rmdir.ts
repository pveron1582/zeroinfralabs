export const help_rmdir = `rmdir - Remove empty directories

Usage:
  rmdir [-p] directory...

Options:
  -p  Remove parent directories if left empty

Examples:
  rmdir empty_folder                 # Remove empty directory
  rmdir -p /var/www/html/new         # Remove full path

Description:
  Removes directories that are empty. With -p, also removes parents
  if they become empty. Only root can remove in system directories.`;
