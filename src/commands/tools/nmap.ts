// ── commands/tools/nmap.ts ────────────────────────────────────────
// Simulador de escaneo de puertos Nmap con flags realistas
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta resultados del escaneo para que el laboratorio valide.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';

const NMAP_HELP = `Nmap 7.92 ( https://nmap.org ) — Simulated Help

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

EXAMPLES:
  nmap -sV 192.168.1.10
  nmap -sS -p 22,80,443 192.168.1.10
  nmap -sV -v -O 192.168.1.10
  nmap -sV -p- 192.168.1.10
  nmap -sV -oN scan.txt 192.168.1.10
  nmap -sn 192.168.1.10
  nmap -sV -vvv -A 192.168.1.10`;

export const cmd_nmap = {
  name: 'nmap',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('--help') || args.includes('-h')) return { output: NMAP_HELP };
    if (!args.length) return { output: 'Usage: nmap [Scan Type] [Options] <target>\nExample: nmap -sV -p 22,80 192.168.1.10\nFor full help, run: nmap -h or nmap --help', isError: true };

    // ── Parse flags ──
    const scanTypes = ['-sS', '-sT', '-sV', '-sn', '-sP'];
    const scanType = args.find(a => scanTypes.includes(a)) || '-sT';
    const isPingScan = scanType === '-sn' || scanType === '-sP';
    const isVersionScan = scanType === '-sV';
    const isSYNScan = scanType === '-sS';

    const vLevel = args.includes('-vvv') ? 3 : args.includes('-vv') ? 2 : args.includes('-v') ? 1 : 0;

    const osDetect = args.includes('-O');
    const noPing = args.includes('-Pn');
    const aggressive = args.includes('-A');

    // Output files
    const oNIdx = args.indexOf('-oN');
    const oGIdx = args.indexOf('-oG');
    const outputFileNormal = oNIdx >= 0 ? args[oNIdx + 1] : null;
    const outputFileGrep = oGIdx >= 0 ? args[oGIdx + 1] : null;

    // ── Parse target IP ──
    const ip = args.find(a => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(a));
    if (!ip) return { output: 'Error: especifica una IP válida.', isError: true };

    const target = ctx.allMachines.find(m => m.machine_info.ip === ip);
    if (!target) return { output: `Nmap: Failed to resolve "${ip}".`, isError: true };

    // ── Discovery check (skip with -Pn) ──
    if (!noPing && (target.discovery_level ?? 0) < 1) {
      return {
        output: `Error: No se puede escanear puertos de ${ip}.\nPrimero realiza el reconocimiento de red con: arp-scan <network/cidr>`,
        isError: true
      };
    }

    // ── Parse port specification ──
    const ports = parsePorts(args, target);

    // ── Ping scan (-sn / -sP) ──
    if (isPingScan) {
      let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
      if (vLevel >= 1) output += `Initiating Ping Scan at ${new Date().toLocaleTimeString()}\n`;
      output += `Nmap scan report for ${target.machine_info.hostname} (${ip})\n`;
      output += `Host is up (0.0045s latency).\n`;
      if (vLevel >= 1) output += `MAC Address: ${target.machine_info.mac} (${getVendor(target.machine_info.mac)})\n`;
      if (vLevel >= 2) output += `Device type: ${target.machine_info.type === 'workstation' ? 'general purpose' : 'server'}\nRunning: ${target.machine_info.os.split(' ')[0]}\n`;
      output += `Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds\n`;

      return { 
        output, 
        scanResults: {
          targetId: target.id,
          targetIp: ip,
          targetHostname: target.machine_info.hostname,
          ports: [], // Ping scan doesn't scan ports
          osDetected: undefined,
        },
        discoveredPorts: target.id 
      };
    }

    // ── Full port scan ──
    const scanLabel = isSYNScan ? 'SYN Stealth Scan' : isVersionScan ? 'Service scan' : 'Connect Scan';
    const scanTime = (ports.length * 0.02 + 0.5).toFixed(2);
    const attackerIp = ctx.machine?.machine_info?.ip || '192.168.1.5';

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;

    if (vLevel >= 1) {
      output += `Initiating ${scanLabel} at ${new Date().toLocaleTimeString()}\n`;
    }

    if (isSYNScan && vLevel === 0) {
      output += `Scanning ${target.machine_info.hostname} (${ip}) [1 host] - SYN Stealth Scan\n`;
    }

    if (noPing) {
      output += `Warning: ${ip} is using a static IP, skipping host discovery (-Pn)\n`;
    }

    output += `Nmap scan report for ${target.machine_info.hostname} (${ip})\n`;
    if (vLevel >= 1) output += `Host is up (0.0045s latency).\n`;
    if (vLevel >= 1) output += `MAC Address: ${target.machine_info.mac} (${getVendor(target.machine_info.mac)})\n`;
    output += `\n`;

    // ── Port results ──
    const openPorts = ports.filter(p => p.state === 'open');
    const filteredPorts = ports.filter(p => p.state === 'filtered');
    const closedPorts = ports.filter(p => p.state === 'closed');

    // Determine if ports were explicitly specified with -p
    const portsExplicit = args.some(a => a === '-p' || a.startsWith('-p'));

    if (isVersionScan) {
      output += 'PORT      STATE    SERVICE     VERSION\n';
    } else {
      output += 'PORT      STATE    SERVICE\n';
    }

    // Open ports always shown
    openPorts.forEach(p => {
      const portStr = `${p.port}/${p.protocol}`.padEnd(10);
      const stateStr = p.state.padEnd(9);
      const svcStr = p.service.padEnd(12);
      output += isVersionScan
        ? `${portStr}${stateStr}${svcStr}${p.version}\n`
        : `${portStr}${stateStr}${svcStr}\n`;
    });

    // Filtered ports: shown with -v OR when -p- is used
    if ((vLevel >= 1 || args.includes('-p-')) && filteredPorts.length > 0) {
      filteredPorts.forEach(p => {
        const portStr = `${p.port}/${p.protocol}`.padEnd(10);
        const stateStr = p.state.padEnd(9);
        output += `${portStr}${stateStr}${p.service}\n`;
      });
    }

    // Closed ports: shown individually when explicitly requested with -p
    if (portsExplicit && closedPorts.length > 0 && closedPorts.length <= 20) {
      closedPorts.forEach(p => {
        const portStr = `${p.port}/${p.protocol}`.padEnd(10);
        const stateStr = p.state.padEnd(9);
        output += `${portStr}${stateStr}${p.service}\n`;
      });
    }

    // Not shown line
    const shownCount = openPorts.length +
      ((vLevel >= 1 || args.includes('-p-')) ? filteredPorts.length : 0) +
      (portsExplicit && closedPorts.length > 0 && closedPorts.length <= 20 ? closedPorts.length : 0);
    const notShown = ports.length - shownCount;
    if (notShown > 0) {
      output += `\nNot shown: ${notShown} closed port${notShown > 1 ? 's' : ''}\n`;
    }

    // ── OS Detection (-O) ──
    if (osDetect || aggressive) {
      output += `\n`;
      if (vLevel >= 1) output += `Initiating OS detection at ${new Date().toLocaleTimeString()}\n`;
      output += `Device type: ${target.machine_info.type === 'workstation' ? 'general purpose' : target.machine_info.type}\n`;
      const osBase = target.machine_info.os.split(' ')[0];
      const osNum = target.machine_info.os.includes('7') ? '7' : target.machine_info.os.includes('20') ? '20' : target.machine_info.os.includes('22') ? '22' : '';
      output += `Running: ${osBase} ${osNum}\n`;
      output += `OS CPE: cpe:/o:${target.machine_info.os.toLowerCase().includes('windows') ? 'microsoft' : 'canonical'}:${target.machine_info.os.toLowerCase().includes('windows') ? 'windows' : 'ubuntu_linux'}\n`;
      output += `OS details: ${target.machine_info.os}\n`;
      if (vLevel >= 2) {
        output += `Network Distance: 1 hops\n`;
        output += `TCP Sequence Prediction: Difficulty=256 (Good luck!)\n`;
        output += `IP ID Sequence Generation: Incremental\n`;
      }
    }

    // ── Aggressive mode (-A) ──
    if (aggressive) {
      output += `\n`;
      output += `Host script results:\n`;
      if (target.machine_info.os.toLowerCase().includes('windows')) {
        output += `|_smb-os-discovery: OS: ${target.machine_info.os}\n`;
        output += `|_  Computer name: ${target.machine_info.hostname.toLowerCase()}\n`;
        output += `|_  System time: ${new Date().toLocaleString()}\n`;
      }
    }

    // ── Verbose timing & stats ──
    if (vLevel >= 3) {
      output += `\n`;
      openPorts.slice(0, 3).forEach(p => {
        const sport = Math.floor(Math.random() * 50000 + 10000);
        output += `SENT (${(Math.random() * 0.01).toFixed(4)}s) TCP ${attackerIp}:${sport} > ${ip}:${p.port} S\n`;
        output += `RCVD (${(Math.random() * 0.01 + 0.001).toFixed(4)}s) TCP ${ip}:${p.port} > ${attackerIp}:${sport} SA\n`;
      });
      output += `\n`;
    }

    output += `\nNmap done: 1 IP address (1 host up) scanned in ${scanTime} seconds\n`;

    // ── Build output files ──
    const createdFiles: FileEntry[] = [];

    if (outputFileNormal) {
      createdFiles.push({ path: outputFileNormal, content: output, type: 'text' });
    }

    if (outputFileGrep) {
      let grepOutput = `# Nmap ${new Date().toLocaleString()} scan initiated with ${args.join(' ')}\n`;
      openPorts.forEach(p => {
        grepOutput += `Host: ${ip} (${target.machine_info.hostname})\tPorts: ${p.port}/${p.protocol}/${p.state}//${p.service}/${isVersionScan ? p.version : ''}\n`;
      });
      createdFiles.push({ path: outputFileGrep, content: grepOutput, type: 'text' });
    }

    // ── Update discovery level ──
    target.discovery_level = Math.max(target.discovery_level ?? 0, 2);

    const response: CommandResponse = {
      output,
      // Metadata para que el laboratorio valide
      scanResults: {
        targetId: target.id,
        targetIp: ip,
        targetHostname: target.machine_info.hostname,
        ports: openPorts.map(p => ({
          port: p.port,
          protocol: p.protocol,
          state: p.state,
          service: p.service,
          version: p.version
        })),
        osDetected: osDetect || aggressive ? target.machine_info.os : undefined,
      },
      discoveredPorts: target.id,
    };

    if (createdFiles.length > 0) {
      response.createdFiles = createdFiles;
    }

    return response;
  }
};

