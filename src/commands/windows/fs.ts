// ── commands/windows/fs.ts ────────────────────────────────────────
// Comandos cmd.exe de filesystem: dir, cd, type, attrib (PLAN_WINDOWS W1).
// Mismos helpers de permisos que el stack POSIX (canRead/canExecute/...).

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { canExecute, canRead, canEditFile } from '../../utils/permissions';
import { findDirEntry, findFile } from '../../utils/fs';
import { readVirtualFile, buildFileReadMetadata } from '../../utils/fileRead';
import { winDisplay, resolveWinPath } from '../../utils/winPath';
import {
  WIN_ERR, winUser, winResolve, isDirPath, dirCanonical, winDate, entrySize,
} from './helpers';

// ── dir ────────────────────────────────────────────────────────────

function isDirFlag(arg: string): boolean {
  return /^\/[A-Za-z-]+$/.test(arg) && !arg.includes('\\');
}

export const cmd_dir = {
  name: 'dir',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    let targetRaw = '.';
    for (const a of args) {
      if (isDirFlag(a)) continue;
      targetRaw = a;
    }

    const canonical = winResolve(ctx, targetRaw, user);
    const dirEntry = findDirEntry(ctx.machine, canonical);
    if (!dirEntry) return { output: WIN_ERR.pathNotFound, isError: true };
    if (!canExecute(ctx.machine, dirEntry, user)) {
      return { output: WIN_ERR.accessDenied, isError: true };
    }

    const prefix = canonical === '/' ? '/' : canonical + '/';
    const items = new Map<string, { isDir: boolean; entry?: FileEntry }>();

    for (const f of ctx.machine.files || []) {
      if (f.path.endsWith('/.dir')) {
        const dirPath = dirCanonical(f);
        if (dirPath === canonical) continue;
        const parent = dirPath.slice(0, dirPath.lastIndexOf('/')) || '/';
        if (parent === canonical) {
          const name = dirPath.slice(dirPath.lastIndexOf('/') + 1);
          if (name) items.set(name, { isDir: true, entry: f });
        }
        continue;
      }
      if (!f.path.startsWith(prefix)) continue;
      const rel = f.path.slice(prefix.length);
      if (!rel || rel.includes('/')) continue;
      items.set(rel, { isDir: false, entry: f });
    }

    let fileCount = 0;
    let dirCount = 0;
    let totalBytes = 0;
    const lines: string[] = [];

    // . y .. como los muestra cmd
    const parentPath = canonical.slice(0, canonical.lastIndexOf('/')) || canonical;
    lines.push(`${winDate(canonical)}    ${'<DIR>'.padEnd(14)} .`);
    lines.push(`${winDate(parentPath)}    ${'<DIR>'.padEnd(14)} ..`);
    dirCount += 2;

    const sorted = Array.from(items.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (const [name, info] of sorted) {
      if (info.isDir) {
        dirCount++;
        lines.push(`${winDate(info.entry?.path ?? (prefix + name))}    ${'<DIR>'.padEnd(14)} ${name}`);
      } else {
        if (info.entry && !canRead(ctx.machine, info.entry, user)) continue;
        fileCount++;
        const size = info.entry ? entrySize(info.entry) : 0;
        totalBytes += size;
        lines.push(`${winDate(info.entry?.path ?? (prefix + name))}    ${String(size).padStart(14)} ${name}`);
      }
    }

    let out = ` El volumen de la unidad C es OS\n`;
    out += ` El número de serie del volumen es 7A3C-9F21\n\n`;
    out += ` El directorio de ${winDisplay(canonical)}\n\n`;
    out += lines.join('\n') + '\n';
    out += `${String(fileCount).padStart(17)} Archivo(s)${String(totalBytes).padStart(15)} bytes\n`;
    out += `${String(dirCount).padStart(17)} Dir(s)${String(49283072000).padStart(17)} bytes disponibles`;
    return { output: out };
  },
};

// ── cd ─────────────────────────────────────────────────────────────

/**
 * Resuelve un destino de `cd` contra el FS virtual con las reglas de cmd
 * (absoluto con unidad, relativo al cwd, `\` de la unidad, `~`).
 * Compartido por el cmd.exe y la shell Windows de meterpreter, que debe
 * reportar el cwd en su propio estado (MsfState.cwd).
 */
