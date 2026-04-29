// ── commands/tools/gobuster.ts ─────────────────────────────────────
// Simulador de enumeración de directorios web
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta directorios encontrados para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_gobuster = {
  name: 'gobuster',
  execute: (args: string[], { allMachines }: CommandContext): CommandResponse => {
    const urlIdx = args.indexOf('-u');
    const wIdx = args.indexOf('-w');
    if (args[0] !== 'dir' || urlIdx === -1 || wIdx === -1)
      return { output: 'Usage: gobuster dir -u http://<IP> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', isError: true };

    const url = args[urlIdx + 1];
    const wl = args[wIdx + 1];
    if (!url || url.includes('<IP>')) return { output: 'Error: Reemplaza <IP> por la IP real.', isError: true };

    // Validar wordlist - debe ser common.txt de SecLists en la ruta correcta
    if (!wl || !wl.includes('SecLists/Discovery/Web-Content/common.txt')) {
      return { 
        output: `Error: Wordlist "${wl}" not valid for directory enumeration.\nUse: -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`, 
        isError: true 
      };
    }

    const target = allMachines.find(m => url.includes(m.machine_info.ip));
    if (!target) return { output: `Error: ${url} no es alcanzable.`, isError: true };

    // Comando libre - no valida discovery_level

    let output = `===============================================================\nGobuster v3.1.0\n===============================================================\n[+] Url: ${url}\n[+] Wordlist: ${wl}\n[+] Threads: 10\n===============================================================\n${new Date().toLocaleString()} Starting\n===============================================================\n`;

    const foundDirectories: Array<{path: string; status: number; size?: number}> = [];
    
    target.web_enumeration?.directories?.forEach(d => {
      if (d.status === 200 || d.status === 301) {
        const size = Math.floor(Math.random() * 4000 + 500);
        output += `${d.path.padEnd(25)} (Status: ${d.status}) [Size: ${size}]\n`;
        foundDirectories.push({ path: d.path, status: d.status, size });
      }
    });
    
    output += `===============================================================\n${new Date().toLocaleString()} Finished\n===============================================================`;

    // Comando libre: reporta directorios encontrados para que el lab valide
    return {
      output,
      foundDirectories: foundDirectories.length > 0 ? {
        targetId: target.id,
        targetUrl: url,
        directories: foundDirectories,
      } : undefined,
    };
  }
};
