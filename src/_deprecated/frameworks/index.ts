// ── frameworks/index.ts ───────────────────────────────────────────
// Unified exports for all pentesting frameworks

// Metasploit Framework
export * as Metasploit from './metasploit';

// Shell subsystems (FTP, SSH, Netcat)
export {
  // Core
  ShellManager,
  shellManager,
  type ShellSession,
  type ShellContext,
  type ShellResult,
} from './shells';

// Individual shells
export {
  ftpSession,
  sshSession,
  ncSession,
} from './shells';
