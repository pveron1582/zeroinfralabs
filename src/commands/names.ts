// ── commands/names.ts ─────────────────────────────────────────────
// Lista estática de nombres de comandos para autocompletado. Separada
// del barrel commands/index.ts para que autocomplete.ts (usado en el
// chunk Terminal) no arrastre los 71 módulos de comando (~242KB).
//
// Para mantenerla sincronizada, hay un test en commands/__tests__/
// que verifica que esta lista coincida con AVAILABLE_COMMAND_NAMES
// del barrel (que es la fuente de verdad).

export const COMMAND_NAMES: readonly string[] = [
  'apt', 'arp-scan', 'cat', 'cd', 'chgrp', 'chmod', 'chown', 'clear',
  'cp', 'crontab', 'curl', 'date', 'df', 'dpkg', 'du', 'echo', 'end',
  'env', 'exit', 'export', 'find', 'ftp', 'gobuster', 'grep', 'groups',
  'hashcat', 'head', 'help', 'htop', 'hydra', 'id', 'ifconfig', 'ip',
  'iptables', 'journalctl', 'kill', 'ln', 'ls', 'mkdir', 'mount',
  'msfconsole', 'mv', 'nano', 'nc', 'netdiscover', 'netstat', 'nmap',
  'ping', 'ps', 'rm', 'rmdir', 'service', 'sleep', 'sort', 'ss', 'ssh',
  'su', 'sudo', 'systemctl', 'tail', 'top', 'touch', 'traceroute',
  'ufw', 'umask', 'umount', 'uniq', 'unset', 'wc', 'which', 'whoami',
] as const;