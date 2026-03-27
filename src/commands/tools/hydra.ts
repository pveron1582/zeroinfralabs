// ── commands/tools/hydra.ts ──────────────────────────────────────
// Simulador de fuerza bruta de credenciales

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_hydra = {
  name: 'hydra',
  execute: (args: string[], { allMachines, currentMissionId }: CommandContext): CommandResponse => {
    const lIdx = args.indexOf('-l');
    const pIdx = args.indexOf('-P');
    if (lIdx === -1 || pIdx === -1)
      return { output: 'Uso: hydra -l <user> -P <wordlist> <IP> <service>\nEjemplo: hydra -l root -P rockyou.txt 10.10.10.11 ssh', isError: true };

    const user = args[lIdx + 1];
    const wl = args[pIdx + 1];

    if (!wl || !wl.includes('rockyou.txt')) {
      return { output: `Error: wordlist "${wl}" no válida para este laboratorio.\nUsa: -P /usr/share/wordlists/rockyou.txt`, isError: true };
    }

    let ip = '', svc = '';
    const uriArg = args.find(a => a.includes('://'));
    if (uriArg) {
      [svc, ip] = uriArg.split('://');
    } else {
      const nf = args.filter((a, i) => !a.startsWith('-') && !(i > 0 && args[i - 1].startsWith('-')));
      if (nf.length >= 2) { ip = nf[nf.length - 2]; svc = nf[nf.length - 1]; }
    }

    if (!ip || !svc) return { output: 'Uso: hydra -l <user> -P <wordlist> <IP> <service>', isError: true };

    const target = allMachines.find(m => m.machine_info.ip === ip);
    if (!target) return { output: `Error: ${ip} no responde.`, isError: true };

    if ((target.discovery_level ?? 0) < 2) {
      return {
        output: `Error: No se puede realizar fuerza bruta contra ${ip}.\nPrimero escanea puertos con: nmap -sV ${ip}`,
        isError: true
      };
    }

    const port = target.scan_results.ports.find(p => p.service.toLowerCase() === svc.toLowerCase());
    if (!port) return { output: `Error: servicio ${svc} no encontrado en ${ip}.`, isError: true };

    let output = `Hydra v9.2 starting at ${new Date().toLocaleString()}\n[DATA] target: ${ip}, service: ${svc}, port: ${port.port}\n[ATTACK] user "${user}" | wordlist "${wl}"\n`;

    if (port.credentials && port.credentials.user === user) {
      output += `\n[${port.port}][${svc}] host: ${ip}   login: ${user}   password: ${port.credentials.pass}\n1 of 1 target successfully completed, 1 valid password found`;

      let missionId: number | undefined;
      for (const m of allMachines) {
        const step = m.learning_steps.find(s =>
          s.task.toLowerCase().includes('hydra') ||
          s.task.toLowerCase().includes('fuerza') ||
          s.task.toLowerCase().includes('brute')
        );
        if (step) { missionId = step.id; break; }
      }

      const canComplete = currentMissionId === (missionId || 3);
      // No mutar directamente el estado aquí; el discovery_level se actualiza en completeMission
      return {
        output,
        completedMissionId: canComplete ? (missionId || 3) : undefined,
        foundCredentials: {
          machineId: target.id,
          user,
          pass: port.credentials.pass,
          file: `/etc/hydra_${svc}.txt`,
          service: svc.toLowerCase() // 'ssh', 'ftp', etc.
        }
      };
    }

    return { output: output + `\n[ERROR] No valid password found for user "${user}"`, isError: true };
  }
};
