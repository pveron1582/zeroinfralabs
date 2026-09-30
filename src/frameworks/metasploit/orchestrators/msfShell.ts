// ── frameworks/metasploit/orchestrators/msfShell.ts ──────────────
// Windows CMD shell commands: cls, whoami, hostname, dir, ipconfig, etc.
// `cd` usa la MISMA resolución que cmd.exe (`utils/winCmd`, capa baja) y
// `dir`/`type` delegan en los comandos de cmd.exe contra el FS virtual real:
// la shell de meterpreter corre SOBRE la víctima, no en un mock aparte, y
// reutilizar el comando es a propósito (si `dir` cambia de formato, cambia en
// los dos lados). Esa parte queda como deuda consciente: lo que falta es
// bajar el formateo de `dir` a una capa común (ver P1 3.3). El cwd vive
// en MsfState.cwd (aislado por terminal) y se replica en ctx.setCurrentDir
// para que la terminal quede alineada al salir de la sesión.

import type { CommandContext, CommandResponse } from '../../../types';
import type { MsfState } from '../core/msfTypes';
import { withState } from '../core/msfHelpers';
import { cmd_dir, cmd_type } from '../../../commands/windows/fs';
import { resolveWinCdTarget } from '../../../utils/winCmd';
import { winDisplay } from '../../../utils/winPath';

/** Cwd de la sesión: estado MSF si existe, si no el de la terminal. */
function sessionCwd(state: MsfState, ctx: CommandContext): string {
  return state.cwd ?? ctx.currentDir ?? '/';
}

/** Máquina víctima de la sesión (para whoami/hostname), o null. */
function sessionMachine(state: MsfState, ctx: CommandContext) {
  if (!state.sessionTargetId) return null;
  return (ctx.allMachines ?? []).find(m => m.id === state.sessionTargetId) ?? null;
}

/** Nombre de equipo de la víctima. */
function sessionHost(state: MsfState, ctx: CommandContext): string {
  const m = sessionMachine(state, ctx);
  return m?.win?.computerName || m?.machine_info.hostname || 'WIN7-TARGET';
}

/** ctx con currentDir fijado al cwd de la sesión (para delegar en cmd.exe). */
function sessionCtx(ctx: CommandContext, cwd: string): CommandContext {
  return { ...ctx, currentDir: cwd };
}

export const executeShellCommand = (
  cmd: string,
  args: string[],
  state: MsfState,
  ctx: CommandContext
): CommandResponse | null => {
  if (!state.shellMode) return null;

  if (cmd === 'exit') {
    const newState: MsfState = { ...state, shellMode: false };
    return withState(`\n`, newState);
  }

  if (cmd === 'cls') {
    return { output: '', clearScreen: true };
  }

  if (cmd === 'whoami') {
    // La cuenta la fija el exploit: SYSTEM para los SMB, la cuenta del
    // servicio para un RCE web (p.ej. SquirrelMail). Sin dato → SYSTEM.
    const user = state.sessionUser;
    const name = !user || user.toLowerCase() === 'system'
      ? 'nt authority\\system'
      : `nt ${sessionHost(state, ctx).toLowerCase()}\\${user.toLowerCase()}`;
    return withState(`${name}\n`, state);
  }

  if (cmd === 'hostname') {
    return withState(`${sessionHost(state, ctx)}\n`, state);
  }

  // ── cd / chdir ──────────────────────────────────────────────────
  if (cmd === 'cd' || cmd === 'chdir') {
    const cwd = sessionCwd(state, ctx);
    if (args.length === 0) {
      return withState(`${winDisplay(cwd)}\n`, state);
    }
    const res = resolveWinCdTarget(ctx, args[0], cwd);
    if (!res.ok) return withState(`${res.message}\n`, state);
    ctx.setCurrentDir?.(res.canonical);
    return withState('', { ...state, cwd: res.canonical });
  }

  if (cmd === 'pwd') {
    return withState(`${winDisplay(sessionCwd(state, ctx))}\n`, state);
  }

  // ── dir (lista el FS real de la víctima) ────────────────────────
  if (cmd === 'dir') {
    const res = cmd_dir.execute(args, sessionCtx(ctx, sessionCwd(state, ctx)));
    return { ...withState(res.output.endsWith('\n') ? res.output : `${res.output}\n`, state), isError: res.isError };
  }

  // ── type / cat (lee el FS real de la víctima) ───────────────────
  if (cmd === 'type' || cmd === 'cat') {
    const res = cmd_type.execute(args, sessionCtx(ctx, sessionCwd(state, ctx)));
    return { ...res, msfStateUpdate: state };
  }

  if (cmd === 'ipconfig') {
    const victimIp = state.options.RHOSTS || '172.16.0.11';
    return withState(`
Windows IP Configuration

Ethernet adapter Local Area Connection:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : ${victimIp}
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : ${victimIp.split('.').slice(0,3).join('.')}.1
`, state);
  }

  if (cmd === 'net' && args[0] === 'user') {
    return withState(`
User accounts for \\

-------------------------------------------------------------------------------
Administrator            Guest                    win7user
The command completed successfully.
`, state);
  }

  if (cmd === 'systeminfo') {
    return withState(`
Host Name:                 WIN7-TARGET
OS Name:                   Microsoft Windows 7 Professional
OS Version:                6.1.7601 Service Pack 1 Build 7601
OS Manufacturer:           Microsoft Corporation
System Type:               x64-based PC
Total Physical Memory:     2,048 MB
`, state);
  }

  return withState(`'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.\n`, state);
};
