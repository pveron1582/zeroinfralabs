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
import { help_xrdp } from './xrdp';
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
import { help_python3 } from './python3';
import { help_uname } from './uname';
import { help_hostname } from './hostname';
import { help_stat } from './stat';
import { help_file } from './file';
import { help_less } from './less';
import { help_man, help_whatis, help_apropos } from './man';
import { help_cut } from './cut';
import { help_fileutil } from './fileutil';
import { help_hashsum, help_base64, help_strings } from './crypto';
import { help_uptime, help_free, help_arch, help_hostnamectl, help_lsb_release, help_w, help_last, help_lscpu } from './sysinfo';
import { help_wget, help_dig, help_nslookup, help_scp, help_whois, help_tcpdump, help_curl } from './nettools';
import { help_vi } from './vi';
import { help_tr } from './tr';
import { help_tac } from './tac';
import { help_nl } from './nl';
import { help_rev } from './rev';
import { help_column } from './column';
import { help_sed } from './sed';
import { help_awk } from './awk';
import { help_diff } from './diff';
import { help_tee } from './tee';
import { help_grep, help_head, help_tail, help_wc, help_sort, help_uniq } from './pipeline';
import { help_pwd, help_find, help_ln, help_mount, help_umount, help_df, help_du } from './files';
import {
  help_whoami, help_history, help_date, help_sleep, help_crontab, help_env,
  help_export, help_unset, help_alias, help_unalias, help_type, help_help,
} from './sysmisc';
import { help_apt, help_dpkg } from './packages';

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
  xrdp: help_xrdp,
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
  python3: help_python3,
  uname: help_uname,
  hostname: help_hostname,
  stat: help_stat,
  file: help_file,
  less: help_less,
  more: help_less,
  man: help_man,
  whatis: help_whatis,
  apropos: help_apropos,
  cut: help_cut,
  tr: help_tr,
  tac: help_tac,
  nl: help_nl,
  rev: help_rev,
  column: help_column,
  sed: help_sed,
  awk: help_awk,
  diff: help_diff,
  tee: help_tee,
  basename: help_fileutil,
  dirname: help_fileutil,
  realpath: help_fileutil,
  md5sum: help_hashsum,
  sha256sum: help_hashsum,
  base64: help_base64,
  strings: help_strings,
  uptime: help_uptime,
  free: help_free,
  arch: help_arch,
  hostnamectl: help_hostnamectl,
  lsb_release: help_lsb_release,
  w: help_w,
  last: help_last,
  wget: help_wget,
  dig: help_dig,
  nslookup: help_nslookup,
  scp: help_scp,
  whois: help_whois,
  tcpdump: help_tcpdump,
  vi: help_vi,
  vim: help_vi,
  help: help_help,
  alias: help_alias,
  unalias: help_unalias,
  type: help_type,
  history: help_history,
  whoami: help_whoami,
  pwd: help_pwd,
  find: help_find,
  ln: help_ln,
  mount: help_mount,
  umount: help_umount,
  df: help_df,
  du: help_du,
  grep: help_grep,
  head: help_head,
  tail: help_tail,
  wc: help_wc,
  sort: help_sort,
  uniq: help_uniq,
  env: help_env,
  export: help_export,
  unset: help_unset,
  date: help_date,
  sleep: help_sleep,
  crontab: help_crontab,
  apt: help_apt,
  dpkg: help_dpkg,
  curl: help_curl,
  lscpu: help_lscpu,
  python: help_python3,
  service: help_systemctl,
};
