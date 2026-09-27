// ── commands/powershell/cmdlets/process.ts ────────────────────────
// Cmdlets de procesos PowerShell (PLAN_WINDOWS W2): Get-Process,
// Stop-Process. Reutiliza ProcessManager.

import type { CommandContext, CommandResponse } from '../../../types';
import { list as listProcesses, killPid } from '../../../frameworks/process/processManager';
import { getParam, pathArg, type PsInvocation } from '../parser';

type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

// ── Get-Process (ps / gps) ────────────────────────────────────────

const getProcess: PsExec = (inv, ctx) => {
  const procs = listProcesses(ctx.machine);
  const nameFilter = getParam<string>(inv, 'Name', 'n') ?? pathArg(inv);

  const filtered = nameFilter
    ? procs.filter(p => p.name.toLowerCase().includes(String(nameFilter).toLowerCase()))
    : procs;

  if (filtered.length === 0) {
    return { output: 'Get-Process: no se encontraron procesos con ese nombre.', isError: true };
  }

  const lines = ['Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  ProcessName',
                 '-------  ------    -----      -----     ------     --  -----------'];
  for (const p of filtered) {
    const pm = Math.round((p.mem + 1) * 1024 + p.pid);
    lines.push(
      `${String(80 + p.pid).padStart(7)}  ${String(5 + (p.pid % 10)).padStart(6)}  ` +
      `${String(pm).padStart(8)}  ${String(pm * 2).padStart(9)}  ` +
      `${String(p.cpu).padStart(9)}  ${String(p.pid).padStart(4)}  ${p.name}`
    );
  }
  return { output: lines.join('\n') };
};

// ── Stop-Process (spps / kill) ────────────────────────────────────

const stopProcess: PsExec = (inv, _ctx) => {
  const pidRaw = getParam(inv, 'Id', 'Id') ?? pathArg(inv);
  const pid = typeof pidRaw === 'number' ? pidRaw : parseInt(String(pidRaw), 10);

  if (Number.isNaN(pid)) return usage('Uso: Stop-Process -Id <pid>');

  if (killPid(_ctx.machine, pid)) {
    return { output: '' };
  }
  return {
    output: `Stop-Process: no se pudo detener el proceso con Id ${pid} porque no existe.`,
    isError: true,
  };
};

export const PS_PROCESS_CMDLETS: Record<string, PsExec> = {
  'Get-Process': getProcess,
  'Stop-Process': stopProcess,
};