// ── Helpers ──

function parsePorts(args: string[], target: any): any[] {
  const allPorts = target.scan_results.ports || [];

  // Find -p flag: could be '-p22,80' or '-p' followed by '22,80'
  let portSpec: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p' && i + 1 < args.length) {
      portSpec = args[i + 1];
      break;
    }
    if (args[i].startsWith('-p') && args[i].length > 2) {
      portSpec = args[i].slice(2);
      break;
    }
  }

  if (portSpec === null) {
    // Default: all defined ports on target
    return allPorts;
  }

  if (portSpec === '-') {
    // -p- : all 65535 ports (simulated: all defined + common closed)
    const result = [...allPorts];
    // Add common closed ports for realism
    const commonClosed = [21, 23, 25, 53, 110, 111, 135, 139, 143, 993, 995, 1433, 3306, 3389, 5432, 5900, 6379, 8080, 8443];
    commonClosed.forEach(portNum => {
      if (!result.find((p: any) => p.port === portNum)) {
        result.push({ port: portNum, protocol: 'tcp', state: 'closed', service: getKnownService(portNum), version: '' });
      }
    });
    return result.sort((a: any, b: any) => a.port - b.port);
  }

  const requestedPorts = new Set<number>();

  portSpec.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          requestedPorts.add(i);
        }
      }
    } else {
      const n = Number(part);
      if (!isNaN(n)) requestedPorts.add(n);
    }
  });

  // Match requested ports against target's known ports
  const matched = allPorts.filter((p: any) => requestedPorts.has(p.port));

  // Add simulated closed ports for requested ports not on target
  requestedPorts.forEach(portNum => {
    if (!allPorts.find((p: any) => p.port === portNum)) {
      matched.push({ port: portNum, protocol: 'tcp', state: 'closed', service: getKnownService(portNum), version: '' });
    }
  });

  return matched.sort((a: any, b: any) => a.port - b.port);
}

