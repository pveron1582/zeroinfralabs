// ── commands/tools/nmap.ts ────────────────────────────────────────
// Simulador de escaneo de puertos Nmap

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_nmap = {
  name: 'nmap',
  execute: (args: string[], { allMachines, currentMissionId }: CommandContext): CommandResponse => {
    if (!args.length) return { output: 'Uso: nmap -sV <IP>\nEjemplo: nmap -sV <IP>', isError: true };

    const ip = args.find(a => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(a));
    if (!ip) return { output: 'Error: especifica una IP válida.', isError: true };

    const target = allMachines.find(m => m.machine_info.ip === ip);
    if (!target) return { output: `Nmap: Failed to resolve "${ip}".`, isError: true };

    if ((target.discovery_level ?? 0) < 1) {
      return {
        output: `Error: No se puede escanear puertos de ${ip}.\nPrimero realiza el reconocimiento de red con: arp-scan <network/cidr>`,
        isError: true
      };
    }

    const hasSV = args.includes('-sV');
    let output = `Starting Nmap 7.92 at ${new Date().toLocaleTimeString()}\nNmap scan report for ${target.machine_info.hostname} (${ip})\nHost is up (0.0045s latency).\n\n`;
    output += hasSV ? 'PORT      STATE   SERVICE   VERSION\n' : 'PORT      STATE   SERVICE\n';

    target.scan_results.ports.forEach(p => {
      const pc = `${p.port}/${p.protocol}`.padEnd(10);
      const sc = p.state.padEnd(8);
      const vc = p.service.padEnd(10);
      output += hasSV ? `${pc}${sc}${vc}${p.version}\n` : `${pc}${sc}${vc}\n`;
    });
    output += `\nNmap done: 1 IP address (1 host up) scanned in 2.45 seconds`;

    // Buscar si nmap completa una misión de este escenario
    let missionId: number | undefined;
    for (const m of allMachines) {
      const step = m.learning_steps.find(s =>
        s.task.toLowerCase().includes('escaneo') || 
        s.task.toLowerCase().includes('puerto') ||
        s.task.toLowerCase().includes('nmap')
      );
      if (step) { missionId = step.id; break; }
    }

    const canComplete = currentMissionId === (missionId || 2);

    // FIX #9: nmap descubre el sistema operativo (discovery_level 2)
    // Esto se debe reflejar en la máquina objetivo para que el mapa la muestre
    target.discovery_level = Math.max(target.discovery_level ?? 0, 2);

    return {
      output,
      completedMissionId: canComplete ? (missionId || 2) : undefined
    };
  }
};
