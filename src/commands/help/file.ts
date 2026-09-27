export const help_file = `file - Determine file type

Usage:
  file [OPTION] FILE...

Options:
  -b  Brief mode (do not prepend filenames)

Examples:
  file /bin/bash
  file -b script.sh

Description:
  Classifies files by magic bytes, shebang and extension:
  scripts, ELF, archives, images, JSON, HTML, text or data.`;