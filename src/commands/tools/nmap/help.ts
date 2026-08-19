// ── commands/tools/nmap/help.ts ──────────────────────────────────
// Texto de help interno de nmap (-h / --help)

export const NMAP_HELP = `Nmap 7.92 ( https://nmap.org ) — Simulated Help

USAGE: nmap [Scan Type] [Options] <target>

SCAN TYPES:
  -sS       TCP SYN Stealth Scan
  -sT       TCP Connect Scan (default)
  -sV       Probe open ports for service/version info
  -sn       Ping Scan (host discovery only, no port scan)
  -sP       Ping Scan (legacy, same as -sn)

HOST DISCOVERY:
  -Pn       Treat all hosts as online — skip host discovery

PORT SPECIFICATION:
  -p <ports>    Scan specific ports (e.g. -p 22,80,443 or -p 1-1000)
  -p-           Scan all 65535 ports
  -p22          Shorthand for -p 22
  --open        Show only open (or possibly open) ports
  (default)     Top ~1000 ports: 1-1024 + common high ports

OUTPUT:
  -oN <file>    Save output in normal format to file
  -oG <file>    Save output in grepable format to file

VERBOSITY:
  -v            Increase verbosity level
  -vv           More verbose (shows closed ports summary)
  -vvv          Maximum detail (shows simulated raw packets)

OS DETECTION:
  -O            Enable OS detection

AGGRESSIVE MODE:
  -A            Enable OS detection, version detection, script scanning
                (equivalent to -sV -O --script=default)

EXAMPLES:
  nmap -sV 192.168.1.10
  nmap -sS -p 22,80,443 192.168.1.10
  nmap -sV -v -O 192.168.1.10
  nmap -sV -p- 192.168.1.10
  nmap -sV -oN scan.txt 192.168.1.10
  nmap -sn 192.168.1.10
  nmap -sV -vvv -A 192.168.1.10`;
