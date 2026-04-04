// ── commands/tools/arp-scan.ts ───────────────────────────────────
// Simulador de descubrimiento de hosts ARP

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_arpScan = {
  name: 'arp-scan',
  execute: (args: string[], { machine, allMachines, currentMissionId }: CommandContext): CommandResponse => {
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

    // Validate: the scanned range must match at least one non-attacker target
    const hasTarget = allMachines.some(m =>
      !m.id.includes('attacker') && m.machine_info.ip && m.machine_info.ip.startsWith(baseIp)
    );

    let output = `Interface: eth0, MAC: ${machine.machine_info.mac}, IP: ${machine.machine_info.ip}\nStarting arp-scan 1.9.7 with 256 hosts\n\n`;
    let count = 0;
    allMachines.forEach(m => {
      if (m.machine_info.ip && m.machine_info.ip.startsWith(baseIp)) {
        output += `${m.machine_info.ip}\t${m.machine_info.mac}\tOracle Corporation\n`;
        count++;
      }
    });
    output += `\n${count} packets received, 0 dropped\n${count} hosts responded`;

    // If no target machines found in this range, don't complete the mission
    if (!hasTarget) {
      return { output, completedMissionId: undefined };
    }

    let missionId: number | undefined;
    for (const m of allMachines) {
      const step = m.learning_steps.find(s =>
        s.task.toLowerCase().includes('reconnaissance') ||
        s.task.toLowerCase().includes('reconocimiento') ||
        s.task.toLowerCase().includes('arp') ||
        s.task.toLowerCase().includes('discovery') ||
        s.task.toLowerCase().includes('descubrimiento')
      );
      if (step) { missionId = step.id; break; }
    }

    const canComplete = currentMissionId === (missionId || 1);
    return {
      output,
      completedMissionId: canComplete ? (missionId || 1) : undefined
    };
  }
};
