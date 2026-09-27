export const help_hostname = `hostname - Show or set the system host name

Usage:
  hostname [OPTION] [new-name]

Options:
  -f  Alias of the bare hostname
  -i  IP address of the host
  -I  All IP addresses

Examples:
  hostname                          # Show current name
  hostname -I                       # Show local IP
  hostname webserver                # Change name (requires root)

Description:
  With no arguments prints the machine hostname. Passing a new
  name changes it (root only, current session).`;