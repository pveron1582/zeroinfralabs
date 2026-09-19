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
      return { output: 'Usage: gobuster dir -u http://<IP> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt [-x php,txt] [-t 50]', isError: true };

    const url = args[urlIdx + 1];
    const wl = args[wIdx + 1];
    if (!url || url.includes('<IP>')) return { output: 'Error: Reemplaza <IP> por la IP real.', isError: true };

    // Validar wordlist - acepta common.txt de SecLists, tolerante a rutas alternativas que terminen en common.txt
    if (!wl || (!wl.includes('SecLists/Discovery/Web-Content/common.txt') && !wl.endsWith('common.txt'))) {
      return { 
        output: `Error: Wordlist "${wl}" not valid for directory enumeration.\nUse: -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`, 
        isError: true 
      };
    }

    // Flags tolerantes: -x (extensiones), -t (threads), -k, --wildcard, -s, -b, -e
    const xIdx = args.indexOf('-x');
    const extensions: string[] = xIdx !== -1 && args[xIdx + 1] ? args[xIdx + 1].split(',').map(s => s.trim().replace(/^\./, '')).filter(Boolean) : [];
    const tIdx = args.indexOf('-t');
    const threads = tIdx !== -1 ? parseInt(args[tIdx + 1], 10) || 10 : 10;

    const target = allMachines.find(m => url.includes(m.machine_info.ip));
    if (!target) return { output: `Error: ${url} no es alcanzable.`, isError: true };

    // Comando libre - no valida discovery_level

    let output = `===============================================================\nGobuster v3.1.0\n===============================================================\n[+] Url: ${url}\n[+] Wordlist: ${wl}\n[+] Threads: ${threads}\n`;
    if (extensions.length) output += `[+] Extensions: ${extensions.join(',')}\n`;
    output += `===============================================================\n${new Date().toLocaleString()} Starting\n===============================================================\n`;

    const foundDirectories: Array<{path: string; status: number; size?: number}> = [];
    
    target.web_enumeration?.directories?.forEach(d => {
      if (d.status === 200 || d.status === 301) {
        const size = Math.floor(Math.random() * 4000 + 500);
        output += `${d.path.padEnd(25)} (Status: ${d.status}) [Size: ${size}]\n`;
        foundDirectories.push({ path: d.path, status: d.status, size });
        // Si se pidieron extensiones, simular hallazgos adicionales con extensión
        if (extensions.length) {
          for (const ext of extensions.slice(0, 2)) {
            const extPath = `${d.path}.${ext}`;
            // Solo simular si no existe ya
            if (!target.web_enumeration?.directories?.some(x => x.path === extPath)) {
              const extSize = Math.floor(Math.random() * 3000 + 300);
              output += `${extPath.padEnd(25)} (Status: 200) [Size: ${extSize}]\n`;
              foundDirectories.push({ path: extPath, status: 200, size: extSize });
            }
          }
        }
      }
    });
    
    output += `===============================================================\n${new Date().toLocaleString()} Finished\n===============================================================`;

    const outputLines = output.split('\n');
    return {
      output,
      type: 'dirEnum',
      streamingLineDelays: outputLines.map(() => 30 + Math.random() * 50),
      foundDirectories: foundDirectories.length > 0 ? {
        targetId: target.id,
        targetUrl: url,
        directories: foundDirectories,
      } : undefined,
    };
  }
};
