// ── commands/tools/msfCommands/msfShell.ts ───────────────────────
// Windows CMD shell commands: cls, whoami, hostname, dir, ipconfig, etc.

import type { CommandResponse } from '../../../types';
import type { MsfState } from '../msfTypes';
import { withState } from '../msfHelpers';

/**
 * Handle Windows CMD shell commands (when shellMode=true)
 * Returns null if not in shell mode or command not handled
 */
export const executeShellCommand = (
  cmd: string,
  args: string[],
  state: MsfState
): CommandResponse | null => {
  // Only handle if in shell mode
  if (!state.shellMode) return null;

  if (cmd === 'exit') {
    const newState: MsfState = { ...state, shellMode: false };
    return withState(`\n`, newState);
  }

  if (cmd === 'cls') {
    return { output: 'CLEAR_TERMINAL' };
  }

  if (cmd === 'whoami') {
    return withState(`nt authority\system\n`, state);
  }

  if (cmd === 'hostname') {
    return withState(`WIN7-TARGET\n`, state);
  }

  if (cmd === 'dir') {
    const path = args.join(' ') || 'C:\Windows\system32';
    return withState(` Volume in drive C has no label.
 Volume Serial Number is A8B2-C4D1

 Directory of ${path}

03/14/2017  12:00 AM    <DIR>          .
03/14/2017  12:00 AM    <DIR>          ..
03/14/2017  12:00 AM    <DIR>          config
03/14/2017  12:00 AM    <DIR>          drivers
03/14/2017  12:00 AM    <DIR>          en-US
03/14/2017  12:00 AM         1,093,120 ntoskrnl.exe
03/14/2017  12:00 AM           360,448 cmd.exe
03/14/2017  12:00 AM           247,296 conhost.exe
               3 File(s)      1,700,864 bytes
               3 Dir(s)   8,192,000,000 bytes free
`, state);
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

  if (cmd === 'type') {
    return withState(`Access is denied.\n`, state);
  }

  // Unknown DOS command
  return withState(`'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.\n`, state);
};
