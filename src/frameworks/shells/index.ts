// ── shells/index.ts ───────────────────────────────────────────────
// Punto de entrada del sistema de shells modulares

export type { ShellSession, ShellContext, ShellResult } from './ShellSession';
export { ShellManager, shellManager } from './ShellManager';

// ── Imports de shells implementados ───────────────────────────────
import { shellManager } from './ShellManager';
import { ftpSession } from './ftp/FtpSession';
import { sshSession } from './ssh/SshSession';
import { ncSession } from './nc/NcSession';
import { rdpSession } from './rdp/RdpSession';

// ── Registro de todos los shells disponibles ─────────────────────
// Agregar aquí cada nuevo shell implementado
shellManager.register(ftpSession);
shellManager.register(sshSession);
shellManager.register(ncSession);
shellManager.register(rdpSession);

// Exportar sesiones interactivas
export { ftpSession } from './ftp/FtpSession';
export { sshSession } from './ssh/SshSession';
export { ncSession } from './nc/NcSession';
export { rdpSession } from './rdp/RdpSession';
export type { RdpState } from './rdp/RdpSession';

// NOTA: los comandos cmd_ssh/cmd_ftp/cmd_nc viven en src/commands/tools/
// y cmd_mstsc en src/commands/windows/ — el framework de shells no
// exporta comandos para evitar la dependencia circular
// commands ↔ frameworks/shells.
