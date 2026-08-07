export const help_ping = `ping - Send ICMP echo requests to a host

Usage:
  ping [options] <destination>

Options:
  -c <count>    Stop after sending <count> packets (default: 4)
  -i <interval> Wait <interval> seconds between packets (default: 1)
  -W <timeout>  Time to wait for response (default: 3)
  -s <size>     Packet size (default: 56 bytes)

Examples:
  ping 192.168.1.10                  # Ping host 4 times
  ping -c 3 10.0.0.5                   # Ping 3 times
  ping -c 5 -i 2 192.168.1.1         # Ping 5 times with 2s interval

Description:
  Tests network connectivity by sending ICMP packets. Reports latency
  statistics and packet loss percentage.`;
