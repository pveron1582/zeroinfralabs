export const help_netstat = `netstat - Network statistics

Usage:
  netstat -tlnp   # Listening TCP with PID/program
  netstat -an     # All sockets (numeric)
  netstat -tulpn  # Listening TCP + UDP

Examples:
  netstat -tlnp
  netstat -an

Description:
  Displays network connections and listening ports. Like ss, it
  reflects only ports actually in use (firewall + services).`;
