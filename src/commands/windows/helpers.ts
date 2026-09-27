// ── commands/windows/helpers.ts ───────────────────────────────────
// Helpers compartidos de los comandos cmd.exe (PLAN_WINDOWS W1).

import type { CommandContext, FileEntry, User } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { resolveWinPath } from '../../utils/winPath';
import { findFile, findDirEntry, resolveParentDirPath } from '../../utils/fs';

export const WIN_VERSION = 'Microsoft Windows [Version 10.0.17763.1007]';

/** Mensajes de error estilo cmd.exe localizado (español). */
export const WIN_ERR = {
  pathNotFound: 'El sistema no puede encontrar la ruta especificada.',
  fileNotFound: 'El sistema no puede encontrar el archivo especificado.',
  accessDenied: 'Acceso denegado.',
  isDirectory: 'El sistema no puede acceder al archivo porque es un directorio.',
  completed: 'El comando se completó correctamente.',
} as const;

/** Usuario actual de la máquina Windows. */
export function winUser(ctx: CommandContext): User {
  return getCurrentUser(ctx.machine);
}

/** Resuelve un argumento de ruta Windows a la forma canónica del FS (/C:/...). */
export function winResolve(ctx: CommandContext, rawPath: string, user?: User): string {
  const u = user ?? winUser(ctx);
  return resolveWinPath(rawPath, ctx.currentDir || '/', u.home);
}

/** Archivo (o directorio vía entrada .dir) para una ruta Windows, o null. */
export function winEntry(ctx: CommandContext, rawPath: string, user?: User): FileEntry | null {
  return findFile(ctx.machine, winResolve(ctx, rawPath, user));
}

/** Entrada .dir exacta de un directorio Windows, o null. */
export function winDirEntry(ctx: CommandContext, rawPath: string, user?: User): FileEntry | null {
  return findDirEntry(ctx.machine, winResolve(ctx, rawPath, user));
}

export function isDirPath(entry: FileEntry): boolean {
  return entry.path.endsWith('/.dir');
}

/** Ruta canónica de un directorio marcado con .dir (sin el sufijo). */
export function dirCanonical(entry: FileEntry): string {
  return entry.path.slice(0, -'/.dir'.length);
}

/** Parent dir canónico de una ruta (mismo criterio que resolveParentDirPath). */
export function winParent(canonical: string): string {
  return resolveParentDirPath(canonical);
}

/** Fecha determinística para listings estilo dir (dd/mm/yyyy HH:mm). */
export function winDate(path: string): string {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const day = String((h % 27) + 1).padStart(2, '0');
  const mon = String((h % 12) + 1).padStart(2, '0');
  const hh = String((h >> 4) % 24).padStart(2, '0');
  const mm = String((h >> 8) % 60).padStart(2, '0');
  return `${day}/${mon}/2024  ${hh}:${mm}`;
}

/** Gateway por defecto (x.y.z.1) derivado de la IP. */
export function gatewayOf(ip: string): string {
  const parts = (ip || '').split('.');
  if (parts.length !== 4 || parts.some(p => p === '')) return '';
  return `${parts[0]}.${parts[1]}.${parts[2]}.1`;
}

/** Tamaño estable por contenido (bytes simulados). */
export function entrySize(entry: FileEntry): number {
  if (entry.path.endsWith('/.dir')) return 0;
  return (entry.content || '').length;
}
