// ── commands/tools/index.ts ────────────────────────────────────────
// Exporta todos los comandos de herramientas de pentesting

export { cmd_arpScan } from './arp-scan';
export { cmd_netdiscover } from './netdiscover';
export { cmd_nmap } from './nmap';
export { cmd_gobuster } from './gobuster';
export { cmd_hydra } from './hydra';
export { cmd_curl } from './curl';

// Shell commands now live in frameworks/shells/
export { cmd_ssh, cmd_nc, cmd_ftp, resetFtpSessions } from '../../frameworks/shells';

export { cmd_msfconsole, executeMsfCommand, type MsfState } from './msfconsole';
export { cmd_apt } from './apt';
export { cmd_dpkg } from './dpkg';
