// ── commands/tools/netdiscover.ts ──────────────────────────────────
// Simulador de descubrimiento de hosts pasivo/activo (netdiscover)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta hosts descubiertos para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';

const NETDISCOVER_HELP = `Netdiscover 0.7 ( https://github.com/netdiscover-scanner/netdiscover )

Usage: netdiscover [options]

Options:
  -i <iface>      Interface to use (default: eth0)
  -r <range>      Scan given range (e.g., 192.168.1.0/24)
  -p              Passive mode (listen only, don't send)
  -n <node>       Last octet of IP to start scanning from (2-253)
  -c <count>      Number of requests to send (default: 1)
  -S <sleep>      Time between requests (seconds, default: 1)
  -f              Enable fast mode (sleep 0.5s instead of 1s)
  -d              Ignore home/small network detection
  -P              Print results in a format suitable for parsing
  -L              Use syslog (disabled in this simulator)
  -N              Don't resolve names (disabled in this simulator)
  -v              Verbose mode
  -h              Display this help message

Examples:
  netdiscover -r 192.168.1.0/24
  netdiscover -r 10.0.0.0/16 -f
  netdiscover -p -i eth0
  netdiscover -r 172.16.0.0/16 -n 50 -c 3`;

export const cmd_netdiscover = {
  name: 'netdiscover',
  execute: (args: string[], { machine, allMachines }: CommandContext): CommandResponse => {
    // Help flag
    if (args.includes('-h') || args.includes('--help')) {
      return { output: NETDISCOVER_HELP };
    }

    // Parse options
    const rangeIdx = args.indexOf('-r');
    let range = rangeIdx >= 0 ? args[rangeIdx + 1] : null;
    
    const isPassive = args.includes('-p');
    const isFast = args.includes('-f');
    const isParsable = args.includes('-P');
    const isVerbose = args.includes('-v');
    
    // Parse optional start node
    const nodeIdx = args.indexOf('-n');
    const startNode = nodeIdx >= 0 ? parseInt(args[nodeIdx + 1], 10) : 2;
    
    // Parse request count
    const countIdx = args.indexOf('-c');
    const requestCount = countIdx >= 0 ? parseInt(args[countIdx + 1], 10) : 1;

    // Auto-detect range from machine IP if not specified
    if (!range && machine?.machine_info?.ip) {
      const ipParts = machine.machine_info.ip.split('.');
      if (ipParts.length === 4) {
        range = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;
      }
    }

    // Validate range
    if (!range) {
      return { 
        output: 'Error: No range specified and cannot auto-detect. Use -r <range>\nExample: netdiscover -r 192.168.1.0/24', 
        isError: true 
      };
    }

    // Parse CIDR
    const cidrParts = range.split('/');
    if (cidrParts.length !== 2) {
      return { output: 'Error: Invalid range format. Use CIDR notation (e.g., 192.168.1.0/24)', isError: true };
    }

    const maskBits = parseInt(cidrParts[1], 10);
    if (isNaN(maskBits) || maskBits < 16 || maskBits > 30) {
      return { output: 'Error: Invalid network mask. Use /16 to /30 (e.g., 192.168.1.0/24)', isError: true };
    }

    const ipParts = cidrParts[0].split('.');
    if (ipParts.length !== 4 || ipParts.some(p => {
      const num = parseInt(p, 10);
      return isNaN(num) || num < 0 || num > 255;
    })) {
      return { output: 'Error: Invalid IP address format', isError: true };
    }

    const baseIp = ipParts.slice(0, 3).join('.');
    const networkPrefix = ipParts[0] + '.' + ipParts[1];

    // Collect discovered hosts
    const discoveredHosts: Array<{ip: string; mac: string; hostname: string}> = [];
    
    // Simulate scanning
    let output = '';
    
    if (!isParsable) {
      output += `_______________________________________________________________\n`;
      output += `  Netdiscover ${isPassive ? '- Passive mode' : ''} ${isFast ? '- Fast mode' : ''}\n`;
      output += `  Interface: eth0, MAC: ${machine.machine_info.mac}, IP: ${machine.machine_info.ip}\n`;
      output += `  Scanning range: ${range}\n`;
      if (!isPassive) {
        output += `  Sending ${requestCount} request${requestCount > 1 ? 's' : ''} per IP...\n`;
      }
      output += `_______________________________________________________________\n\n`;
    }

    // Find machines in the network
    let foundCount = 0;
    allMachines.forEach(m => {
      if (m.machine_info.ip && m.machine_info.ip.startsWith(baseIp)) {
        const ipLastOctet = m.machine_info.ip.split('.')[3];
        
        // Skip if before start node
        if (parseInt(ipLastOctet, 10) < startNode) return;

        discoveredHosts.push({
          ip: m.machine_info.ip,
          mac: m.machine_info.mac,
          hostname: m.machine_info.hostname
        });

        if (isParsable) {
          output += `${m.machine_info.ip}\t${m.machine_info.mac}\t${getVendor(m.machine_info.mac)}\n`;
        } else {
          output += `  ${m.machine_info.ip}\t${m.machine_info.mac}\t${getVendor(m.machine_info.mac)}\n`;
          if (isVerbose) {
            output += `    └─ Hostname: ${m.machine_info.hostname}\n`;
            output += `    └─ OS: ${m.machine_info.os}\n`;
          }
        }
        foundCount++;
      }
    });

    if (!isParsable) {
      if (foundCount === 0) {
        output += `  No hosts found in the specified range.\n`;
        if (!isPassive) {
          output += `  Try passive mode (-p) or check if hosts block ICMP/ARP.\n`;
        }
      }
      
      output += `\n_______________________________________________________________\n`;
      output += `  ${foundCount} host${foundCount !== 1 ? 's' : ''} found\n`;
      
      const totalHosts = Math.pow(2, 32 - maskBits) - 2; // minus network and broadcast
      const scanTime = (totalHosts * (isFast ? 0.5 : 1.0) / 10).toFixed(2);
      output += `  Scan completed in ${scanTime} seconds\n`;
    }

    return {
      output,
      discoveredHosts: discoveredHosts.length > 0 ? discoveredHosts : undefined,
      networkScanned: baseIp,
    };
  }
};

function getVendor(mac: string): string {
  const prefix = mac.slice(0, 8).toUpperCase();
  const vendors: Record<string, string> = {
    '08:00:27': 'Oracle Corporation (VirtualBox)',
    '00:0C:29': 'VMware, Inc.',
    '52:54:00': 'QEMU Virtual NIC',
    '00:15:5D': 'Microsoft Hyper-V',
    '00:50:56': 'VMware, Inc.',
    '00:1C:42': 'Parallels, Inc.',
  };
  return vendors[prefix] || 'Unknown vendor';
}
