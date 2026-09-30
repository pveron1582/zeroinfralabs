// ── commands/windows/fsWrite.ts ───────────────────────────────────
// Comandos cmd.exe de escritura: copy, move, del, mkdir, rmdir (W1).

import type { CommandContext, CommandResponse } from '../../types';
import {
  canRead, canEditFile, canCreateInDir, canDeleteInDir,
} from '../../utils/permissions';
import { applyUmask } from '../../utils/fs';
import {
  findFile, findDirEntry, findParentDir, defaultOwnership, buildNewFile,
} from '../../utils/fs';
import { winDisplay } from '../../utils/winPath';
import { WIN_ERR, winUser, winResolve, isDirPath, winParent } from '../../utils/winCmd';

type FileKind = 'text' | 'hash' | 'binary';

function coerceKind(t: string): FileKind {
  return t === 'hash' || t === 'binary' ? t : 'text';
}

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

// ── mkdir / md ─────────────────────────────────────────────────────

export const cmd_mkdir = {
  name: 'mkdir',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    if (args.length === 0) return usage('Uso: mkdir <directorio>');

    const errors: string[] = [];
    const files = [...(ctx.machine.files || [])];
    const umask = ctx.umask ?? 0o022;

    for (const rawPath of args) {
      const canonical = winResolve(ctx, rawPath, user);
      if (findDirEntry(ctx.machine, canonical)) {
        errors.push(`El subdirectorio ya existe. (${winDisplay(canonical)})`);
        continue;
      }
      const parent = findParentDir({ files }, canonical);
      if (!parent) {
        errors.push(WIN_ERR.pathNotFound);
        continue;
      }
      if (!canCreateInDir(ctx.machine, parent, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }
      const ownership = defaultOwnership(ctx.machine, user, applyUmask(0o777, umask));
      files.push(buildNewFile(canonical + '/.dir', '', 'text', ownership));
    }

    if (files.length !== (ctx.machine.files || []).length) {
      ctx.machine.files = files;
      return { output: errors.join('\n') || '', isError: errors.length ? true : undefined, filesChanged: files };
    }
    return { output: errors.join('\n') || '', isError: errors.length ? true : undefined };
  },
};

// ── rmdir / rd ─────────────────────────────────────────────────────

export const cmd_rmdir = {
  name: 'rmdir',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    if (args.length === 0) return usage('Uso: rmdir <directorio>');

    const errors: string[] = [];
    let files = [...(ctx.machine.files || [])];
    let removed = false;

    for (const rawPath of args) {
      const canonical = winResolve(ctx, rawPath, user);
      const entry = findDirEntry(ctx.machine, canonical);
      if (!entry) {
        errors.push(WIN_ERR.pathNotFound);
        continue;
      }
      const parentPath = winParent(canonical);
      const parent = findDirEntry(ctx.machine, parentPath);
      if (!parent || !canDeleteInDir(ctx.machine, parent, entry, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }
      const prefix = canonical === '/' ? '/' : canonical + '/';
      const children = files.filter(f => f.path.startsWith(prefix) && f.path !== entry.path);
      if (children.length > 0) {
        errors.push(`El directorio no está vacío. (${winDisplay(canonical)})`);
        continue;
      }
      files = files.filter(f => f.path !== entry.path);
      removed = true;
    }

    if (removed) ctx.machine.files = files;
    return {
      output: errors.join('\n'),
      isError: errors.length ? true : undefined,
      ...(removed ? { filesChanged: files } : {}),
    };
  },
};

// ── del / erase ────────────────────────────────────────────────────

export const cmd_del = {
  name: 'del',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    const targets = args.filter(a => !/^[/-][A-Za-z]+$/.test(a));
    if (targets.length === 0) return usage('Uso: del <archivo>');

    const errors: string[] = [];
    let files = [...(ctx.machine.files || [])];
    let deleted = 0;

    for (const rawPath of targets) {
      const canonical = winResolve(ctx, rawPath, user);
      const entry = findFile(ctx.machine, canonical);
      if (!entry) {
        errors.push(`No se encuentra el archivo ${rawPath}.`);
        continue;
      }
      if (isDirPath(entry)) {
        errors.push(WIN_ERR.isDirectory);
        continue;
      }
      const parent = findDirEntry(ctx.machine, winParent(canonical));
      if (!parent || !canDeleteInDir(ctx.machine, parent, entry, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }
      files = files.filter(f => f.path !== entry.path);
      deleted++;
    }

    if (deleted > 0) ctx.machine.files = files;
    const ok = `${String(deleted).padStart(8)} archivo(s) eliminado(s).`;
    return {
      output: errors.length ? errors.join('\n') : ok,
      isError: errors.length ? true : undefined,
      ...(deleted > 0 ? { filesChanged: files } : {}),
    };
  },
};

// ── copy ───────────────────────────────────────────────────────────

