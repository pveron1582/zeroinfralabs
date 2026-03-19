// ── commands/tools/gobuster.ts ─────────────────────────────────────
// Simulador de enumeración de directorios web

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_gobuster = {
  name: 'gobuster',
  execute: (args: string[], { allMachines, currentMissionId }: CommandContext): CommandResponse => {
    const urlIdx = args.indexOf('-u');
    const wIdx = args.indexOf('-w');
    if (args[0] !== 'dir' || urlIdx === -1 || wIdx === -1)
      return { output: 'Uso: gobuster dir -u http://<IP> -w rockyou.txt', isError: true };

    const url = args[urlIdx + 1];
    const wl = args[wIdx + 1];
    if (!url || url.includes('<IP>')) return { output: 'Error: Reemplaza <IP> por la IP real.', isError: true };

    const target = allMachines.find(m => url.includes(m.machine_info.ip));
    if (!target) return { output: `Error: ${url} no es alcanzable.`, isError: true };

    if ((target.discovery_level ?? 0) < 2) {
      return {
        output: `Error: No se puede enumerar directorios de ${url}.\nPrimero escanea puertos con: nmap -sV ${target.machine_info.ip}`,
        isError: true
      };
    }

    let output = `===============================================================\nGobuster v3.1.0\n===============================================================\n[+] Url: ${url}\n[+] Wordlist: ${wl}\n[+] Threads: 10\n===============================================================\n${new Date().toLocaleString()} Starting\n===============================================================\n`;

    target.web_enumeration?.directories?.forEach(d => {
      if (d.status === 200 || d.status === 301)
        output += `${d.path.padEnd(25)} (Status: ${d.status}) [Size: ${Math.floor(Math.random() * 4000 + 500)}]\n`;
    });
    output += `===============================================================\n${new Date().toLocaleString()} Finished\n===============================================================`;

    let missionId: number | undefined;
    for (const m of allMachines) {
      const step = m.learning_steps.find(s =>
        s.task.toLowerCase().includes('directorio') || s.task.toLowerCase().includes('gobuster')
      );
      if (step) { missionId = step.id; break; }
    }

    const canComplete = currentMissionId === (missionId || 4);
    if (canComplete) {
      target.discovery_level = Math.max(target.discovery_level || 0, 3);
    }

    return {
      output,
      completedMissionId: canComplete ? (missionId || 4) : undefined
    };
  }
};
