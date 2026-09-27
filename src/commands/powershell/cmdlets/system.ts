// ── commands/powershell/cmdlets/system.ts ─────────────────────────
// Cmdlets de sistema PowerShell (PLAN_WINDOWS W2): Get-LocalUser,
// Get-LocalGroupMember, Get-Help, Clear-Host, Stop-Computer.

import type { CommandContext, CommandResponse, Machine } from '../../../types';
import { getCurrentUser, isRoot } from '../../../utils/users';
import { winUser } from '../../windows/helpers';
import { cmd_mstsc } from '../../windows/mstsc';
import { getParam, pathArg, type PsInvocation } from '../parser';
import { PS_ALIASES } from '../aliases';

type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

/** Nombres de cuenta desde SAM + usuario actual (paridad con net user). */
function winAccountNames(machine: Machine): string[] {
  const names = new Set<string>();
  const sam = machine.files.find(f => f.path === '/C:/Windows/System32/config/SAM');
  if (sam) {
    for (const line of sam.content.split('\n')) {
      const m = line.match(/Users\\Names\\(.+)$/);
      if (m) names.add(m[1].trim());
    }
  }
  const cur = getCurrentUser(machine).username;
  if (cur) names.add(cur);
  return [...names].sort((a, b) => a.localeCompare(b));
}

// ── Get-LocalUser ─────────────────────────────────────────────────

const getLocalUser: PsExec = (_inv, ctx) => {
  const names = winAccountNames(ctx.machine);
  const current = getCurrentUser(ctx.machine).username;
  const lines = ['Name               Enabled  LastLogon',
                 '----               -------  --------'];
  for (const n of names) {
    const enabled = n.toLowerCase() !== 'guest' ? 'True' : 'False';
    lines.push(`${n.padEnd(18)} ${enabled.padEnd(8)} ${n === current ? '2024-06-01' : ''}`);
  }
  return { output: lines.join('\n') };
};

// ── Get-LocalGroupMember ─────────────────────────────────────────

const getLocalGroupMember: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const group = getParam<string>(inv, 'Group', 'Group') ?? pathArg(inv) ?? 'Administrators';
  const g = group.toLowerCase();
  const names = winAccountNames(ctx.machine);

  if (g === 'administrators' || g === 'administradores') {
    const members: string[] = [];
    if (names.includes('Administrator')) members.push('Administrator');
    if (isRoot(user) && !members.includes(user.username)) members.push(user.username);
    if (members.length === 0) return { output: 'Get-LocalGroupMember: el grupo está vacío.' };
    const lines = ['ObjectClass  Name               PrincipalSource',
                   '-----------  ----               ---------------'];
    for (const m of members) lines.push(`User         ${m.padEnd(18)} Local`);
    return { output: lines.join('\n') };
  }

  if (g === 'usuarios' || g === 'users') {
    const lines = ['ObjectClass  Name               PrincipalSource',
                   '-----------  ----               ---------------'];
    for (const n of names) {
      if (n.toLowerCase() === 'administrator') continue;
      lines.push(`User         ${n.padEnd(18)} Local`);
    }
    return { output: lines.join('\n') };
  }

  return { output: `Get-LocalGroupMember: grupo no encontrado: ${group}`, isError: true };
};

// ── Get-Help ──────────────────────────────────────────────────────

