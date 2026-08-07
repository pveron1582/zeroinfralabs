export const help_ss = `ss - Socket statistics

Usage:
  ss -tlnp       # Listening TCP sockets with process
  ss -tnp        # Established TCP connections
  ss -tulnp      # Listening TCP + UDP sockets

Examples:
  ss -tlnp
  ss -tnp

Description:
  Shows sockets based on the real open ports of the machine.
  Ports blocked by the firewall or whose service is stopped
  do not appear.`;
