// ── commands/tools/hydra.ts ──────────────────────────────────────
// Simulador de fuerza bruta de credenciales
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta credenciales encontradas para que el laboratorio valide.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { getKnownPassword } from '../../utils/credentials';

export const cmd_hydra = {
  name: 'hydra',
  execute: (args: string[], { allMachines }: CommandContext): CommandResponse => {
    const lIdx = args.indexOf('-l');
    const pIdx = args.indexOf('-P');
    if (lIdx === -1 || pIdx === -1)
      return { output: 'Usage: hydra -l <user> -P <wordlist> <IP> <service>\nExample: hydra -l root -P rockyou.txt 10.10.10.11 ssh', isError: true };

    const user = args[lIdx + 1];
    const wl = args[pIdx + 1];

    if (!wl || !wl.includes('rockyou.txt')) {
      return { output: `Error: wordlist "${wl}" not valid for this lab.\nUse: -P /usr/share/wordlists/rockyou.txt`, isError: true };
    }

    let ip = '', svc = '';
    const uriArg = args.find(a => a.includes('://'));
    if (uriArg) {
      [svc, ip] = uriArg.split('://');
    } else {
      const nf = args.filter((a, i) => !a.startsWith('-') && !(i > 0 && args[i - 1].startsWith('-')));
      if (nf.length >= 2) { ip = nf[nf.length - 2]; svc = nf[nf.length - 1]; }
    }

    if (!ip || !svc) return { output: 'Usage: hydra -l <user> -P <wordlist> <IP> <service>', isError: true };

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

    // Buscar la wordlist en todas las máquinas disponibles
    const wlFilename = wl.split('/').pop() || wl;
    const wordlistFile = allMachines.reduce<FileEntry | null>((found, m) => {
      if (found) return found;
      return m.files?.find(f => f.path === wl || f.path.endsWith('/' + wlFilename)) || null;
    }, null);
    const hasCorrectPass = port.credentials && (!wordlistFile || wordlistFile.content.includes(port.credentials.pass));

    // También probar contra la tabla de passwords del sistema (known_passwords):
    // cualquier usuario cuyo password esté en la wordlist es válido por fuerza bruta.
    const knownPass = getKnownPassword(target, user);
    const hasKnownPass = knownPass !== undefined && (!wordlistFile || wordlistFile.content.includes(knownPass));

    const portCredOk = port.credentials?.user === user && hasCorrectPass;

    if (portCredOk || hasKnownPass) {
      const foundPass: string = portCredOk ? port.credentials!.pass : knownPass!;

      output += `\n[${port.port}][${svc}] host: ${ip}   login: ${user}   password: ${foundPass}\n1 of 1 target successfully completed, 1 valid password found`;

      // Comando libre: reporta credenciales para que el lab valide
      return {
        output,
        type: 'creds',
        streamingLineDelays: output.split('\n').map(() => 80 + Math.random() * 120),
        foundCredentials: {
          machineId: target.id,
          user,
          pass: foundPass,
          file: `/etc/hydra_${svc}.txt`,
          service: svc.toLowerCase(),
          verified: true,
        }
      };
    }

    const failureOutput = output + `\n[ERROR] No valid password found for user "${user}"`;
    return { 
      output: failureOutput,
      type: 'creds',
      streamingLineDelays: failureOutput.split('\n').map(() => 80 + Math.random() * 120),
      isError: true,
      failedUser: {
        machineId: target.id,
        user
      }
    };
  }
};
