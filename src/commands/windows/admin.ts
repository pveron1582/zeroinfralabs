// ── commands/windows/admin.ts ─────────────────────────────────────
// Comandos cmd.exe de administración: sc, reg, net, schtasks, shutdown
// (PLAN_WINDOWS W1). Reutiliza ProcessManager y los helpers de permisos.

import type { CommandContext, CommandResponse, Machine } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import {
  getAllServices, startService, stopService,
} from '../../frameworks/process/processManager';
import { WIN_ERR, winUser } from '../../utils/winCmd';
import { findFile } from '../../utils/fs';

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

// ── sc ─────────────────────────────────────────────────────────────

function svcBlock(name: string, running: boolean): string {
  return [
    `SERVICE_NAME: ${name}`,
    ' TYPE               : 10  WIN32_OWN_PROCESS',
    ` STATE              : ${running ? '4  RUNNING' : '1  STOPPED'}`,
    running
      ? '                        (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)'
      : '                        (STOPPABLE, SHUTTABLE, NOT_PAUSABLE)',
    ' WIN32_EXIT_CODE    : 0  (0x0)',
    ' SERVICE_EXIT_CODE  : 0  (0x0)',
    ' CHECKPOINT         : 0x0',
    ' WAIT_HINT          : 0x0',
  ].join('\n');
}

export const cmd_sc = {
  name: 'sc',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    const action = (args[0] || '').toLowerCase();
    const svcName = args[1] || '';
    if (!action) return usage('Uso: sc query|start|stop <servicio>');

    if (action === 'query') {
      const services = getAllServices(ctx.machine);
      if (!svcName) {
        return {
          output: services.map(s => svcBlock(s.name, s.running)).join('\n\n'),
        };
      }
      const svc = services.find(s => s.name.toLowerCase() === svcName.toLowerCase());
      if (!svc) return { output: 'ERROR: El servicio no existe.', isError: true };
      return { output: svcBlock(svc.name, svc.running) };
    }

    if (action === 'start' || action === 'stop') {
      if (!svcName) return usage(`Uso: sc ${action} <servicio>`);
      if (!isRoot(user)) return { output: WIN_ERR.accessDenied, isError: true };
      const services = getAllServices(ctx.machine);
      const svc = services.find(s => s.name.toLowerCase() === svcName.toLowerCase());
      if (!svc) return { output: 'ERROR: El servicio no existe.', isError: true };
      const ok = action === 'start'
        ? startService(ctx.machine, svc.name)
        : stopService(ctx.machine, svc.name);
      if (!ok) {
        return {
          output: `ERROR: no se pudo ${action === 'start' ? 'iniciar' : 'detener'} el servicio ${svc.name}.`,
          isError: true,
        };
      }
      const after = getAllServices(ctx.machine).find(s => s.name === svc.name);
      return { output: svcBlock(svc.name, after?.running ?? false) };
    }

    return usage(`sc: acción no reconocida: ${args[0]}`);
  },
};

// ── reg query ──────────────────────────────────────────────────────

const REG_FILES = [
  '/C:/Windows/System32/config/system',
  '/C:/Windows/System32/config/software',
];

export const cmd_reg = {
  name: 'reg',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    const sub = (args[0] || '').toLowerCase();
    if (sub !== 'query' || !args[1]) {
      return usage('Uso: reg query <clave>');
    }

    const keyRaw = args.slice(1).join(' ');
    const key = keyRaw.replace(/^(HKLM|HKEY_LOCAL_MACHINE|HKCU|HKEY_CURRENT_USER)[\\/]*/i, '');
    const needle = key.toLowerCase();

    const matches: string[] = [];
    let sawFile = false;
    let readableCount = 0;

    for (const p of REG_FILES) {
      const f = findFile(ctx.machine, p);
      if (!f) continue;
      sawFile = true;
      if (!canRead(ctx.machine, f, user)) continue;
      readableCount++;
      for (const line of f.content.split('\n')) {
        if (line.toLowerCase().includes(needle)) matches.push(line);
      }
    }

    if (matches.length > 0) {
      return {
        output: `${keyRaw}\n${matches.map(l => '    ' + l).join('\n')}`,
      };
    }
    if (sawFile && readableCount === 0) {
      return { output: 'ERROR: Acceso denegado.', isError: true };
    }
    return {
      output: 'ERROR: El sistema no puede encontrar la clave de registro especificada.',
      isError: true,
    };
  },
};

// ── net user / localgroup / view ───────────────────────────────────

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

function columnList(names: string[]): string {
  const rows: string[] = [];
  for (let i = 0; i < names.length; i += 3) {
    rows.push(names.slice(i, i + 3).map(n => n.padEnd(41)).join('').trimEnd());
  }
  return rows.join('\n');
}

