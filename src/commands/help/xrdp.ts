export const help_xrdp = `xrdp - Remote Desktop client (Linux)

Usage:
  xrdp /v:<ip-o-hostname>              # interactive credentials
  xrdp /v:<ip> /u:<user>               # prompt password only
  xrdp /v:<ip> /u:<user> /p:<pass>     # one-shot authentication

Examples:
  xrdp /v:192.168.60.10                # connect (asks user/password)
  xrdp /v:WIN7-LAB /u:Administrator /p:secret

Description:
  Connects to a Windows host over RDP (3389). Requires correct
  credentials (known_passwords or port credentials). On success the
  simulated desktop opens; on failure authentication is denied.

  Equivalente Linux de mstsc, que en este simulador solo existe en
  cmd.exe y PowerShell (en Linux da Command not found).`;
