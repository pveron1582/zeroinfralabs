// ── commands/rdpClient.ts ─────────────────────────────────────────
// Núcleo compartido del cliente RDP (PLAN_WINDOWS W3 + W5). Lo usan
// dos comandos con el mismo comportamiento y distinto nombre:
//   · `mstsc` → solo cmd.exe / PowerShell (registro WINDOWS_COMMANDS)
//   · `xrdp`  → solo bash Linux (registro COMMANDS)
// Valida host/3389 y arranca la sesión interactiva RdpSession.
// Con /u y /p resueltos en línea autentica one-shot y emite
// desktopAction.connect → processCommandResult abre 'windows-desktop'.
// `cmd` va en todos los mensajes para que cada SO nombre a su cliente.

import type { CommandContext, CommandResponse, Machine } from '../types';
import { startShellSession } from './shellIntegration';
import { getKnownPassword } from '../utils/credentials';

function usage(cmd: string): string {
  return `Uso: ${cmd} /v:<ip-o-hostname> [/u:<usuario> [/p:<password>]]`;
}

function parseTarget(args: string[]): string | null {
  for (const a of args) {
    const m = a.match(/^\/v:(.+)$/i);
    if (m?.[1]) return m[1];
  }
  const bare = args.find(a => !a.startsWith('/'));
  return bare ?? null;
}

function parseFlag(args: string[], flag: 'u' | 'p'): string | undefined {
  for (const a of args) {
    const m = a.match(new RegExp(`^/${flag}:(.+)$`, 'i'));
    if (m?.[1]) return m[1];
  }
  return undefined;
}

function findTarget(target: string, machines: Machine[]): Machine | undefined {
  return machines.find(m =>
    m.machine_info.ip === target ||
    m.machine_info.hostname.toLowerCase() === target.toLowerCase() ||
    (m.win?.computerName || '').toLowerCase() === target.toLowerCase(),
  );
}

function findOpenRdp(machine: Machine) {
  return machine.scan_results.ports.find(p => p.port === 3389 && p.state === 'open');
}

/** Auth one-shot cuando hay /u y /p: valida y emite desktopAction o falla. */
function authenticate(
  cmd: string,
  machine: Machine,
  user: string,
  pass: string,
): CommandResponse {
  const rdp = findOpenRdp(machine);
  if (!rdp) {
    return {
      output: `${cmd}: no se pudo conectar a ${machine.machine_info.ip}:3389 — el puerto RDP no está abierto (o el host no fue escaneado).`,
      isError: true,
    };
  }

  const portOk = rdp.credentials?.user === user && rdp.credentials?.pass === pass;
  const known = getKnownPassword(machine, user);
  const ok = portOk || (known !== undefined && known === pass);

  if (ok) {
    return {
      output: `Conectando a ${machine.machine_info.ip}...\nEstableciendo sesión de Escritorio remoto.`,
      desktopAction: {
        action: 'connect',
        machineId: machine.id,
        ip: machine.machine_info.ip,
      },
      foundCredentials: {
        machineId: machine.id,
        user,
        pass,
        file: 'RDP',
        service: 'rdp',
      },
    };
  }

  return {
    output: `Login incorrect.\n${user}@${machine.machine_info.ip}: Permission denied, please try again.`,
    isError: true,
    failedUser: { machineId: machine.id, user },
  };
}

/** Ejecuta el cliente RDP con el nombre de comando indicado (`cmd`). */
export function runRdpClient(
  cmd: string,
  args: string[],
  ctx: CommandContext,
): CommandResponse {
  const target = parseTarget(args);
  if (!target) return { output: usage(cmd), isError: true };

  const machines = ctx.allMachines ?? [ctx.machine];
  const machine = findTarget(target, machines);
  if (!machine) {
    return { output: `No se puede encontrar el host ${target}.`, isError: true };
  }

  const rdp = findOpenRdp(machine);
  if (!rdp) {
    return {
      output: `${cmd}: no se pudo conectar a ${machine.machine_info.ip}:3389 — el puerto RDP no está abierto (o el host no fue escaneado).`,
      isError: true,
    };
  }

  const user = parseFlag(args, 'u');
  const pass = parseFlag(args, 'p');

  // One-shot: credenciales completas en la línea de comandos.
  if (user && pass !== undefined) {
    return authenticate(cmd, machine, user, pass);
  }

  // Interactivo: arranca RdpSession (pide usuario y/o password).
  const shellArgs = user
    ? [machine.machine_info.ip, user]
    : [machine.machine_info.ip];
  return startShellSession('rdp', shellArgs, ctx, ctx.terminalId || 'default', cmd);
}
