// ── commands/powershell/cmdlets/network.ts ────────────────────────
// Cmdlets de red PowerShell (PLAN_WINDOWS W2): Get-NetTCPConnection,
// Get-NetIPConfiguration, Test-NetConnection, Invoke-WebRequest.

import type { CommandContext, CommandResponse, Machine } from '../../../types';
import { getListeningPorts, effectivePortState } from '../../../frameworks/network/networkState';
import { gatewayOf } from '../../../utils/winCmd';
import { getParam, pathArg, type PsInvocation } from '../parser';

type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

function resolveTarget(machines: Machine[], target: string): Machine | undefined {
  return machines.find(m =>
    m.machine_info.ip === target ||
    m.machine_info.hostname.toLowerCase() === target.toLowerCase() ||
    (m.win?.computerName || '').toLowerCase() === target.toLowerCase(),
  );
}

// ── Get-NetTCPConnection ──────────────────────────────────────────

const getNetTcpConnection: PsExec = (_inv, ctx) => {
  const listening = getListeningPorts(ctx.machine);
  const ip = ctx.machine.machine_info.ip || '0.0.0.0';
  const lines = ['LocalAddress                        LocalPort  RemoteAddress  RemotePort State       OwningProcess',
                 '-----------                        ---------  -------------  ---------- -----       -------------'];
  for (const lp of listening) {
    lines.push(
      `${ip.padEnd(35)} ${String(lp.port).padEnd(10)} ${'*'.padEnd(14)} ${'*'.padEnd(11)} ` +
      `${'Listen'.padEnd(11)} ${String(lp.pid ?? 0)}`
    );
  }
  if (listening.length === 0) lines.push('(sin conexiones TCP en escucha)');
  return { output: lines.join('\n') };
};

// ── Get-NetIPConfiguration ────────────────────────────────────────

const getNetIpConfiguration: PsExec = (_inv, ctx) => {
  const m = ctx.machine;
  const ip = m.machine_info.ip || '0.0.0.0';
  const gw = gatewayOf(ip);
  const lines = [
    `InterfaceAlias       : Ethernet0`,
    `InterfaceIndex       : 3`,
    `InterfaceDescription : VirtIO Ethernet Adapter`,
    `IPv4Address          : ${ip}`,
    `IPv4DefaultGateway   : ${gw || '(ninguna)'}`,
    `DNSServer            : 10.10.10.1`,
  ];
  return { output: lines.join('\n') };
};

// ── Test-NetConnection (alias Test-Connection) ────────────────────

const testNetConnection: PsExec = (inv, ctx) => {
  const target = getParam<string>(inv, 'ComputerName', 'TargetName', 'c') ?? pathArg(inv);
  if (!target) return usage('Uso: Test-NetConnection -ComputerName <host|ip> [-Port <n>]');

  const machines = ctx.allMachines || [ctx.machine];
  const dest = resolveTarget(machines, target);
  const ip = dest?.machine_info.ip || (/^\d{1,3}(\.\d{1,3}){3}$/.test(target) ? target : null);
  if (!ip) {
    return { output: `Test-NetConnection: no se pudo resolver ${target}.`, isError: true };
  }

  const portRaw = getParam(inv, 'Port', 'p');
  if (portRaw !== undefined) {
    const port = typeof portRaw === 'number' ? portRaw : parseInt(String(portRaw), 10);
    if (dest) {
      const entry = dest.scan_results?.ports.find(p => p.port === port);
      const state = entry ? effectivePortState(dest, entry) : 'closed';
      const ok = state === 'open';
      return {
        output: [
          `ComputerName     : ${target}`,
          `RemoteAddress    : ${ip}`,
          `RemotePort       : ${port}`,
          `TcpTestSucceeded : ${ok}`,
        ].join('\n'),
        isError: ok ? undefined : true,
      };
    }
    return {
      output: `ComputerName     : ${target}\nRemoteAddress    : ${ip}\nRemotePort       : ${port}\nTcpTestSucceeded : False`,
      isError: true,
    };
  }

  const exists = !!dest;
  return {
    output: [
      `ComputerName     : ${target}`,
      `RemoteAddress    : ${ip}`,
      `PingSucceeded    : ${exists}`,
      `SourceAddress    : ${ctx.machine.machine_info.ip || '0.0.0.0'}`,
    ].join('\n'),
    isError: exists ? undefined : true,
  };
};

// ── Invoke-WebRequest (iwr / curl) ────────────────────────────────
// Salida simple tipo PowerShell: StatusCode + contenido (si es 200).
// No emite httpRequest metadata (eso es Burp/HttpEngine, W0 laboratorio07).

const invokeWebRequest: PsExec = (inv, ctx) => {
  const url = getParam<string>(inv, 'Uri', 'u') ?? pathArg(inv);
  if (!url) return usage('Uso: Invoke-WebRequest -Uri <url>');

  const machines = ctx.allMachines || [ctx.machine];
  let urlObj: URL | null = null;
  try { urlObj = new URL(url); } catch { urlObj = null; }
  if (!urlObj) return { output: `Invoke-WebRequest: URL inválida: ${url}`, isError: true };

  const dest = machines.find(m => m.machine_info.ip === urlObj.hostname)
    ?? machines.find(m => m.machine_info.hostname.toLowerCase() === urlObj.hostname.toLowerCase());

  if (!dest) {
    return {
      output: `Invoke-WebRequest: no se pudo conectar a ${urlObj.hostname} (host no encontrado o fuera de la red).`,
      isError: true,
    };
  }

  const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 80);
  const entry = dest.scan_results?.ports.find(p => p.port === port && p.protocol === 'tcp');
  if (!entry) {
    return {
      output: `Invoke-WebRequest: la conexión con ${urlObj.hostname}:${port} fue rechazada.`,
      isError: true,
    };
  }
  const state = effectivePortState(dest, entry);
  if (state !== 'open') {
    return {
      output: `Invoke-WebRequest: la conexión con ${urlObj.hostname}:${port} fue rechazada.`,
      isError: true,
    };
  }

  // Contenido sintético según servicio (banner real si está modelado)
  const service = entry.service?.toLowerCase() || '';
  let body = '<html><body>OK</body></html>';
  if (service.includes('http') || service === 'www') {
    body = `<!DOCTYPE html>\n<html><head><title>${dest.machine_info.hostname}</title></head>\n<body><h1>Welcome to ${dest.machine_info.hostname}</h1></body></html>`;
  }

  return {
    output: [
      '',
      `StatusCode        : 200`,
      `StatusDescription : OK`,
      `Content           : ${body.slice(0, 120)}${body.length > 120 ? '...' : ''}`,
      `RawContentLength  : ${body.length}`,
      '',
      body,
    ].join('\n'),
  };
};

export const PS_NET_CMDLETS: Record<string, PsExec> = {
  'Get-NetTCPConnection': getNetTcpConnection,
  'Get-NetIPConfiguration': getNetIpConfiguration,
  'Test-NetConnection': testNetConnection,
  'Invoke-WebRequest': invokeWebRequest,
};
