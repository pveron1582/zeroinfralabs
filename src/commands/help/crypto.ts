export const help_hashsum = `md5sum/sha256sum - Checksum a file

Usage:
  md5sum [FILE]
  sha256sum [FILE]

Examples:
  md5sum notes.txt
  echo hello | md5sum
  sha256sum binary`;

export const help_base64 = `base64 - Encode/decode Base64

Usage:
  base64 [OPTION] [FILE]

Options:
  -d   Decode instead of encode

Examples:
  echo hello | base64
  echo aGVsbG8= | base64 -d
  base64 file`;

export const help_strings = `strings - Print printable sequences

Usage:
  strings [OPTION] FILE

Options:
  -n N   Minimum length (default 4)

Examples:
  strings /bin/bash
  strings -n 6 binary`;
