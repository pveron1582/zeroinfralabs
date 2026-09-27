// ── commands/powershell/cmdlets/index.ts ──────────────────────────
// Registro único de cmdlets PowerShell MVP (PLAN_WINDOWS W2).
// Agrupa por dominio; session.ts resuelve alias y dispatch.

import type { CommandContext, CommandResponse } from '../../../types';
import type { PsInvocation } from '../parser';
import { PS_FS_CMDLETS } from './fs';
import { PS_PROCESS_CMDLETS } from './process';
import { PS_SERVICE_CMDLETS } from './service';
import { PS_NET_CMDLETS } from './net';
import { PS_SYSTEM_CMDLETS } from './system';

export type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

const ALL: Record<string, PsExec> = {
  ...PS_FS_CMDLETS,
  ...PS_PROCESS_CMDLETS,
  ...PS_SERVICE_CMDLETS,
  ...PS_NET_CMDLETS,
  ...PS_SYSTEM_CMDLETS,
};

/** Mapa canónico de cmdlets (ya resueltos los alias fuera). */
export const PS_CMDLETS: Map<string, PsExec> = new Map(
  Object.entries(ALL).map(([k, v]) => [k.toLowerCase(), v])
);

export function getPsCmdlet(canonicalName: string): PsExec | undefined {
  return PS_CMDLETS.get(canonicalName.toLowerCase());
}

export function listPsCmdletNames(): string[] {
  return [...PS_CMDLETS.keys()].map(k => {
    // Devolver el nombre con mayúsculas original del registro
    const entry = Object.entries(ALL).find(([n]) => n.toLowerCase() === k);
    return entry ? entry[0] : k;
  }).sort();
}
