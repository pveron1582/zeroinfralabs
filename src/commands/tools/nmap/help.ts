// ── commands/tools/nmap/help.ts ──────────────────────────────────
// Texto de help interno de nmap (-h / --help)

export const NMAP_HELP = `Nmap 7.92 ( https://nmap.org ) — Simulated Help

USAGE: nmap [Scan Type] [Options] <target>

SCAN TYPES:
  -sS       TCP SYN Stealth Scan
  -sT       TCP Connect Scan (default)
  -sU       UDP Scan
  -sV       Probe open ports for service/version info
  -sC       Default script scan (equivalent to --script=default)
  --script <name>  Run NSE scripts (e.g. --script=vuln, --script=default)
  -sn       Ping Scan (host discovery only, no port scan)
  -sP       Ping Scan (legacy, same as -sn)

HOST DISCOVERY:
  -Pn       Treat all hosts as online — skip host discovery

PORT SPECIFICATION:
  -p <ports>    Scan specific ports (e.g. -p 22,80,443 or -p 1-1000)
  -p-           Scan all 65535 ports
  -p22          Shorthand for -p 22
  --open        Show only open (or possibly open) ports
  --top-ports <n>  Scan n most common ports
  -F            Fast mode: scan 100 most common ports
  (default)     Top ~1000 ports: 1-1024 + common high ports

OUTPUT:
  -oN <file>    Save output in normal format to file
  -oG <file>    Save output in grepable format to file
  -oX <file>    Save output in XML format
  -oA <base>    Save output in all formats (normal + grepable + xml)

TIMING:
  -T <0-5>      Timing template (0 paranoid .. 5 insane)
  --min-rate <n>  Minimum packet rate (ignored, for compatibility)

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