export const cmd_copy = {
  name: 'copy',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    if (args.length < 2) return usage('Uso: copy <origen> <destino>');

    const destRaw = args[args.length - 1];
    const sources = args.slice(0, -1);
    const destCanonical = winResolve(ctx, destRaw, user);
    const destEntry = findFile(ctx.machine, destCanonical);
    const destIsDir = destEntry !== null && isDirPath(destEntry);

    const errors: string[] = [];
    const files = [...(ctx.machine.files || [])];
    let copied = 0;
    const umask = ctx.umask ?? 0o022;

    for (const srcRaw of sources) {
      const srcCanonical = winResolve(ctx, srcRaw, user);
      const src = findFile(ctx.machine, srcCanonical);
      if (!src) {
        errors.push(WIN_ERR.fileNotFound);
        continue;
      }
      if (isDirPath(src)) {
        errors.push(`No se pueden copiar directorios. (${winDisplay(srcCanonical)})`);
        continue;
      }
      if (!canRead(ctx.machine, src, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }

      const base = srcCanonical.slice(srcCanonical.lastIndexOf('/') + 1);
      const target = destIsDir ? destCanonical.replace(/\/$/, '') + '/' + base : destCanonical;
      const parent = findParentDir({ files }, target);
      if (!parent) {
        errors.push(WIN_ERR.pathNotFound);
        continue;
      }
      if (!canCreateInDir(ctx.machine, parent, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }

      const existing = findFile(ctx.machine, target);
      if (existing) {
        if (!canEditFile(ctx.machine, existing, user) || !canDeleteInDir(ctx.machine, parent, existing, user)) {
          errors.push(WIN_ERR.accessDenied);
          continue;
        }
        const idx = files.findIndex(f => f.path === existing.path);
        if (idx !== -1) files.splice(idx, 1);
      }

      const ownership = defaultOwnership(
        ctx.machine,
        user,
        applyUmask(existing?.mode ?? 0o644, umask),
      );
      files.push(buildNewFile(target, src.content, coerceKind(src.type), ownership));
      copied++;
    }

    if (copied > 0) ctx.machine.files = files;
    const ok = `${String(copied).padStart(8)} archivo(s) copiado(s).`;
    return {
      output: errors.length ? errors.join('\n') : ok,
      isError: errors.length ? true : undefined,
      ...(copied > 0 ? { filesChanged: files } : {}),
    };
  },
};

// ── move ───────────────────────────────────────────────────────────

export const cmd_move = {
  name: 'move',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = winUser(ctx);
    if (args.length < 2) return usage('Uso: move <origen> <destino>');

    const destRaw = args[args.length - 1];
    const sources = args.slice(0, -1);
    const destCanonical = winResolve(ctx, destRaw, user);
    const destEntry = findFile(ctx.machine, destCanonical);
    const destIsDir = destEntry !== null && isDirPath(destEntry);

    const errors: string[] = [];
    const files = [...(ctx.machine.files || [])];
    let moved = 0;

    for (const srcRaw of sources) {
      const srcCanonical = winResolve(ctx, srcRaw, user);
      const src = findFile(ctx.machine, srcCanonical);
      if (!src) {
        errors.push(WIN_ERR.fileNotFound);
        continue;
      }
      if (isDirPath(src)) {
        errors.push(`No se pueden mover directorios. (${winDisplay(srcCanonical)})`);
        continue;
      }

      const base = srcCanonical.slice(srcCanonical.lastIndexOf('/') + 1);
      const target = destIsDir ? destCanonical.replace(/\/$/, '') + '/' + base : destCanonical;
      if (target === srcCanonical) continue;

      const parent = findParentDir({ files }, target);
      if (!parent) {
        errors.push(WIN_ERR.pathNotFound);
        continue;
      }
      if (!canCreateInDir(ctx.machine, parent, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }

      const srcParent = findDirEntry(ctx.machine, winParent(srcCanonical));
      if (!srcParent || !canDeleteInDir(ctx.machine, srcParent, src, user)) {
        errors.push(WIN_ERR.accessDenied);
        continue;
      }

      const existing = findFile(ctx.machine, target);
      if (existing) {
        if (!canEditFile(ctx.machine, existing, user) || !canDeleteInDir(ctx.machine, parent, existing, user)) {
          errors.push(WIN_ERR.accessDenied);
          continue;
        }
        const idx = files.findIndex(f => f.path === existing.path);
        if (idx !== -1) files.splice(idx, 1);
      }

      const idxSrc = files.findIndex(f => f.path === src.path);
      if (idxSrc !== -1) {
        files[idxSrc] = { ...files[idxSrc], path: target };
        moved++;
      }
    }

    if (moved > 0) ctx.machine.files = files;
    const ok = `${String(moved).padStart(8)} archivo(s) movido(s).`;
    return {
      output: errors.length ? errors.join('\n') : ok,
      isError: errors.length ? true : undefined,
      ...(moved > 0 ? { filesChanged: files } : {}),
    };
  },
};