export const cmd_net = {
  name: 'net',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    const sub = (args[0] || '').toLowerCase();
    const host = ctx.machine.win?.computerName || ctx.machine.machine_info.hostname;
    const names = winAccountNames(ctx.machine);

    if (sub === 'user') {
      const target = args[1];
      if (!target) {
        return {
          output:
            `\\\\${host}\n\n` +
            `Cuentas de usuario para \\\\${host}\n\n` +
            '-------------------------------------------------------------------------------\n' +
            `${columnList(names)}\n\n${WIN_ERR.completed}`,
        };
      }
      if (!names.some(n => n.toLowerCase() === target.toLowerCase())) {
        return { output: 'El nombre de la cuenta no se encuentra.', isError: true };
      }
      const isAdminAccount =
        target.toLowerCase() === 'administrator' || (target === user.username && isRoot(user));
      return {
        output: [
          `Nombre de usuario                     ${target}`,
          `Nombre completo`,
          `Descripción                           ${isAdminAccount ? 'Cuenta de administrador' : 'Cuenta de usuario'}`,
          `Nombre de usuario de inicio de sesión: ${target} (para conectarse)`,
          `Puede cambiar la contraseña           Sí`,
          `Cuenta no expira                      Sí`,
          `Último inicio de sesión               Nunca`,
          `Cuenta activa                         Sí`,
          '',
          `Miembro de                           ${isAdminAccount ? 'Administradores' : 'Usuarios'}`,
          '',
          WIN_ERR.completed,
        ].join('\n'),
      };
    }

    if (sub === 'localgroup') {
      const g = (args[1] || '').toLowerCase();
      if (!g) {
        return {
          output:
            'Enumeración de grupos locales\n\n' +
            '-------------------------------------------------------------------------------\n' +
            'Administradores\nDistributed COM Users\nGuests\nUsuarios\n\n' +
            WIN_ERR.completed,
        };
      }
      if (g === 'administrators' || g === 'administradores') {
        const members: string[] = [];
        if (names.includes('Administrator')) members.push('Administrator');
        if (isRoot(user) && !members.includes(user.username)) members.push(user.username);
        return {
          output:
            `Miembros del grupo local ${args[1]}\n\n` +
            '-------------------------------------------------------------------------------\n' +
            `${columnList(members)}\n\n${WIN_ERR.completed}`,
        };
      }
      if (g === 'usuarios' || g === 'users') {
        return {
          output:
            `Miembros del grupo local ${args[1]}\n\n` +
            '-------------------------------------------------------------------------------\n' +
            `${columnList(names)}\n\n${WIN_ERR.completed}`,
        };
      }
      return { output: 'El grupo no existe.', isError: true };
    }

    if (sub === 'view') {
      const others = (ctx.allMachines || []).filter(
        m => m.id !== ctx.machine.id && !m.id.includes('attacker'),
      );
      if (others.length === 0) {
        return { output: `\\\\${host}\n\n${WIN_ERR.completed}` };
      }
      const rows = others
        .map(m => `\\\\${m.win?.computerName || m.machine_info.hostname}`)
        .map(h => h.padEnd(41).trimEnd())
        .join('\n');
      return {
        output:
          `\\\\${host}\n\n` +
          'Nombre de host\n' +
          '-------------------------------------------------------------------------------\n' +
          `${rows}\n\n${WIN_ERR.completed}`,
      };
    }

    return usage('Uso: net user|localgroup|view');
  },
};

// ── schtasks ───────────────────────────────────────────────────────

export const cmd_schtasks = {
  name: 'schtasks',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const sub = (args[0] || '').toLowerCase();
    if (sub && sub !== '/query' && sub !== '/q') {
      return usage('Uso: schtasks /query');
    }
    const host = ctx.machine.win?.computerName || ctx.machine.machine_info.hostname;
    return {
      output: [
        'Informe de tarea: ',
        '',
        'TareaNombre                              Hora       Estado       Modo usuario',
        '======================================== ========== ============ =========',
        '\\Microsoft\\Windows\\UpdateOrchestrator    00:00:00   Listo        SYSTEM',
        `\\BackupNocturno                          02:00:00   Listo        ${host}\\Administrator`,
        '\\WindowsUpdate                           03:00:00   Listo        SYSTEM',
        '',
        WIN_ERR.completed,
      ].join('\n'),
    };
  },
};

// ── shutdown ───────────────────────────────────────────────────────

export const cmd_shutdown = {
  name: 'shutdown',
  execute: (args: string[]): CommandResponse => {
    const flags = args.map(a => a.toLowerCase());
    if (flags.includes('/a')) {
      return { output: 'Se ha anulado el apagado programado del sistema.' };
    }
    if (flags.includes('/l')) {
      return { output: 'Cerrando sesión...' };
    }
    if (flags.includes('/s')) {
      return { output: 'El sistema se cerrará en menos de un minuto.' };
    }
    if (flags.includes('/r')) {
      return { output: 'El sistema se reiniciará en menos de un minuto.' };
    }
    return usage('Uso: shutdown /r|/s|/l|/a');
  },
};
