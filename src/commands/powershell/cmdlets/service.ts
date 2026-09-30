// ── commands/powershell/cmdlets/service.ts ────────────────────────
// Cmdlets de servicios PowerShell (PLAN_WINDOWS W2): Get-Service,
// Start-Service, Stop-Service. Reutiliza ProcessManager + gate de admin.

import type { CommandContext, CommandResponse } from '../../../types';
import {
  getAllServices, startService, stopService,
} from '../../../frameworks/process/processManager';
import { isRoot } from '../../../utils/users';
import { winUser } from '../../../utils/winCmd';
import { getParam, pathArg, type PsInvocation } from '../parser';

type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

function findService(ctx: CommandContext, name: string) {
  return getAllServices(ctx.machine).find(s => s.name.toLowerCase() === name.toLowerCase());
}

// ── Get-Service (gsv) ─────────────────────────────────────────────

const getService: PsExec = (inv, ctx) => {
  const services = getAllServices(ctx.machine);
  const nameFilter = getParam<string>(inv, 'Name', 'n') ?? pathArg(inv);

  const filtered = nameFilter
    ? services.filter(s => s.name.toLowerCase().includes(String(nameFilter).toLowerCase()))
    : services;

  if (filtered.length === 0) {
    return { output: 'Get-Service: no se encontraron servicios.', isError: true };
  }

  const lines = ['Status   Name               DisplayName',
                 '------   ----               -----------'];
  for (const s of filtered) {
    lines.push(`${s.running ? 'Running' : 'Stopped'.padEnd(7)}  ${s.name.padEnd(16)}  ${s.description}`);
  }
  return { output: lines.join('\n') };
};

// ── Start-Service ─────────────────────────────────────────────────

const startServiceCmd: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const name = getParam<string>(inv, 'Name', 'n') ?? pathArg(inv);
  if (!name) return usage('Uso: Start-Service -Name <servicio>');

  if (!isRoot(user)) return { output: 'Acceso denegado.', isError: true };
  const svc = findService(ctx, name);
  if (!svc) return { output: `Start-Service: el servicio ${name} no existe.`, isError: true };
  if (svc.running) return { output: '' };
  if (!startService(ctx.machine, svc.name)) {
    return { output: `Start-Service: no se pudo iniciar ${svc.name}.`, isError: true };
  }
  return { output: '' };
};

// ── Stop-Service (spsv) ───────────────────────────────────────────

const stopServiceCmd: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const name = getParam<string>(inv, 'Name', 'n') ?? pathArg(inv);
  if (!name) return usage('Uso: Stop-Service -Name <servicio>');

  if (!isRoot(user)) return { output: 'Acceso denegado.', isError: true };
  const svc = findService(ctx, name);
  if (!svc) return { output: `Stop-Service: el servicio ${name} no existe.`, isError: true };
  if (!svc.running) return { output: '' };
  if (!stopService(ctx.machine, svc.name)) {
    return { output: `Stop-Service: no se pudo detener ${svc.name}.`, isError: true };
  }
  return { output: '' };
};

export const PS_SERVICE_CMDLETS: Record<string, PsExec> = {
  'Get-Service': getService,
  'Start-Service': startServiceCmd,
  'Stop-Service': stopServiceCmd,
};
