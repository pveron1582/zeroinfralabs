// ── commands/tools/arp-scan.ts ───────────────────────────────────
// Simulador de descubrimiento de hosts ARP

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_arpScan = {
  name: 'arp-scan',
  execute: (args: string[], { machine, allMachines, currentMissionId }: CommandContext): CommandResponse => {
    const target = args.find(a => a.includes('/'));
    if (!target) return { output: 'Uso: arp-scan <network/cidr>\nEjemplo: arp-scan <IP>/<PREFIJO RED>', isError: true };
    if (target === '<network/cidr>') return { output: 'Error: Reemplaza <network/cidr> con el rango real.', isError: true };

    const baseIp = target.split('/')[0].split('.').slice(0, 3).join('.');
    let output = `Interface: eth0, MAC: ${machine.machine_info.mac}, IP: ${machine.machine_info.ip}\nStarting arp-scan 1.9.7 with 256 hosts\n\n`;
    let count = 0;
    allMachines.forEach(m => {
      if (m.machine_info.ip.startsWith(baseIp)) {
        output += `${m.machine_info.ip}\t${m.machine_info.mac}\tOracle Corporation\n`;
        count++;
      }
    });
    output += `\n${count} packets received, 0 dropped\n${count} hosts responded`;

    let missionId: number | undefined;
    for (const m of allMachines) {
      const step = m.learning_steps.find(s =>
        s.task.toLowerCase().includes('reconocimiento') || s.task.toLowerCase().includes('arp')
      );
      if (step) { missionId = step.id; break; }
    }

    const canComplete = currentMissionId === (missionId || 1);
    // No mutar directamente el estado aquí; el discovery_level se actualiza en completeMission
    return {
      output,
      completedMissionId: canComplete ? (missionId || 1) : undefined
    };
  }
};
