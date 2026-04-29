# NMAP(1) - Nmap Reference Guide

## NAME

**nmap** — Network exploration tool and security / port scanner

## SYNOPSIS

```
nmap [Scan Type(s)] [Options] {target specification}
```

## DESCRIPTION

Nmap ("Network Mapper") is an open source tool for network exploration and security auditing. It was designed to rapidly scan large networks, although it works fine against single hosts. Nmap uses raw IP packets in novel ways to determine what hosts are available on the network, what services (application name and version) those hosts are offering, what operating systems (and OS versions) they are running, what type of packet filters/firewalls are in use, and dozens of other characteristics.

While Nmap is commonly used for security audits, many systems and network administrators find it useful for routine tasks such as network inventory, managing service upgrade schedules, and monitoring host or service uptime.

The output from Nmap is a list of scanned targets, with supplemental information on each depending on the options used. Key among that information is the "interesting ports table". That table lists the port number and protocol, service name, and state.

### Port States

| State | Description |
|-------|-------------|
| **open** | An application on the target machine is listening for connections/packets on that port |
| **filtered** | A firewall, filter, or other network obstacle is blocking the port so that Nmap cannot tell whether it is open or closed |
| **closed** | No application is listening on the port, though it could open up at any time |
| **unfiltered** | Responsive to Nmap's probes, but Nmap cannot determine whether it is open or closed |
| **open\|filtered** | Nmap cannot determine which of the two states describes a port |
| **closed\|filtered** | Nmap cannot determine which of the two states describes a port |

---

## OPTIONS

### TARGET SPECIFICATION

Can pass hostnames, IP addresses, networks, etc.
Ex: `scanme.nmap.org`, `microsoft.com/24`, `192.168.0.1; 10.0.0-255.1-254`

| Option | Description |
|--------|-------------|
| `-iL <inputfilename>` | Input from list of hosts/networks |
| `-iR <num hosts>` | Choose random targets |
| `--exclude <host1[,host2][,host3],...>` | Exclude hosts/networks |
| `--excludefile <exclude_file>` | Exclude list from file |

### HOST DISCOVERY

| Option | Description |
|--------|-------------|
| `-sL` | List Scan - simply list targets to scan |
| `-sn` | Ping Scan - disable port scan |
| `-Pn` | Treat all hosts as online -- skip host discovery |
| `-PS/PA/PU/PY[portlist]` | TCP SYN/ACK, UDP or SCTP discovery to given ports |
| `-PE/PP/PM` | ICMP echo, timestamp, and netmask request discovery probes |
| `-PO[protocol list]` | IP Protocol Ping |
| `-n/-R` | Never do DNS resolution/Always resolve [default: sometimes] |
| `--dns-servers <serv1[,serv2],...>` | Specify custom DNS servers |
| `--system-dns` | Use OS's DNS resolver |
| `--traceroute` | Trace hop path to each host |

### SCAN TECHNIQUES

| Option | Description |
|--------|-------------|
| `-sS` | TCP SYN scan (stealth, default) |
| `-sT` | TCP Connect() scan |
| `-sA` | TCP ACK scan |
| `-sW` | TCP Window scan |
| `-sM` | TCP Maimon scan |
| `-sU` | UDP Scan |
| `-sN/sF/sX` | TCP Null, FIN, and Xmas scans |
| `--scanflags <flags>` | Customize TCP scan flags |
| `-sI <zombie host[:probeport]>` | Idle scan |
| `-sY/sZ` | SCTP INIT/COOKIE-ECHO scans |
| `-sO` | IP protocol scan |
| `-b <FTP relay host>` | FTP bounce scan |

### PORT SPECIFICATION AND SCAN ORDER

| Option | Description |
|--------|-------------|
| `-p <port ranges>` | Only scan specified ports. Ex: `-p22`, `-p1-65535`, `-p U:53,111,137,T:21-25,80,139,8080,S:9` |
| `--exclude-ports <port ranges>` | Exclude the specified ports from scanning |
| `-F` | Fast mode - Scan fewer ports than the default scan |
| `-r` | Scan ports sequentially - don't randomize |
| `--top-ports <number>` | Scan `<number>` most common ports |
| `--port-ratio <ratio>` | Scan ports more common than `<ratio>` |

### SERVICE/VERSION DETECTION

| Option | Description |
|--------|-------------|
| `-sV` | Probe open ports to determine service/version info |
| `--version-intensity <level>` | Set from 0 (light) to 9 (try all probes) |
| `--version-light` | Limit to most likely probes (intensity 2) |
| `--version-all` | Try every single probe (intensity 9) |
| `--version-trace` | Show detailed version scan activity (for debugging) |

### SCRIPT SCAN

| Option | Description |
|--------|-------------|
| `-sC` | equivalent to `--script=default` |
| `--script=<Lua scripts>` | Lua scripts is a comma separated list of directories, script-files or script-categories |
| `--script-args=<n1=v1,[n2=v2,...]>` | provide arguments to scripts |
| `--script-args-file=filename` | provide NSE script args in a file |
| `--script-trace` | Show all data sent and received |
| `--script-updatedb` | Update the script database |
| `--script-help=<Lua scripts>` | Show help about scripts |

### OS DETECTION

| Option | Description |
|--------|-------------|
| `-O` | Enable OS detection |
| `--osscan-limit` | Limit OS detection to promising targets |
| `--osscan-guess` | Guess OS more aggressively |

### TIMING AND PERFORMANCE

Options which take `<time>` are in seconds, or append `ms`, `s`, `m`, or `h` to the value (e.g. `30m`).

