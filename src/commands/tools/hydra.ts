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
    const LIdx = args.indexOf('-L');
    const pIdx = args.indexOf('-p');
    const PIdx = args.indexOf('-P');
    const userArgIdx = lIdx !== -1 ? lIdx : LIdx;
    const passArgIdx = pIdx !== -1 ? pIdx : PIdx;
    if (userArgIdx === -1 || passArgIdx === -1)
      return { output: 'Usage: hydra -l <user>|-L <userfile> -p <pass>|-P <wordlist> [-t <tasks>] [-V] [-f] <IP> <service>\nExample: hydra -l root -P rockyou.txt 10.10.10.11 ssh\n         hydra -L users.txt -P rockyou.txt -t 4 -V -f ssh://10.10.10.11', isError: true };

    const userArg = args[userArgIdx + 1];
    const wl = args[passArgIdx + 1];
    const isUserList = userArgIdx === LIdx;
    const isSinglePass = passArgIdx === pIdx;

    if (!userArg) return { output: 'Error: falta argumento de usuario.', isError: true };
    if (!wl) return { output: `Error: falta wordlist.`, isError: true };

    // Validar wordlist: modo -P exige rockyou.txt, modo -p acepta pass único
    if (!isSinglePass && !wl.includes('rockyou.txt')) {
      return { output: `Error: wordlist "${wl}" not valid for this lab.\nUse: -P /usr/share/wordlists/rockyou.txt`, isError: true };
    }

    let ip = '', svc = '';
    const uriArg = args.find(a => a.includes('://'));
    if (uriArg) {
      [svc, ip] = uriArg.split('://');
    } else {
      // Flags sin valor (-V, -f, ...) no consumen el arg siguiente;
      // el resto (-l, -P, -t, ...) sí. Sin esto, `hydra -V 10.0.0.1 ssh`
      // tragaba la IP como si fuera valor de -V.
      const noValueFlags = new Set(['-V', '-f', '-v', '-d', '-I', '-R', '-q', '-u']);
      const nf = args.filter((a, i) => !a.startsWith('-') && !(i > 0 && args[i - 1].startsWith('-') && !noValueFlags.has(args[i - 1])));
      if (nf.length >= 2) { ip = nf[nf.length - 2]; svc = nf[nf.length - 1]; }
    }

    if (!ip || !svc) return { output: 'Usage: hydra -l <user> -P <wordlist> [-t <tasks>] [-V] [-f] <IP> <service>', isError: true };

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

    // Resolver lista de usuarios a probar
    let users: string[] = [];
    if (isUserList) {
      const userFileName = userArg.split('/').pop() || userArg;
      const userFile = allMachines.reduce<FileEntry | null>((found, m) => {
        if (found) return found;
        return m.files?.find(f => f.path === userArg || f.path.endsWith('/' + userFileName)) || null;
      }, null);
      if (userFile?.content) {
        users = userFile.content.split('\n').map(s => s.trim()).filter(Boolean);
      } else {
        // Fallback: si no se encuentra el archivo, tratar como lista separada por coma
        users = userArg.split(',').map(s => s.trim()).filter(Boolean);
        if (users.length === 0) users = [userArg];
      }
    } else {
      users = [userArg];
    }

    // Flags de ejecución: -t (tareas paralelas), -V (verbose), -f (salir al primer hallazgo).
    // Se aceptan en cualquier posición; los valores que siguen a flags se excluyen
    // del parseo de IP/servicio por el filtro de no-flags de abajo.
    const tIdx = args.indexOf('-t');
    const tasks = tIdx !== -1 ? parseInt(args[tIdx + 1], 10) || 16 : 16;
    const verbose = args.includes('-V');
    // -f ya es el comportamiento natural (se retorna al primer hallazgo);
    // solo se refleja en el banner.
    const exitFirst = args.includes('-f');

    let output = `Hydra v9.2 starting at ${new Date().toLocaleString()}\n[DATA] target: ${ip}, service: ${svc}, port: ${port.port}\n[ATTACK] users ${users.length} | wordlist "${wl}" | tasks ${tasks}${exitFirst ? ' | salir al primer hallazgo (-f)' : ''}\n`;
    if (verbose) {
      for (const user of users) {
        output += `[VERBOSE] Probando usuario "${user}" contra ${ip}:${port.port}...\n`;
      }
    }

    // Buscar la wordlist en todas las máquinas disponibles
    const wlFilename = wl.split('/').pop() || wl;
    const wordlistFile = isSinglePass ? null : allMachines.reduce<FileEntry | null>((found, m) => {
      if (found) return found;
      return m.files?.find(f => f.path === wl || f.path.endsWith('/' + wlFilename)) || null;
    }, null);

    // Probar cada usuario contra wordlist / pass único
    for (const user of users) {
      const expectedPass = isSinglePass ? wl : undefined;
      const hasCorrectPass = port.credentials
        ? (isSinglePass ? port.credentials.pass === expectedPass : (!wordlistFile || wordlistFile.content.includes(port.credentials.pass)))
        : false;
      const knownPass = getKnownPassword(target, user);
      const hasKnownPass = knownPass !== undefined
        ? (isSinglePass ? knownPass === expectedPass : (!wordlistFile || wordlistFile.content.includes(knownPass)))
        : false;
      const portCredOk = port.credentials?.user === user && hasCorrectPass;

      if (portCredOk || hasKnownPass) {
        const foundPass: string = portCredOk ? port.credentials!.pass : knownPass!;
        output += `\n[${port.port}][${svc}] host: ${ip}   login: ${user}   password: ${foundPass}\n1 of 1 target successfully completed, 1 valid password found`;
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
    }

    const failureOutput = output + `\n[ERROR] No valid password found for ${users.length === 1 ? `user "${users[0]}"` : `${users.length} users`}`;
    return {
      output: failureOutput,
      type: 'creds',
      streamingLineDelays: failureOutput.split('\n').map(() => 80 + Math.random() * 120),
      isError: true,
      failedUser: {
        machineId: target.id,
        user: users[0]
      }
    };
  }
};
