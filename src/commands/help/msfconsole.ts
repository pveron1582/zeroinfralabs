export const help_msfconsole = `msfconsole - Metasploit Framework console

Usage:
  msfconsole

Commands:
  use <module>     Select a module
  show options     Show module parameters
  set <opt> <val>  Set a parameter
  run              Execute the module
  sessions         List active sessions
  sessions -i <n>  Interact with a session
  back             Leave current module
  exit             Quit msfconsole

Examples:
  msfconsole
  use exploit/multi/handler
  set PAYLOAD linux/x64/shell_reverse_tcp

Description:
  Starts the Metasploit Framework console for running exploits and payloads.`;
