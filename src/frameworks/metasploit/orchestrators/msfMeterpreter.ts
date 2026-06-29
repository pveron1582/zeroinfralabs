// ── frameworks/metasploit/orchestrators/msfMeterpreter.ts ─────────
// Meterpreter session commands: getuid, sysinfo, shell, hashdump, etc.

import type { CommandResponse, CommandContext } from '../../../types';
import type { MsfState } from '../core/msfTypes';
import { withState } from '../core/msfHelpers';

export const executeMeterpreterCommand = (
  cmd: string,
  args: string[],
  state: MsfState,
  ctx: CommandContext
): CommandResponse | null => {
  if (!state.sessionOpen) return null;

  if (cmd === 'exit' || cmd === 'quit') {
    const newState: MsfState = { ...state, sessionOpen: false };
    return { ...withState(`[*] Shutting down Meterpreter...\n`, newState), newMachineId: 'attacker-01' };
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
    const newState: MsfState = { ...state, uidChecked: true };
    const res = withState(`Server username: NT AUTHORITY\\SYSTEM\n`, newState);
    return {
      ...res,
      uidChecked: true,
      currentUser: 'NT AUTHORITY\\SYSTEM',
      isSystem: true,
    };
  }

  if (cmd === 'sysinfo') {
    return withState(`Computer        : WIN7-TARGET\nOS              : Windows 7 (6.1 Build 7601, Service Pack 1).\nArchitecture    : x64\nSystem Language : en_US\nDomain          : WORKGROUP\nLogged On Users : 1\nMeterpreter     : x64/windows\n`, state);
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
    return { ...withState(`[*] Backgrounding session 1...\n`, newState), newMachineId: 'attacker-01' };
  }

  if (cmd === 'sessions') {
    const victimIp = state.options.RHOSTS || '?';
    return withState(`\nActive sessions\n===============\n\n  Id  Name  Type                     Information                 Connection\n  --  ----  ----                     -----------                 ----------\n  1         meterpreter x64/windows  NT AUTHORITY\\SYSTEM @ WIN7  ${ctx.machine.machine_info.ip}:4444 -> ${victimIp}:49158\n`, state);
  }

  if (cmd === 'clear') {
    return { output: 'CLEAR_TERMINAL' };
  }

  return withState(`[-] Unknown command: ${cmd}\n`, state);
};
