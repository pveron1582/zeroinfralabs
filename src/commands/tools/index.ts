// ── commands/tools/index.ts ────────────────────────────────────────
// Exporta todos los comandos de herramientas de pentesting

export { cmd_arpScan } from './arp-scan';
export { cmd_netdiscover } from './netdiscover';
export { cmd_nmap } from './nmap';
export { cmd_gobuster } from './gobuster';
export { cmd_hydra } from './hydra';
export { cmd_curl } from './curl';
export { cmd_wget } from './wget';
export { cmd_dig, cmd_nslookup } from './dns';
export { cmd_scp } from './scp';
export { cmd_whois } from './whois';
export { cmd_tcpdump } from './tcpdump';
export { cmd_xrdp } from './xrdp';

// Comandos que arrancan sesiones interactivas (viven aquí, no en frameworks/shells,
// para no crear la dependencia circular commands ↔ frameworks/shells)
export { cmd_ssh } from './ssh';
export { cmd_nc } from './nc';
export { cmd_ftp, resetFtpSessions } from './ftp';

export { cmd_msfconsole, executeMsfCommand, type MsfState } from './msfconsole';
export { cmd_apt } from './apt';
export { cmd_dpkg } from './dpkg';
