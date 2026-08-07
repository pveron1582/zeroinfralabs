export const help_chgrp = `chgrp - Change file group

Usage:
  chgrp [options] group file...

Options:
  -R  Recursive

Examples:
  chgrp developers file.txt          # Change group to developers

Description:
  Changes the group ownership of files and directories. Only root
  or the file owner (if member of the target group) can change the group.`;
