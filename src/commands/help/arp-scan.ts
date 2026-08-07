export const help_arpscan = `arp-scan - Discover hosts on local network

Usage:
  arp-scan [network]

Examples:
  arp-scan 192.168.1.0/24           # Scan local subnet
  arp-scan                          # Default scan

Description:
  Sends ARP requests to discover active hosts on the local network.
  Shows IP and MAC addresses of responding hosts.`;
