// ── commands/help/index.ts ─────────────────────────────────
// Help text for each command — extracted from help.ts

import { help_su } from './su';
import { help_touch } from './touch';
import { help_echo } from './echo';
import { help_rm } from './rm';
import { help_cp } from './cp';
import { help_mv } from './mv';
import { help_nano } from './nano';
import { help_id } from './id';
import { help_groups } from './groups';
import { help_sudo } from './sudo';
import { help_chmod } from './chmod';
import { help_chown } from './chown';
import { help_chgrp } from './chgrp';
import { help_umask } from './umask';
import { help_clear } from './clear';
import { help_ifconfig } from './ifconfig';
import { help_exit } from './exit';
import { help_end } from './end';
import { help_arpscan } from './arp-scan';
import { help_netdiscover } from './netdiscover';
import { help_nc } from './nc';
import { help_nmap } from './nmap';
import { help_gobuster } from './gobuster';
import { help_hydra } from './hydra';
import { help_hashcat } from './hashcat';
import { help_ssh } from './ssh';
import { help_ftp } from './ftp';
import { help_msfconsole } from './msfconsole';
import { help_mkdir } from './mkdir';
import { help_rmdir } from './rmdir';
import { help_ls } from './ls';
import { help_cd } from './cd';
import { help_cat } from './cat';
import { help_ping } from './ping';
import { help_traceroute } from './traceroute';
import { help_ps } from './ps';
import { help_top } from './top';
import { help_htop } from './htop';
import { help_which } from './which';
import { help_kill } from './kill';
import { help_systemctl } from './systemctl';
import { help_journalctl } from './journalctl';
import { help_iptables } from './iptables';
import { help_ufw } from './ufw';
import { help_ip } from './ip';
import { help_ss } from './ss';
import { help_netstat } from './netstat';

export const COMMAND_HELP: Record<string, string> = {
  su: help_su,
  touch: help_touch,
  echo: help_echo,
  rm: help_rm,
  cp: help_cp,
  mv: help_mv,
  nano: help_nano,
  id: help_id,
  groups: help_groups,
  sudo: help_sudo,
  chmod: help_chmod,
  chown: help_chown,
  chgrp: help_chgrp,
  umask: help_umask,
  clear: help_clear,
  ifconfig: help_ifconfig,
  exit: help_exit,
  end: help_end,
  'arp-scan': help_arpscan,
  netdiscover: help_netdiscover,
  nc: help_nc,
  nmap: help_nmap,
  gobuster: help_gobuster,
  hydra: help_hydra,
  hashcat: help_hashcat,
  ssh: help_ssh,
  ftp: help_ftp,
  msfconsole: help_msfconsole,
  mkdir: help_mkdir,
  rmdir: help_rmdir,
  ls: help_ls,
  cd: help_cd,
  cat: help_cat,
  ping: help_ping,
  traceroute: help_traceroute,
  ps: help_ps,
  top: help_top,
  htop: help_htop,
  which: help_which,
  kill: help_kill,
  systemctl: help_systemctl,
  journalctl: help_journalctl,
  iptables: help_iptables,
  ufw: help_ufw,
  ip: help_ip,
  ss: help_ss,
  netstat: help_netstat,
};
