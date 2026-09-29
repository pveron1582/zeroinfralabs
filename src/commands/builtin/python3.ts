// ── commands/builtin/python3.ts ─────────────────────────────────────
// python3 / python: corre scripts y one-liners con el mini-intérprete
// de src/frameworks/python. Puentea el simulador: filesystem virtual
// para open()/carga del script, red real (effectivePortState + banners)
// para socket, sys.argv desde los args del comando. Si el script queda
// esperando input(), responde pythonPendingInput y el terminal captura
// la siguiente línea (hooks/usePendingPythonInput).

import type { CommandContext, CommandResponse, Machine, ScanResultsData } from '../../types';
import { runPython } from '../../frameworks/python';
import type { PythonRunResult, PyRunOptions } from '../../frameworks/python';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { findFile, resolveSymlink } from '../../utils/fs';
import { buildFileReadMetadata } from '../../utils/fileRead';
import { effectivePortState } from '../../frameworks/network/networkState';

const PYTHON_VERSION = '3.11.8';
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

export const cmd_python3 = {
  name: 'python3',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    if (args.length === 0) {
      return {
        output: `Python ${PYTHON_VERSION} (simulador) — uso:\n  python3 script.py [args]   ejecuta un archivo .py\n  python3 -c "código"        ejecuta una línea de código`,
      };
    }
    if (args[0] === '--version' || args[0] === '-V') {
      return { output: `Python ${PYTHON_VERSION}` };
    }

    if (args[0] === '-c') {
      const code = args[1];
      if (code === undefined) {
        return { output: 'python3: option -c requires an argument', isError: true };
      }
      return runAndRespond(
        { source: code, sourceName: '<string>', argv: ['-c', ...args.slice(2)] },
        context,
      );
    }

    return runScriptFile(args, context);
  },
};

// Alias `python` → mismo intérprete.
export const cmd_python = { ...cmd_python3, name: 'python' };

function runScriptFile(args: string[], context: CommandContext): CommandResponse {
  const { machine, currentDir } = context;
  const rawPath = args[0];
  const user = getCurrentUser(machine);
  const fullPath = normalizePath(resolvePath(rawPath, currentDir || '/', user.home));
  const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;

  const file = findFile(machine, fullPath);
  if (!file) {
    return {
      output: `python3: can't open file '${rawPath}': [Errno 2] No such file or directory`,
      isError: true,
    };
  }
  const resolved = file.type === 'symlink' ? resolveSymlink(machine, file) : file;
  if (!canRead(machine, resolved, user)) {
    return {
      output: `python3: can't open file '${rawPath}': [Errno 13] Permission denied`,
      isError: true,
    };
  }

  const result = runAndRespond(
    { source: resolved.content, sourceName: cleanPath, argv: [cleanPath, ...args.slice(1)] },
    context,
  );

  // Leer un .py también es leer un archivo: emitimos la metadata estándar
  // para que leer un payload/nota con python valide misiones igual que cat.
  const fileMetadata = buildFileReadMetadata(machine, context.allMachines ?? [machine], resolved);
  return { ...result, fileRead: fileMetadata.fileRead };
}

function runAndRespond(
  spec: { source: string; sourceName: string; argv: string[] },
  context: CommandContext,
): CommandResponse {
  const { machine, allMachines } = context;
  const opts: PyRunOptions = {
    argv: spec.argv,
    inputs: context.pythonInputs ?? [],
    pipedInput: context.pipedInput,
    sourceName: spec.sourceName,
    readFile: makeReadFile(context),
    connect: makeConnect(context),
  };

  // Defensa en depth (P0.2): runPython ya no deja escapar errores de JS,
  // pero si algo fallara (un bridge readFile/connect, o una regresión futura)
  // el comando devuelve un traceback en vez de tumbar la app: sin esto, el
  // error sube hasta el ChunkErrorBoundary y el alumno pierde la sesión
  // completa del lab (la terminal, el escritorio remoto, las misiones).
  let run: PythonRunResult;
  try {
    run = runPython(spec.source, opts);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      output: `Traceback (most recent call last):\n  File "${spec.sourceName}", in <module>\nRuntimeError: ${msg}`,
      isError: true,
    };
  }

  if (run.needsInput) {
    return {
      output: run.output,
      pythonPendingInput: { argv: spec.argv, sourceName: spec.sourceName },
    };
  }

  if (run.error) {
    return { output: run.output ? `${run.output}\n${run.error}` : run.error, isError: true };
  }

  const scanMeta = buildScanMetadata(run.connections, machine, allMachines);
  return {
    output: run.output,
    ...(scanMeta && { type: 'scan' as const, scanResults: scanMeta }),
  };
}

// ── Puentes con el simulador ────────────────────────────────────────

function makeReadFile(context: CommandContext): (path: string) => string | null {
  const { machine, currentDir } = context;
  const user = getCurrentUser(machine);
  return (path: string): string | null => {
    const fullPath = normalizePath(resolvePath(path, currentDir || '/', user.home));
    const file = findFile(machine, fullPath);
    if (!file) return null;
    const resolved = file.type === 'symlink' ? resolveSymlink(machine, file) : file;
    if (!canRead(machine, resolved, user)) return null;
    return resolved.content;
  };
}

function makeConnect(context: CommandContext): (host: string, port: number) => { ok: boolean; errno?: number; banner?: string; service?: string; version?: string } {
  const { machine, allMachines } = context;
  return (host: string, port: number) => {
    const target = resolveMachineByHost(host, machine, allMachines ?? []);
    if (!target) return { ok: false, errno: 113 }; // EHOSTUNREACH
    const portEntry = (target.scan_results?.ports ?? [])
      .find(p => p.port === port && (p.protocol ?? 'tcp').toLowerCase() === 'tcp');
    if (!portEntry) return { ok: false, errno: 111 }; // ECONNREFUSED
    const state = effectivePortState(target, portEntry);
    if (state === 'open') {
      return { ok: true, banner: portEntry.version ?? '', service: portEntry.service, version: portEntry.version };
    }
    return {
      ok: false,
      errno: state === 'filtered' ? 110 : 111, // ETIMEDOUT vs ECONNREFUSED
      service: portEntry.service,
    };
  };
}

export function resolveMachineByHost(
  host: string, current: Machine, allMachines: Machine[],
): Machine | null {
  if (LOCAL_HOSTS.has(host)) return current;
  return allMachines.find(m =>
    m.machine_info.ip === host || m.machine_info.hostname === host) ?? null;
}

function buildScanMetadata(
  connections: Array<{ host: string; port: number; ok: boolean; service?: string; version?: string }>,
  machine: Machine,
  allMachines: Machine[],
): ScanResultsData | null {
  if (connections.length === 0) return null;
  const byHost = connections[0].host;
  const target = resolveMachineByHost(byHost, machine, allMachines ?? []);
  if (!target) return null;
  // Dedup por puerto: con `input()` el script se re-ejecuta y cada corrida
  // agregaba sus sockets.connect otra vez, así que la metadata llegaba con
  // el mismo puerto k veces y el EnumerationPanel pintaba filas repetidas.
  const seen = new Set<number>();
  const ports = connections
    .filter(c => (seen.has(c.port) ? false : (seen.add(c.port), true)))
    .map(c => ({
      port: c.port,
      protocol: 'tcp',
      state: c.ok ? 'open' : 'closed',
      service: c.service ?? 'unknown',
      ...(c.version ? { version: c.version } : {}),
    }));
  return {
    targetId: target.id,
    targetIp: target.machine_info.ip,
    targetHostname: target.machine_info.hostname,
    ports,
  };
}