export function resolveCdTarget(
  ctx: CommandContext,
  target: string,
  cwd?: string,
): { ok: true; canonical: string } | { ok: false; message: string } {
  const user = winUser(ctx);
  const canonical = resolveWinPath(target, cwd ?? ctx.currentDir ?? '/', user.home);
  const dirEntry = findDirEntry(ctx.machine, canonical);
  if (!dirEntry) {
    return { ok: false, message: `El sistema no puede encontrar la ruta especificada: ${target}` };
  }
  if (!canExecute(ctx.machine, dirEntry, user)) {
    return { ok: false, message: WIN_ERR.accessDenied };
  }
  return { ok: true, canonical };
}

export const cmd_cd = {
  name: 'cd',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);

    if (args.length === 0) {
      return { output: winDisplay(ctx.currentDir || user.home) };
    }

    const res = resolveCdTarget(ctx, args[0]);
    if (!res.ok) return { output: res.message, isError: true };
    ctx.setCurrentDir?.(res.canonical);
    return { output: '' };
  },
};

// ── type (≈ cat) ──────────────────────────────────────────────────

export const cmd_type = {
  name: 'type',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    if (args.length === 0) {
      return { output: 'Uso: type <archivo>', isError: true };
    }

    const outputs: string[] = [];
    let isError = false;
    let firstMeta: ReturnType<typeof buildFileReadMetadata> | null = null;

    for (const rawPath of args) {
      const result = readVirtualFile(ctx.machine, rawPath, ctx.currentDir, user);
      if (!result.ok) {
        isError = true;
        if (result.error === 'not-found') outputs.push(WIN_ERR.fileNotFound);
        else if (result.error === 'is-directory') outputs.push(WIN_ERR.isDirectory);
        else outputs.push(WIN_ERR.accessDenied);
        continue;
      }
      outputs.push(result.content.replace(/\n$/, ''));
      if (!firstMeta) {
        firstMeta = buildFileReadMetadata(ctx.machine, ctx.allMachines, result.resolved);
      }
    }

    const output = outputs.join('\n');
    if (firstMeta) {
      return {
        output,
        isError: isError ? true : undefined,
        type: 'fileRead',
        fileRead: firstMeta.fileRead,
        ...(firstMeta.possibleUsers && { possibleUsers: firstMeta.possibleUsers }),
      };
    }
    return { output, isError: isError ? true : undefined };
  },
};

// ── attrib ────────────────────────────────────────────────────────

export const cmd_attrib = {
  name: 'attrib',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    const flagRe = /^[+-][A-Za-z]$/;
    const flags = args.filter(a => flagRe.test(a));
    const fileArgs = args.filter(a => !flagRe.test(a));

    if (fileArgs.length === 0) {
      return { output: 'Uso: attrib [+r|-r] <archivo>', isError: true };
    }

    for (const f of flags) {
      const letter = f[1].toLowerCase();
      if (letter !== 'r') {
        return {
          output: `attrib: el atributo '${letter}' no está soportado en la simulación (solo ±r).`,
          isError: true,
        };
      }
    }

    const results: string[] = [];
    let isError = false;
    let newFiles: FileEntry[] | null = null;

    for (const rawPath of fileArgs) {
      const canonical = winResolve(ctx, rawPath, user);
      const entry = findFile(ctx.machine, canonical);
      if (!entry) {
        results.push(WIN_ERR.fileNotFound);
        isError = true;
        continue;
      }

      const display = winDisplay(isDirPath(entry) ? dirCanonical(entry) : entry.path);
      const baseMode = entry.mode ?? (isDirPath(entry) ? 0o755 : 0o644);
      const readOnly = (baseMode & 0o200) === 0;

      if (flags.length === 0) {
        results.push(`${readOnly ? 'R' : 'A'} ${display}`);
        continue;
      }

      if (!canEditFile(ctx.machine, entry, user)) {
        results.push(`${WIN_ERR.accessDenied} ${display}`);
        isError = true;
        continue;
      }

      const add = flags.some(f => f[0] === '+');
      const newMode = add ? (baseMode & ~0o200) : (baseMode | 0o200);
      const files: FileEntry[] = newFiles ?? [...(ctx.machine.files || [])];
      const idx = files.findIndex(f => f.path === entry.path);
      if (idx !== -1) files[idx] = { ...files[idx], mode: newMode };
      newFiles = files;
      results.push(`${newMode & 0o200 ? 'A' : 'R'} ${display}`);
    }

    if (newFiles) {
      ctx.machine.files = newFiles;
      return {
        output: results.join('\n'),
        isError: isError ? true : undefined,
        filesChanged: newFiles,
      };
    }
    return { output: results.join('\n'), isError: isError ? true : undefined };
  },
};
