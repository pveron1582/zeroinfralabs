// ── shells/nc/ncArgs.ts ────────────────────────────────────────────
// Parseo compartido de args de netcat. Una sola fuente de verdad para
// `tools/nc` (comando) y `NcSession` (shell interactivo): detección de
// modo listener (-l), destino de conexión [host port] y flags con valor
// (-e programa, -p puerto, -w timeout...).

import type { Machine } from '../../../types';
import { effectivePortState } from '../../network/networkState';

export interface NcListenerResult {
  isListener: boolean;
  port?: number;
  error?: string;
}

/** Detecta modo listener: cualquier flag que contenga 'l' (-l, -nlvp, -lvnp). */
export function parseNcListener(args: string[]): NcListenerResult {
  const hasListener = args.some(arg => arg === '-l' || (arg.startsWith('-') && arg.includes('l')));
  if (!hasListener) return { isListener: false };

  let port: string | undefined;

  // Búsqueda 1: después de -p
  const pIdx = args.findIndex(arg => arg === '-p');
  if (pIdx >= 0 && pIdx + 1 < args.length) {
    port = args[pIdx + 1];
  }

  // Búsqueda 2: último argumento numérico
  if (!port) {
    for (let i = args.length - 1; i >= 0; i--) {
      if (!args[i].startsWith('-') && !isNaN(Number(args[i]))) {
        port = args[i];
        break;
      }
    }
  }

  if (!port) {
    return { isListener: true, error: 'nc: missing port specification' };
  }

  if (isNaN(Number(port))) {
    return { isListener: true, error: 'nc: bad port number' };
  }

  const portNum = Number(port);
  if (portNum < 1 || portNum > 65535) {
    return { isListener: true, error: `nc: port ${port} out of range` };
  }

  return { isListener: true, port: portNum };
}

export interface NcConnectTarget {
  host?: string;
  port?: string;
  execProg: string | null;
  udp: boolean;
  verbose: boolean;
}

// Flags que consumen el siguiente arg como valor (-e prog, -p port, ...)
const NC_VALUE_FLAGS = new Set(['-e', '-p', '-w', '-s', '-q', '-W', '-X']);

/** Extrae [host port] salteando flags (con o sin valor) y programa -e. */
export function parseNcConnect(args: string[]): NcConnectTarget {
  let execProg: string | null = null;
  let udp = false;
  let verbose = false;
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('-') || a === '-') {
      positionals.push(a);
      continue;
    }
    if (NC_VALUE_FLAGS.has(a)) {
      const val = args[i + 1];
      if (a === '-e' && val && !val.startsWith('-')) execProg = val;
      i++;
      continue;
    }
    // Valor pegado: -e/bin/bash, -p4444, -w5
    const attached = a.match(/^(-[epwsqWX])(.+)$/);
    if (attached && NC_VALUE_FLAGS.has(attached[1])) {
      if (attached[1] === '-e') execProg = attached[2];
      continue;
    }
    // Flags booleanos (sueltos o combinados): -v, -n, -u, -C, -c, -d, -k, -z...
    if (a.includes('u')) udp = true;
    if (a.includes('v')) verbose = true;
  }

  return { host: positionals[0], port: positionals[1], execProg, udp, verbose };
}

export interface NcConnectOutcome {
  output: string;
  isError: boolean;
}

interface NcCtx {
  machine: Machine;
  allMachines: Machine[];
}

/** Resuelve una conexión contra el estado virtual: el puerto manda.
 *  - Host desconocido o puerto cerrado → Connection refused (como el nc real).
 *  - Puerto filtrado → timeout en progreso.
 *  - Puerto abierto (o UDP a host conocido) → succeeded.
 *  -e se acepta y se anuncia en modo verbose; no altera el resultado. */
export function resolveNcConnect(target: NcConnectTarget, ctx: NcCtx): NcConnectOutcome {
  const { host, port, execProg, udp, verbose } = target;

  if (!host) {
    return { output: 'nc: missing arguments', isError: true };
  }
  if (!port) {
    return { output: 'nc: missing arguments', isError: true };
  }
  if (isNaN(Number(port))) {
    return { output: 'nc: bad port number', isError: true };
  }
  const portNum = Number(port);
  if (portNum < 1 || portNum > 65535) {
    return { output: `nc: port ${port} out of range`, isError: true };
  }

  // -e con programa: el nc real lo ejecuta al conectar; acá se acepta el flag
  const execNote = execProg && verbose ? `\n[VERBOSE] executable bound: ${execProg}` : '';

  const dest = ctx.allMachines.find(m => m.machine_info.ip === host || m.machine_info.hostname === host);
  if (!dest) {
    return { output: `(UNKNOWN) [${host}] ${port} (?) : Connection refused`, isError: true };
  }

  // UDP no tiene handshake: contra host conocido siempre "conecta"
  if (udp) {
    return { output: `Connection to ${host} ${port} port [udp/*] succeeded!${execNote}`, isError: false };
  }

  const entry = dest.scan_results.ports?.find(p => p.port === portNum);
  const state = entry ? effectivePortState(dest, entry) : 'closed';
  if (state === 'open') {
    return { output: `Connection to ${host} ${port} port [tcp/*] succeeded!${execNote}`, isError: false };
  }
  if (state === 'filtered') {
    return { output: `nc: connect to ${host} port ${port} (tcp) timed out: Operation now in progress`, isError: true };
  }
  return { output: `(UNKNOWN) [${host}] ${port} (?) : Connection refused`, isError: true };
}
