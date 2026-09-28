// ── commands/builtin/ls.ts ────────────────────────────────────────
// Comando ls: Lista archivos y directorios en el directorio actual
// Soporta flags -l (formato largo) y -a (archivos ocultos)
// Reconoce directorios marcados con archivos .dir
// Respeta permisos Unix: para listar nombres se necesita `r` en el dir (read);
// para resolver inodes y mostrar metadata se necesita `x` (execute). Sin `x`
// en el directorio listado se devuelve "Permission denied" como hace Unix real.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { ensureTrailingSlash, resolvePath } from '../../utils/path';
import { canExecute, canRead, formatModeFromFile } from '../../utils/permissions';
import { getCurrentUser } from '../../utils/users';
import { findDirEntry, isUnderPath } from '../../utils/fs';
import { formatBytes, formatLsDate } from '../../utils/format';

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

function collectItems(machine: CommandContext['machine'], targetDir: string, showAll: boolean, _user: ReturnType<typeof getCurrentUser>): Map<string, LsItem> {
  const items = new Map<string, LsItem>();
  (machine.files || []).forEach(file => {
    const filePath = file.path;
    if (isUnderPath(filePath, targetDir)) {
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
  return items;
}


// Fecha determinística por path (estable entre corridas): formato `ls -l`
// real — hora para fechas recientes, año para antiguas.
function renderLong(items: Map<string, LsItem>, humanReadable: boolean, baseDir: string): string {
  // total en bloques 1K derivado de los tamaños mostrados (dirs: 4, resto: 1+)
  let total = 0;
  for (const info of items.values()) {
    total += info.isDir ? 4 : Math.max(1, Math.ceil(info.size / 1024));
  }
  let out = `total ${total}\n`;
  Array.from(items.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([name, info]) => {
      const perms = getModeStr(info);
      const owner = getOwner(info);
      const group = getGroup(info);
      const linkCount = info.isDir ? '2' : '1';
      const sizeStr = humanReadable ? formatBytes(info.size) : String(info.size).padStart(5);
      const suffix = info.linkTarget ? ` -> ${info.linkTarget}` : '';
      const date = formatLsDate(info.entry?.path ?? (baseDir + name));
      out += `${perms}  ${linkCount} ${owner.padEnd(8)} ${group.padEnd(8)} ${humanReadable ? sizeStr.padStart(5) : sizeStr} ${date} ${name}${suffix}\n`;
    });
  return out;
}

export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], { machine, currentDir }: CommandContext): CommandResponse => {
    if (!machine.files) machine.files = [];
    const home = getCurrentUser(machine).home ?? '/';

    let showAll = false;
    let showLong = false;
    let showRecursive = false;
    let humanReadable = false;
    let targetDir = ensureTrailingSlash(currentDir || '/');

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) showLong = true;
        if (arg.includes('R')) showRecursive = true;
        if (arg.includes('h')) humanReadable = true;
      } else {
        targetDir = resolvePath(arg, currentDir || '/', home);
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

    // ── Función para generar salida de un directorio ──
    const buildOutput = (dir: string, items: Map<string, LsItem>): string => {
      if (items.size === 0) {
        if (showLong) return 'total 0';
        return '';
      }
      if (showLong) {
        return renderLong(items, humanReadable, dir).trimEnd();
      }
      const names = Array.from(items.entries())
        .filter(([, info]) => {
          if (!info.entry) return true;
          return canRead(machine, info.entry, user);
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name]) => name);
      return names.join('  ');
    };

    const addDotEntries = (dir: string, items: Map<string, LsItem>) => {
      if (showAll && showLong) {
        const parentDir = dir === '/' ? '/' : dir.slice(0, -1).substring(0, dir.slice(0, -1).lastIndexOf('/') + 1) || '/';
        const parentDirEntry = machine.files.find(f => f.path === parentDir + '.dir');
        const currentDirEntry = machine.files.find(f => f.path === dir + '.dir');
        items.set('.', { isDir: true, size: 4096, entry: currentDirEntry || undefined });
        items.set('..', { isDir: true, size: 4096, entry: parentDirEntry || undefined });
      }
    };

    if (!showRecursive) {
      const items = collectItems(machine, targetDir, showAll, user);
      addDotEntries(targetDir, items);
      const out = buildOutput(targetDir, items);
      return { output: out };
    }

    // ── Modo recursivo (-R): listar targetDir y todos los subdirectorios ──
    const allDirs = new Set<string>([targetDir]);
    for (const f of machine.files || []) {
      if (!isUnderPath(f.path, targetDir)) continue;
      const rel = f.path.slice(targetDir.length);
      const parts = rel.split('/').filter(Boolean);
      // Si es .dir, agregar su directorio y parents
      if (f.path.endsWith('/.dir')) {
        const dirPath = f.path.slice(0, -4);
        // asegurar trailing slash para allDirs
        allDirs.add(ensureTrailingSlash(dirPath));
        // agregar parents
        let cur = dirPath;
        while (cur !== targetDir.slice(0, -1) && cur !== '/') {
          cur = cur.slice(0, cur.lastIndexOf('/')) || '/';
          const withSlash = ensureTrailingSlash(cur);
          if (withSlash.startsWith(targetDir)) allDirs.add(withSlash);
          if (cur === '/') break;
        }
      } else if (parts.length > 1) {
        // archivo dentro de subdir: agregar subdir
        const sub = targetDir + parts[0] + '/';
        allDirs.add(sub);
      }
    }

    const sortedDirs = Array.from(allDirs).sort();
    const blocks: string[] = [];
    for (const dir of sortedDirs) {
      // Verificar permiso x antes de listar recursivo
      const dirEntry = findDirEntry(machine, dir.endsWith('/') && dir.length > 1 ? dir.slice(0, -1) : dir);
      if (dirEntry && !canExecute(machine, dirEntry, user)) {
        blocks.push(`${dir}:\nls: cannot open directory '${dir}': Permission denied`);
        continue;
      }
      const items = collectItems(machine, dir, showAll, user);
      addDotEntries(dir, items);
      const out = buildOutput(dir, items);
      blocks.push(`${dir}:\n${out}`);
    }
    return { output: blocks.join('\n\n') };
  }
};
