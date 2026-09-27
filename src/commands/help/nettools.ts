// ── commands/help/nettools.ts ─────────────────────────────────────
// Ayudas de herramientas de red. help_curl reutiliza el texto interno
// de `-h` (tools/curl.ts).

import { CURL_HELP } from '../tools/curl';

export const help_wget = `wget - Non-interactive network downloader

Usage:
  wget [OPTION] URL

Options:
  -O FILE   Write output to FILENAME
  -q        Quiet mode

Examples:
  wget http://192.168.1.11/
  wget -O index.html http://192.168.1.11/

Description:
  Downloads from the virtual web server. The file is created
  with real Unix permissions (owner/group/mode).`;

export const help_dig = `dig - DNS lookup utility

Usage:
  dig [@server] name [type]
  dig +short name
  dig -x IP

Types: A NS CNAME MX TXT PTR SOA

Examples:
  dig target.local
  dig +short target.local
  dig target.local MX
  dig -x 192.168.1.10

Description:
  The virtual DNS knows about every machine's hostname/IP.
  Unknown names return NXDOMAIN with a SOA authority record.`;

export const help_nslookup = `nslookup - Query the DNS server interactively (batch mode here)

Usage:
  nslookup <name>
  nslookup <ip>     Reverse lookup (PTR)

Examples:
  nslookup target.local
  nslookup 192.168.1.10`;

export const help_scp = `scp - Secure copy over SSH

Usage:
  scp [options] SOURCE TARGET

  SOURCE or TARGET must be of the form user@host:/path.

Examples:
  scp note.txt kali@192.168.1.10:/tmp/note.txt
  scp kali@192.168.1.10:/etc/passwd ./passwd

Description:
  Needs port 22 open on the target and a verified credential for
  the user in your inventory.`;

export const help_whois = `whois - Query ownership records

Usage:
  whois HOST

Examples:
  whois 192.168.1.10
  whois target.local`;

export const help_tcpdump = `tcpdump - Dump network traffic

Usage:
  tcpdump [OPTION]

Options:
  -i IFACE   Interface (default eth0)
  -c COUNT   Stop after COUNT packets

Examples:
  tcpdump -i eth0 -c 5

Description:
  Generates synthetic traffic between lab machines.`;

export const help_curl = `curl - Transfer data from URLs (HTTP client)

${CURL_HELP}

Description:
  Talks to the lab's virtual web servers and reports metadata
  (vulnerabilities / credentials) for mission validation.`;