function getKnownService(port: number): string {
  const wellKnown: Record<number, string> = {
    21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'domain',
    80: 'http', 110: 'pop3', 111: 'rpcbind', 135: 'msrpc', 139: 'netbios-ssn',
    143: 'imap', 443: 'https', 445: 'microsoft-ds', 993: 'imaps', 995: 'pop3s',
    1433: 'ms-sql-s', 1521: 'oracle', 2049: 'nfs', 3306: 'mysql', 3389: 'ms-wbt-server',
    5432: 'postgresql', 5900: 'vnc', 6379: 'redis', 8080: 'http-proxy', 8443: 'https-alt',
    27017: 'mongod',
  };
  return wellKnown[port] || 'unknown';
}

function getVendor(mac: string): string {
  const prefix = mac.slice(0, 8).toUpperCase();
  const vendors: Record<string, string> = {
    '08:00:27': 'PCS Systemtechnik GmbH (VirtualBox)',
    '00:0C:29': 'VMware',
    '52:54:00': 'QEMU',
    '00:15:5D': 'Microsoft Hyper-V',
  };
  return vendors[prefix] || 'Unknown';
}

// Types for scan results (used by labs to validate)
export interface ScanResultPort {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version?: string;
}

export interface ScanResults {
  targetId: string;
  targetIp: string;
  targetHostname: string;
  ports: ScanResultPort[];
  osDetected?: string;
}