| Option | Description |
|--------|-------------|
| `-T<0-5>` | Set timing template (higher is faster) |
| `--min-hostgroup/max-hostgroup <size>` | Parallel host scan group sizes |
| `--min-parallelism/max-parallelism <numprobes>` | Probe parallelization |
| `--min-rtt-timeout/max-rtt-timeout/initial-rtt-timeout <time>` | Specifies probe round trip time |
| `--max-retries <tries>` | Caps number of port scan probe retransmissions |
| `--host-timeout <time>` | Give up on target after this long |
| `--scan-delay/--max-scan-delay <time>` | Adjust delay between probes |
| `--min-rate <number>` | Send packets no slower than `<number>` per second |
| `--max-rate <number>` | Send packets no faster than `<number>` per second |

### FIREWALL/IDS EVASION AND SPOOFING

| Option | Description |
|--------|-------------|
| `-f; --mtu <val>` | fragment packets (optionally w/given MTU) |
| `-D <decoy1,decoy2[,ME],...>` | Cloak a scan with decoys |
| `-S <IP_Address>` | Spoof source address |
| `-e <iface>` | Use specified interface |
| `-g/--source-port <portnum>` | Use given port number |
| `--proxies <url1,[url2],...>` | Relay connections through HTTP/SOCKS4 proxies |
| `--data <hex string>` | Append a custom payload to sent packets |
| `--data-string <string>` | Append a custom ASCII string to sent packets |
| `--data-length <num>` | Append random data to sent packets |
| `--ip-options <options>` | Send packets with specified ip options |
| `--ttl <val>` | Set IP time-to-live field |
| `--spoof-mac <mac address/prefix/vendor name>` | Spoof your MAC address |
| `--badsum` | Send packets with a bogus TCP/UDP/SCTP checksum |

### OUTPUT

| Option | Description |
|--------|-------------|
| `-oN/-oX/-oS/-oG <file>` | Output scan in normal, XML, s\|<rIpt kIddi3, and Grepable format |
| `-oA <basename>` | Output in the three major formats at once |
| `-v` | Increase verbosity level (use `-vv` or more for greater effect) |
| `-d` | Increase debugging level (use `-dd` or more for greater effect) |
| `--reason` | Display the reason a port is in a particular state |
| `--open` | Only show open (or possibly open) ports |
| `--packet-trace` | Show all packets sent and received |
| `--iflist` | Print host interfaces and routes (for debugging) |
| `--append-output` | Append to rather than clobber specified output files |
| `--resume <filename>` | Resume an aborted scan |
| `--noninteractive` | Disable runtime interactions via keyboard |
| `--stylesheet <path/URL>` | XSL stylesheet to transform XML output to HTML |
| `--webxml` | Reference stylesheet from Nmap.Org for more portable XML |
| `--no-stylesheet` | Prevent associating of XSL stylesheet w/XML output |

### MISC

| Option | Description |
|--------|-------------|
| `-6` | Enable IPv6 scanning |
| `-A` | Enable OS detection, version detection, script scanning, and traceroute |
| `--datadir <dirname>` | Specify custom Nmap data file location |
| `--send-eth/--send-ip` | Send using raw ethernet frames or IP packets |
| `--privileged` | Assume that the user is fully privileged |
| `--unprivileged` | Assume the user lacks raw socket privileges |
| `-V` | Print version number |
| `-h` | Print help summary page |

---

## EXAMPLES

### Basic scan of a single target
```bash
nmap scanme.nmap.org
```

### Aggressive scan with OS and version detection
```bash
nmap -A -T4 scanme.nmap.org
```

### Ping sweep of a network
```bash
nmap -sn 192.168.0.0/16
```

### Scan specific ports
```bash
nmap -p 22,80,443 192.168.1.1
```

### Stealth SYN scan (requires root)
```bash
sudo nmap -sS -p- 10.0.0.1
```

### Fast scan of top 100 ports
```bash
nmap -F --top-ports 100 192.168.1.0/24
```

### Random target scan
```bash
nmap -v -iR 10000 -Pn -p 80
```

### UDP scan
```bash
sudo nmap -sU -p 53,161 192.168.1.1
```

---

## EXIT STATUS

| Code | Meaning |
|------|---------|
| 0 | Nmap succeeded |
| 1 | An error occurred |
| 2 | At least one host was down or unreachable |

---

## ENVIRONMENT

- `NMAP_PRIVILEGED` - If set, Nmap assumes it has raw socket privileges
- `NMAP_UNPRIVILEGED` - If set, Nmap assumes it lacks raw socket privileges

---

## FILES

| Path | Description |
|------|-------------|
| `/usr/share/nmap/nmap-services` | Default services database |
| `/usr/share/nmap/nmap-os-db` | OS fingerprint database |
| `/usr/share/nmap/nmap-protocols` | IP protocols database |
| `/usr/share/nmap/nmap-rpc` | RPC services database |
| `/usr/share/nmap/nmap-mac-prefixes` | MAC vendor database |

---

## SEE ALSO

- [Nmap Official Website](https://nmap.org)
- [Nmap Reference Guide](https://nmap.org/book/man.html)
- [Nmap Scripting Engine (NSE)](https://nmap.org/book/nse.html)
- `nmap(1)` - this manual page

---

## AUTHOR

Gordon Lyon (Fyodor) <fyodor@nmap.org>

Nmap is (C) 1998-2024 by Insecure.Com LLC and contributors.

---

## COPYRIGHT

This man page is distributed under the same license as Nmap itself.
See https://nmap.org/book/man-legal.html for details.
