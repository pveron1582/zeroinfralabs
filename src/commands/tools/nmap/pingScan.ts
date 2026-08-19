// ── commands/tools/nmap/pingScan.ts ──────────────────────────────
// Escaneos de descubrimiento de hosts: -sn/-sP sobre IP única o CIDR

import type { CommandContext, CommandResponse, Machine } from '../../../types';
import { getVendor } from './vendors';
import { isIpInCidr, parseCidr } from './cidr';

export function performPingScan(target: Machine, ip: string, vLevel: number): CommandResponse {
  let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
  if (vLevel >= 1) output += `Initiating Ping Scan at ${new Date().toLocaleTimeString()}\n`;
  output += `Nmap scan report for ${target.machine_info.hostname} (${ip})\n`;
  output += `Host is up (0.0045s latency).\n`;
  // Same subnet: el nmap real muestra la MAC sin necesidad de -v
  output += `MAC Address: ${target.machine_info.mac} (${getVendor(target.machine_info.mac)})\n`;
  if (vLevel >= 2) output += `Device type: ${target.machine_info.type === 'workstation' ? 'general purpose' : 'server'}\nRunning: ${target.machine_info.os.split(' ')[0]}\n`;
  output += `Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds\n`;

  const lines = output.split('\n');
  return {
    output,
    type: 'scan',
    streamingLineDelays: lines.map(() => 30 + Math.random() * 50),
    scanResults: {
      targetId: target.id,
      targetIp: ip || '',
      targetHostname: target.machine_info.hostname,
      ports: [], // Ping scan doesn't scan ports
      osDetected: undefined,
    },
    discoveredPorts: target.id,
    discoveredHosts: [{
      ip: target.machine_info.ip,
      mac: target.machine_info.mac,
      hostname: target.machine_info.hostname,
    }],
  };
}

export function performNetworkPingScan(
  cidr: string,
  ctx: CommandContext,
  vLevel: number
): CommandResponse {
  const parsed = parseCidr(cidr);
  if (!parsed) {
    return { output: `Error: CIDR inválido "${cidr}".`, isError: true };
  }

  const machinesInNetwork = ctx.allMachines.filter(m =>
    isIpInCidr(m.machine_info.ip, cidr)
  );

  let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
  if (vLevel >= 1) {
    output += `Initiating Ping Scan at ${new Date().toLocaleTimeString()}\n`;
    output += `Scanning ${cidr} [${Math.pow(2, 32 - parsed.mask)} hosts]\n`;
  }

  const hostsFound: Array<{ ip: string; mac: string; hostname: string }> = [];

  if (machinesInNetwork.length === 0) {
    output += `\nNote: Host seems down. If it is really up, but blocking our ping probes,\n`;
    output += `      try -Pn\n`;
  } else {
    machinesInNetwork.forEach(target => {
      const ip = target.machine_info.ip;
      output += `\nNmap scan report for ${target.machine_info.hostname} (${ip})\n`;
      output += `Host is up (${(Math.random() * 0.005 + 0.002).toFixed(4)}s latency).\n`;
      // Same subnet: MAC visible también sin -v (arp/echo en L2)
      output += `MAC Address: ${target.machine_info.mac} (${getVendor(target.machine_info.mac)})\n`;
      hostsFound.push({
        ip: target.machine_info.ip,
        mac: target.machine_info.mac,
        hostname: target.machine_info.hostname
      });
    });
  }

  const totalHosts = Math.pow(2, 32 - parsed.mask);
  output += `\nNmap done: ${totalHosts} IP addresses (${machinesInNetwork.length} host${machinesInNetwork.length !== 1 ? 's' : ''} up) scanned in ${(totalHosts * 0.01).toFixed(2)} seconds\n`;

  const outLines = output.split('\n');
  return {
    output,
    streamingLineDelays: outLines.map(() => 40 + Math.random() * 60),
    discoveredHosts: hostsFound.length > 0 ? hostsFound : undefined,
  };
}
