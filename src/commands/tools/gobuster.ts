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
      return { output: 'Usage: gobuster dir -u http://<IP> -w <wordlist> [-x php,txt] [-t 50] [-s 200,301] [-b 404] [-e] [-k] [--wildcard]\nExample: gobuster dir -u http://10.10.10.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt -x php,txt -t 50', isError: true };

    const url = args[urlIdx + 1];
    const wl = args[wIdx + 1];
    if (!url || url.includes('<IP>')) return { output: 'Error: Reemplaza <IP> por la IP real.', isError: true };

    // Wordlist flexible: se acepta cualquier -w (common.txt, directory-list-*.txt,
    // big.txt, raft-*.txt...). Los hallazgos derivan del estado virtual
    // (web_enumeration.directories), no del contenido de la wordlist.
    if (!wl) return { output: 'Error: falta wordlist. Usa -w <wordlist>.', isError: true };

    // Flags: -x (extensiones), -t (threads), -s (códigos a mostrar),
    // -b (códigos a ocultar), -e (URLs expandidas), -k (ignorado: solo http),
    // --wildcard (procesar respuestas wildcard).
    const xIdx = args.indexOf('-x');
    const extensions: string[] = xIdx !== -1 && args[xIdx + 1] ? args[xIdx + 1].split(',').map(s => s.trim().replace(/^\./, '')).filter(Boolean) : [];
    const tIdx = args.indexOf('-t');
    const threads = tIdx !== -1 ? parseInt(args[tIdx + 1], 10) || 10 : 10;
    // Códigos default del gobuster real: 200,204,301,302,307,401,403
    const parseCodes = (v: string | undefined): number[] =>
      v ? v.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];
    const sIdx = args.indexOf('-s');
    const showStatus = sIdx !== -1 && args[sIdx + 1] ? parseCodes(args[sIdx + 1]) : [200, 204, 301, 302, 307, 401, 403];
    const bIdx = args.indexOf('-b');
    const hideStatus = bIdx !== -1 && args[bIdx + 1] ? parseCodes(args[bIdx + 1]) : [];
    const expanded = args.includes('-e');
    const wildcard = args.includes('--wildcard');

    const target = allMachines.find(m => url.includes(m.machine_info.ip));
    if (!target) return { output: `Error: ${url} no es alcanzable.`, isError: true };

    // Comando libre - no valida discovery_level

    let output = `===============================================================\nGobuster v3.1.0\n===============================================================\n[+] Url: ${url}\n[+] Wordlist: ${wl}\n[+] Threads: ${threads}\n`;
    if (extensions.length) output += `[+] Extensions: ${extensions.join(',')}\n`;
    if (wildcard) output += `[+] Wildcard: processing wildcard responses\n`;
    output += `===============================================================\n${new Date().toLocaleString()} Starting\n===============================================================\n`;

    const foundDirectories: Array<{path: string; status: number; size?: number}> = [];
    const base = url.replace(/\/$/, '');
    const showDir = (status: number) => showStatus.includes(status) && !hideStatus.includes(status);

    target.web_enumeration?.directories?.forEach(d => {
      if (showDir(d.status)) {
        const size = Math.floor(Math.random() * 4000 + 500);
        const label = expanded ? `${base}${d.path}` : d.path.padEnd(25);
        output += `${label} (Status: ${d.status}) [Size: ${size}]\n`;
        foundDirectories.push({ path: d.path, status: d.status, size });
        // Si se pidieron extensiones, simular hallazgos adicionales con extensión
        if (extensions.length) {
          for (const ext of extensions.slice(0, 2)) {
            const extPath = `${d.path}.${ext}`;
            // Solo simular si no existe ya
            if (!target.web_enumeration?.directories?.some(x => x.path === extPath)) {
              const extSize = Math.floor(Math.random() * 3000 + 300);
              const extLabel = expanded ? `${base}${extPath}` : extPath.padEnd(25);
              output += `${extLabel} (Status: 200) [Size: ${extSize}]\n`;
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
