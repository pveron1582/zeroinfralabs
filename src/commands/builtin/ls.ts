// ── commands/builtin/ls.ts ────────────────────────────────────────
// Comando ls: Lista archivos y directorios en el directorio actual
// Soporta flags -l (formato largo) y -a (archivos ocultos)
// Reconoce directorios marcados con archivos .dir
// Respeta permisos Unix: para listar nombres se necesita `r` en el dir (read);
// para resolver inodes y mostrar metadata se necesita `x` (execute). Sin `x`
// en el directorio listado se devuelve "Permission denied" como hace Unix real.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { ensureTrailingSlash } from '../../utils/path';
import { canExecute, canRead, formatModeFromFile } from '../../utils/permissions';
import { getCurrentUser } from '../../utils/users';
import { findDirEntry } from '../../utils/fs';

// Genera tamaños de archivo determinísticos (no aleatorios)
// Usa un hash simple del path para generar un tamaño consistente
const FILE_SIZE_SEED: Record<string, number> = {};
function stableSize(path: string): number {
  if (!FILE_SIZE_SEED[path]) {
    let h = 0;
    for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
    FILE_SIZE_SEED[path] = Math.abs(h % 900) + 100;
  }
  return FILE_SIZE_SEED[path];
}

function getBaseName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path;
}

interface LsItem {
  isDir: boolean;
  size: number;
  entry?: FileEntry;
  isLink?: boolean;
  linkTarget?: string;
}

function getOwner(info: LsItem): string {
  return info.entry?.owner || 'root';
}

function getGroup(info: LsItem): string {
  return info.entry?.group || 'root';
}

function getModeStr(info: LsItem): string {
  if (info.entry) {
    if (info.isLink) return 'lrwxrwxrwx';
    return formatModeFromFile(info.entry);
  }
  return info.isDir ? 'drwxr-xr-x' : '-rw-r--r--';
}

export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], { machine, currentDir }: CommandContext): CommandResponse => {
    if (!machine.files) machine.files = [];

    let showAll = false;
    let showLong = false;
    let targetDir = ensureTrailingSlash(currentDir || '/');

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) showLong = true;
      } else {
        targetDir = ensureTrailingSlash(arg);
      }
    }

    // Permiso de directorio: listar requiere `x` sobre el directorio target
    // (en Unix `r` lista nombres, `x` resuelve inodes; sin `x` no podés
    // acceder al contenido). Root bypass.
    const targetDirPath = targetDir.endsWith('/') && targetDir.length > 1 ? targetDir.slice(0, -1) : targetDir;
    const targetDirEntry = findDirEntry(machine, targetDirPath);
    const user = getCurrentUser(machine);
    if (targetDirEntry && !canExecute(machine, targetDirEntry, user)) {
      return { output: `ls: cannot open directory '${targetDir}': Permission denied`, isError: true };
    }

    const items = new Map<string, LsItem>();
    
    // First pass: collect actual FileEntry data for .dir markers and regular files
    machine.files.forEach(file => {
      const filePath = file.path;
      
      if (filePath.startsWith(targetDir)) {
        const relativePath = filePath.slice(targetDir.length);
        
        if (relativePath.includes('/')) {
          const dir = relativePath.split('/')[0];
          if (dir && dir !== '.dir') {
            if (!showAll && dir.startsWith('.')) return;
            if (!items.has(dir)) items.set(dir, { isDir: true, size: 4096 });
          }
        } else if (relativePath && relativePath !== '.dir') {
          if (!showAll && relativePath.startsWith('.')) return;
          if (relativePath.endsWith('.dir')) {
            const dirName = relativePath.slice(0, -4);
            if (!showAll && dirName.startsWith('.')) return;
            items.set(dirName, { isDir: true, size: 4096, entry: file });
          } else {
            const isLink = file.type === 'symlink';
            items.set(relativePath, {
              isDir: false,
              size: isLink ? 4096 : stableSize(targetDir + relativePath),
              entry: file,
              isLink,
              linkTarget: isLink ? file.linkTarget : undefined,
            });
          }
        }
      }
      
      // Also catch /.dir markers whose parent is targetDir
      if (filePath.endsWith('/.dir')) {
        const dirPath = filePath.slice(0, -5);
        const dirName = getBaseName(dirPath);
        const parentDir = dirPath.slice(0, dirPath.lastIndexOf('/') + 1);
        if (parentDir === targetDir && dirName) {
          if (!showAll && dirName.startsWith('.')) return;
          if (!items.has(dirName)) items.set(dirName, { isDir: true, size: 4096, entry: file });
        }
      }
    });
    
    // ── Add . and .. entries for -a in long format ────────────────
    if (showAll && showLong) {
      // Find the parent dir entry for ".."
      const parentDir = targetDir === '/' ? '/' : targetDir.slice(0, -1).substring(0, targetDir.slice(0, -1).lastIndexOf('/') + 1) || '/';
      const parentDirEntry = machine.files.find(f => f.path === parentDir + '.dir');
      const currentDirEntry = machine.files.find(f => f.path === targetDir + '.dir');

      // "." — current directory
      const dotEntry: LsItem = {
        isDir: true,
        size: 4096,
        entry: currentDirEntry || undefined,
      };
      items.set('.', dotEntry);

      // ".." — parent directory
      const dotDotEntry: LsItem = {
        isDir: true,
        size: 4096,
        entry: parentDirEntry || undefined,
      };
      items.set('..', dotDotEntry);
    }

    // Si no hay archivos en este directorio, devolver vacío o "total 0" según el modo
    if (items.size === 0) {
      if (showLong) return { output: 'total 0' };
      return { output: '' };
    }
    
    // Construir output según el modo
    if (showLong) {
      let out = `total ${items.size * 4}\n`;
      Array.from(items.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([name, info]) => {
          const perms = getModeStr(info);
          const owner = getOwner(info);
          const group = getGroup(info);
          const linkCount = info.isDir ? '2' : '1';
          const suffix = info.linkTarget ? ` -> ${info.linkTarget}` : '';
          out += `${perms}  ${linkCount} ${owner.padEnd(8)} ${group.padEnd(8)} ${String(info.size).padStart(5)} Jan 01 00:00 ${name}${suffix}\n`;
        });
      return { output: out };
    } else {
      // Formato simple: solo nombres. Filtrar entries sin `r` en el dir target
      // (Unix: sin `r` no podés obtener nombres, solo verificar existencia).
      const names = Array.from(items.entries())
        .filter(([, info]) => {
          if (!info.entry) return true;
          return canRead(machine, info.entry, user);
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name]) => name);
      return { output: names.join('  ') };
    }
  }
};
