// ── commands/names.ts ─────────────────────────────────────────────
// Lista estática de nombres de comandos para autocompletado. Separada
// del barrel commands/index.ts para que autocomplete.ts (usado en el
// chunk Terminal) no arrastre los ~113 módulos de comando.
//
// Para mantenerla sincronizada, hay un test en commands/__tests__/
// que verifica que esta lista coincida con AVAILABLE_COMMAND_NAMES
// del barrel (que es la fuente de verdad).

export const COMMAND_NAMES: readonly string[] = [
  'alias', 'apropos', 'apt', 'arch', 'arp-scan', 'awk', 'base64',
  'basename', 'cat', 'cd', 'chgrp', 'chmod', 'chown', 'clear',
  'column', 'cp', 'crontab', 'curl', 'cut', 'date', 'df', 'diff',
  'dig', 'dirname', 'dpkg', 'du', 'echo', 'end', 'env', 'exit',
  'export', 'file', 'find', 'free', 'ftp', 'gobuster', 'grep',
  'groups', 'hashcat', 'head', 'help', 'history', 'hostname',
  'hostnamectl', 'htop', 'hydra', 'id', 'ifconfig', 'ip', 'iptables',
  'journalctl', 'kill', 'last', 'less', 'ln', 'ls', 'lsb_release',
  'lscpu',   'man', 'md5sum', 'mkdir', 'more', 'mount', 'msfconsole',
  'mv', 'nano', 'nc', 'netdiscover', 'netstat', 'nl', 'nmap',
  'nslookup', 'ping', 'ps', 'pwd', 'python', 'python3', 'realpath',
  'rev', 'rm', 'rmdir', 'scp', 'sed', 'service', 'sha256sum', 'sleep',
  'sort', 'ss', 'ssh', 'stat', 'strings', 'su', 'sudo', 'systemctl',
  'tac', 'tail', 'tcpdump', 'tee', 'top', 'touch', 'tr', 'traceroute',
  'type', 'ufw', 'umask', 'umount', 'unalias', 'uname', 'uniq',
  'unset', 'uptime', 'vi', 'vim', 'w', 'wc', 'wget', 'whatis', 'which',
  'whoami', 'whois', 'xrdp',
] as const;
