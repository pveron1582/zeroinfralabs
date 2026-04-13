// ── commands/tools/arp-scan.ts ───────────────────────────────────
// Simulador de descubrimiento de hosts ARP
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta hosts descubiertos para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_arpScan = {
  name: 'arp-scan',
  execute: (args: string[], { machine, allMachines }: CommandContext): CommandResponse => {
    const target = args.find(a => a.includes('/'));
    if (!target) return { output: 'Usage: arp-scan <network/cidr>\nExample: arp-scan 192.168.1.0/24', isError: true };
    if (target === '<network/cidr>') return { output: 'Error: Reemplaza <network/cidr> con el rango real.', isError: true };

    // Validate format: must be x.x.x.0/24
    const parts = target.split('/');
    if (parts.length !== 2 || parts[1] !== '24') {
      return { output: 'Error: Invalid network mask. Use /24 (e.g., 192.168.1.0/24)', isError: true };
    }
    const ipParts = parts[0].split('.');
    if (ipParts.length !== 4 || ipParts[3] !== '0') {
      return { output: 'Error: Invalid network address. Must end in .0 (e.g., 192.168.1.0/24)', isError: true };
    }

    const baseIp = ipParts.slice(0, 3).join('.');

    // Collect discovered hosts
    const discoveredHosts: Array<{ip: string; mac: string; hostname: string}> = [];
    let output = `Interface: eth0, MAC: ${machine.machine_info.mac}, IP: ${machine.machine_info.ip}\nStarting arp-scan 1.9.7 with 256 hosts\n\n`;
    let count = 0;
    
    allMachines.forEach(m => {
      if (m.machine_info.ip && m.machine_info.ip.startsWith(baseIp)) {
        output += `${m.machine_info.ip}\t${m.machine_info.mac}\tOracle Corporation\n`;
        discoveredHosts.push({
          ip: m.machine_info.ip,
          mac: m.machine_info.mac,
          hostname: m.machine_info.hostname
        });
        count++;
      }
    });
    
    output += `\n${count} packets received, 0 dropped\n${count} hosts responded`;

    return {
      output,
      // Metadata para que el laboratorio valide
      discoveredHosts: discoveredHosts.length > 0 ? discoveredHosts : undefined,
      networkScanned: baseIp,
    };
  }
};
