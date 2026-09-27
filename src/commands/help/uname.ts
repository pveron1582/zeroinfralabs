export const help_uname = `uname - Print system information

Usage:
  uname [OPTION]

Options:
  -a  All information (kernel, hostname, version, arch)
  -s  Kernel name (default)
  -n  Network node hostname
  -r  Kernel release
  -m  Machine hardware (arch)
  -o  Operating system

Examples:
  uname                             # Linux
  uname -a                          # Full string

Description:
  Prints the kernel name and version of the virtual machine,
  derived from its operating system.`;