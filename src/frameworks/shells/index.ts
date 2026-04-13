// ── shells/index.ts ───────────────────────────────────────────────
// Punto de entrada del sistema de shells modulares

export type { ShellSession, ShellContext, ShellResult } from './ShellSession';
export { ShellManager, shellManager } from './ShellManager';

// ── Imports de shells implementados ───────────────────────────────
import { shellManager } from './ShellManager';
import { ftpSession } from './ftp/FtpSession';
import { sshSession } from './ssh/SshSession';
import { ncSession } from './nc/NcSession';

// ── Registro de todos los shells disponibles ─────────────────────
// Agregar aquí cada nuevo shell implementado
shellManager.register(ftpSession);
shellManager.register(sshSession);
shellManager.register(ncSession);

// Exportar sesiones interactivas
export { ftpSession } from './ftp/FtpSession';
export { sshSession } from './ssh/SshSession';
export { ncSession } from './nc/NcSession';

// Exportar comandos iniciales (arrancan las sesiones)
export { cmd_ftp, resetFtpSessions } from './ftp/ftpCommand';
export { cmd_ssh } from './ssh/sshCommand';
export { cmd_nc } from './nc/ncCommand';
