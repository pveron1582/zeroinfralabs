export const help_nmap = `nmap - Network exploration and port scanning

Usage:
  nmap [options] <target>

Options:
  -sV  Version detection
  -O   OS detection
  -p   Port range (e.g. -p 22,80 or -p 1-1000)
  -T   Timing (0-5, higher = faster)
  -A   Aggressive (OS + version + script + traceroute)
  -Pn  Skip host discovery

Examples:
  nmap 192.168.1.10                  # Default scan
  nmap -sV -O 10.0.0.5              # Version + OS detection
  nmap -p- 10.0.0.5                 # All 65535 ports

Description:
  Scans hosts for open ports, services, and operating system identification.`;
