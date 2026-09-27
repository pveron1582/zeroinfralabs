// ── commands/windows/index.ts ─────────────────────────────────────
// Registro de comandos cmd.exe (PLAN_WINDOWS W1). NO se auto-registra
// en COMMANDS: el executor selecciona este mapa cuando
// machine_info.family === 'windows'. Los nombres no listados caen al
// registro POSIX base.

import type { CommandContext, CommandResponse } from '../../types';
import { cmd_dir, cmd_cd, cmd_type, cmd_attrib } from './fs';
import { cmd_copy, cmd_move, cmd_del, cmd_mkdir, cmd_rmdir } from './fsWrite';
import {
  cmd_echo, cmd_set, cmd_cls, cmd_ver, cmd_cmd, cmd_help,
} from './session';
import { cmd_powershell } from '../powershell';
import {
  cmd_hostname, cmd_whoami, cmd_systeminfo, cmd_ipconfig, cmd_netstat,
  cmd_tasklist, cmd_taskkill, cmd_ping, cmd_tracert,
} from './system';
import { cmd_sc, cmd_reg, cmd_net, cmd_schtasks, cmd_shutdown } from './admin';
import { cmd_winpeas } from './winpeas';
import { cmd_potato } from './potato';
import { cmd_mstsc } from './mstsc';

export interface WinCommand {
  name: string;
  execute: (args: string[], ctx: CommandContext) => CommandResponse;
}

function buildRegistry(): Map<string, WinCommand> {
  const map = new Map<string, WinCommand>();
  const reg = (cmd: WinCommand, ...aliases: string[]) => {
    for (const n of [cmd.name, ...aliases]) map.set(n, cmd);
  };

  // Sistema de archivos
  reg(cmd_dir);
  reg(cmd_cd, 'chdir');
  reg(cmd_type);
  reg(cmd_attrib);
  reg(cmd_copy);
  reg(cmd_move);
  reg(cmd_del, 'erase');
  reg(cmd_mkdir, 'md');
  reg(cmd_rmdir, 'rd');

  // Sesión
  reg(cmd_echo);
  reg(cmd_set);
  reg(cmd_cls);
  reg(cmd_ver);
  reg(cmd_cmd);
  reg(cmd_powershell);
  reg(cmd_help);

  // Sistema
  reg(cmd_hostname);
  reg(cmd_whoami);
  reg(cmd_systeminfo);
  reg(cmd_ipconfig);
  reg(cmd_netstat);
  reg(cmd_tasklist);
  reg(cmd_taskkill);
  reg(cmd_ping);
  reg(cmd_tracert, 'traceroute');

  // Administración
  reg(cmd_sc);
  reg(cmd_reg);
  reg(cmd_net);
  reg(cmd_schtasks);
  reg(cmd_shutdown);

  // Privilegios (W4)
  reg(cmd_winpeas);
  reg(cmd_potato);

  // Escritorio remoto (W5) — solo cmd.exe/PowerShell; en Linux es `xrdp`
  reg(cmd_mstsc);

  return map;
}

/** Mapa de comandos cmd.exe seleccionados por family === 'windows'. */
export const WINDOWS_COMMANDS: Map<string, WinCommand> = buildRegistry();
