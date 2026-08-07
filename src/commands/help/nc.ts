export const help_nc = `nc - Netcat networking utility

Usage:
  nc [options] [host] [port]
  nc -lvnp <port>                    # Listen for reverse shell

Examples:
  nc 192.168.1.10 80                 # Connect to port 80
  nc -lvnp 4444                      # Listen for reverse shell on port 4444

Description:
  Reads and writes data across network connections. Can be used
  to set up reverse shell listeners, port scanning, and file transfers.`;
