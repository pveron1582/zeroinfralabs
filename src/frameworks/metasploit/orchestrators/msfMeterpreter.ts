// ── frameworks/metasploit/orchestrators/msfMeterpreter.ts ─────────
// Meterpreter session commands: getuid, sysinfo, shell, hashdump, etc.

import type { CommandResponse, CommandContext } from '../../../types';
import type { MsfState } from '../core/msfTypes';
import { withState } from '../core/msfHelpers';
import { cmd_dir, cmd_type, resolveCdTarget } from '../../../commands/windows/fs';
import { winDisplay } from '../../../utils/winPath';

/** Cwd de la sesión: estado MSF si existe, si no el de la terminal. */
function sessionCwd(state: MsfState, ctx: CommandContext): string {
  return state.cwd ?? ctx.currentDir ?? '/';
}

/** Máquina víctima de la sesión, o null si el exploit no la vinculó. */
function sessionMachine(state: MsfState, ctx: CommandContext) {
  if (!state.sessionTargetId) return null;
  return (ctx.allMachines ?? []).find(m => m.id === state.sessionTargetId) ?? null;
}

/** Nombre de equipo de la víctima (fallback: el host por defecto). */
function sessionHost(state: MsfState, ctx: CommandContext): string {
  const m = sessionMachine(state, ctx);
  return m?.win?.computerName || m?.machine_info.hostname || 'WIN7-TARGET';
}

export const executeMeterpreterCommand = (
  cmd: string,
  args: string[],
  state: MsfState,
  ctx: CommandContext
): CommandResponse | null => {
  if (!state.sessionOpen) return null;

  if (cmd === 'exit' || cmd === 'quit') {
    const newState: MsfState = { ...state, sessionOpen: false };
    return { ...withState(`[*] Shutting down Meterpreter...\n`, newState), type: 'meterpreter', newMachineId: 'attacker-01' };
  }

  // ── Stdapi: File system (delega en los comandos de cmd.exe) ─────
  if (cmd === 'cd') {
    const cwd = sessionCwd(state, ctx);
    if (args.length === 0) return withState(`${winDisplay(cwd)}\n`, state);
    const res = resolveCdTarget(ctx, args[0], cwd);
    if (!res.ok) return withState(`[-] cd: ${res.message}\n`, state);
    ctx.setCurrentDir?.(res.canonical);
    return withState('', { ...state, cwd: res.canonical });
  }

  if (cmd === 'pwd' || cmd === 'getwd') {
    return withState(`${winDisplay(sessionCwd(state, ctx))}\n`, state);
  }

  if (cmd === 'ls' || cmd === 'dir') {
    const res = cmd_dir.execute(args, { ...ctx, currentDir: sessionCwd(state, ctx) });
    return { ...withState(`${res.output}\n`, state), isError: res.isError };
  }

  if (cmd === 'cat') {
    const res = cmd_type.execute(args, { ...ctx, currentDir: sessionCwd(state, ctx) });
    return { ...res, msfStateUpdate: state };
  }

  if (cmd === 'help' || cmd === '?') {
    return withState(`
Core Commands

    Command       Description
    -------       -----------
    background    Backgrounds the current session
    exit          Terminate the session
    help          Help menu
    info          Displays information about a Post module
    irb           Open an interactive Ruby shell on the current session
    load          Load one or more meterpreter extensions
    migrate       Migrate the server to another process
    quit          Terminate the session
    run           Executes a meterpreter script or Post module
    sessions      Quickly switch to another session

Stdapi: File system Commands

    Command       Description
    -------       -----------
    cat           Read the contents of a file to the screen
    cd            Change directory
    dir           List files (alias for ls)
    download      Download a file or directory
    getwd         Print working directory on target machine
    ls            List files
    mkdir         Make a directory
    pwd           Print working directory on target machine
    rm            Delete the specified file
    search        Search for files
    upload        Upload a file or directory

Stdapi: Networking Commands

    Command       Description
    -------       -----------
    arp           Display the host ARP cache
    ifconfig      Display interfaces
    ipconfig      Display interfaces
    netstat       Display the network connections
    portfwd       Forward a local port to a remote service

Stdapi: System Commands

    Command       Description
    -------       -----------
    clearev       Clear the event log
    execute       Execute a command
    getenv        Get one or more environment variable values
    getuid        Get the user that the server is running as
    kill          Kill a process
    ps            List running processes
    reboot        Reboots the remote computer
    shell         Drop into a system command shell
    shutdown      Shuts down the remote computer
    sysinfo       Gets information about the remote system, such as OS

Priv: Password database Commands

    Command       Description
    -------       -----------
    hashdump      Dumps the contents of the SAM database

Priv: Elevate Commands

    Command       Description
    -------       -----------
    getsystem     Attempts to elevate your privilege to that of local system.

`, state);
  }

  if (cmd === 'getuid') {
    // La cuenta la fija el exploit que abrió la sesión: los SMB dejan
    // SYSTEM, un RCE web deja la cuenta del servicio (p.ej. SquirrelMail).
    const user = state.sessionUser;
    const isSystem = !user || user.toLowerCase() === 'system';
    const account = isSystem
      ? 'NT AUTHORITY\\SYSTEM'
      : `NT ${sessionHost(state, ctx).toUpperCase()}\\${user.toUpperCase()}`;
    const newState: MsfState = { ...state, uidChecked: true };
    const res = withState(`Server username: ${account}\n`, newState);
    return {
      ...res,
      type: 'meterpreter',
      uidChecked: true,
      currentUser: account,
      isSystem,
    };
  }

  if (cmd === 'sysinfo') {
    const m = sessionMachine(state, ctx);
    const host = sessionHost(state, ctx);
    const os = m?.machine_info.os || 'Windows 7';
    return withState(`Computer        : ${host}\nOS              : ${os}\nArchitecture    : x64\nSystem Language : en_US\nDomain          : WORKGROUP\nLogged On Users : 1\nMeterpreter     : x64/windows\n`, state);
  }

  if (cmd === 'shell') {
    const newState: MsfState = { ...state, shellMode: true };
    return withState(`Process 1234 created.\nChannel 1 created.\nMicrosoft Windows [Version 6.1.7601]\nCopyright (c) 2009 Microsoft Corporation.  All rights reserved.\n`, newState);
  }

  if (cmd === 'hashdump') {
    return withState(`Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::\nGuest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::\nwin7user:1000:aad3b435b51404eeaad3b435b51404ee:2b576acbe6bcfda7294d6bd18041b8fe:::\n`, state);
  }

  if (cmd === 'background' || cmd === 'bg') {
    const newState: MsfState = { ...state, sessionOpen: false };
    return { ...withState(`[*] Backgrounding session 1...\n`, newState), type: 'meterpreter', newMachineId: 'attacker-01' };
  }

  if (cmd === 'sessions') {
    const victimIp = state.options.RHOSTS || '?';
    return withState(`\nActive sessions\n===============\n\n  Id  Name  Type                     Information                 Connection\n  --  ----  ----                     -----------                 ----------\n  1         meterpreter x64/windows  NT AUTHORITY\\SYSTEM @ WIN7  ${ctx.machine.machine_info.ip}:4444 -> ${victimIp}:49158\n`, state);
  }

  if (cmd === 'clear') {
    return { output: '', clearScreen: true };
  }

  return withState(`[-] Unknown command: ${cmd}\n`, state);
};