const HELP_SYNOPSIS: Record<string, string> = {
  'Get-ChildItem': 'Obtiene los elementos de uno o más directorios.',
  'Get-Content': 'Obtiene el contenido de un archivo.',
  'Set-Content': 'Escribe contenido en un archivo.',
  'Remove-Item': 'Elimina archivos o directorios.',
  'Copy-Item': 'Copia elementos de un origen a un destino.',
  'New-Item': 'Crea un archivo o directorio nuevo.',
  'Resolve-Path': 'Resuelve una ruta a una ruta canónica.',
  'Set-Location': 'Cambia el directorio actual.',
  'Get-Location': 'Muestra el directorio actual.',
  'Get-Process': 'Obtiene los procesos en ejecución.',
  'Stop-Process': 'Detiene un proceso por Id.',
  'Get-Service': 'Obtiene los servicios del sistema.',
  'Start-Service': 'Inicia un servicio.',
  'Stop-Service': 'Detiene un servicio.',
  'Get-NetTCPConnection': 'Obtiene conexiones TCP en escucha.',
  'Get-NetIPConfiguration': 'Obtiene la configuración IP.',
  'Test-NetConnection': 'Prueba conectividad (ping/puerto).',
  'Invoke-WebRequest': 'Envía una petición HTTP.',
  'Get-LocalUser': 'Lista cuentas de usuario locales.',
  'Get-LocalGroupMember': 'Lista miembros de un grupo local.',
  'Get-Help': 'Muestra ayuda de un cmdlet.',
  'Clear-Host': 'Limpia la pantalla.',
  'Stop-Computer': 'Apaga el equipo.',
  mstsc: 'Cliente de Escritorio remoto (RDP).',
};

const getHelp: PsExec = (inv, _ctx) => {
  const target = pathArg(inv) ?? inv.positionals[0];
  void _ctx;

  if (!target) {
    const names = Object.keys(HELP_SYNOPSIS).sort();
    return {
      output: [
        'TOPIC',
        '     about_Cmdlets (PowerShell MVP — PLAN_WINDOWS W2)',
        '',
        'SHORT DESCRIPTION',
        '     Cmdlets disponibles en esta simulación (Verb-Noun).',
        '',
        'LONG DESCRIPTION',
        ...names.map(n => `     ${n.padEnd(28)} ${HELP_SYNOPSIS[n]}`),
        '',
        'ALIASES',
        ...Object.entries(PS_ALIASES).map(([a, c]) => `     ${a.padEnd(12)} → ${c}`),
        '',
        'Usa Get-Help <Cmdlet> para el resumen de un cmdlet.',
      ].join('\n'),
    };
  }

  const key = Object.keys(HELP_SYNOPSIS).find(k => k.toLowerCase() === target.toLowerCase());
  if (!key) {
    return { output: `Get-Help: no se encontró el tema ${target}.`, isError: true };
  }
  return {
    output: [
      `NAME`,
      `     ${key}`,
      '',
      `SYNOPSIS`,
      `     ${HELP_SYNOPSIS[key]}`,
      '',
      `SYNTAX`,
      `     ${key} [-Param <String>] [<CommonParameters>]`,
      '',
     `DESCRIPTION`,
      `     Cmdlet del paquete PowerShell MVP. Los parámetros usan la forma`,
      `     -Nombre valor. Los pipes (|) pasan la salida como texto al siguiente cmdlet.`,
    ].join('\n'),
  };
};

// ── Clear-Host (cls / clear) ──────────────────────────────────────

const clearHost: PsExec = () => ({ output: 'CLEAR_TERMINAL' });

// ── Stop-Computer ─────────────────────────────────────────────────

const stopComputer: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  if (!isRoot(user)) return { output: 'Acceso denegado.', isError: true };

  const restart = getParam(inv, 'Restart', 'r') === true;
  void inv;
  return {
    output: restart
      ? 'Se está reiniciando el equipo...'
      : 'Se está apagando el equipo...',
  };
};

// ── mstsc (cliente RDP) ───────────────────────────────────────────
// Atajo de cmd.exe disponible dentro de PowerShell: reutiliza el mismo
// código que el `mstsc` del Símbolo del sistema.

const mstscExec: PsExec = (inv, ctx) => cmd_mstsc.execute(inv.positionals, ctx);

export const PS_SYSTEM_CMDLETS: Record<string, PsExec> = {
  'Get-LocalUser': getLocalUser,
  'Get-LocalGroupMember': getLocalGroupMember,
  'Get-Help': getHelp,
  'Clear-Host': clearHost,
  'Stop-Computer': stopComputer,
  mstsc: mstscExec,
};
