// ── commands/powershell/cmdlets/fs.ts ─────────────────────────────
// Cmdlets de filesystem PowerShell (PLAN_WINDOWS W2): Get-ChildItem,
// Get-Content, Set-Content, Remove-Item, Copy-Item, New-Item, Resolve-Path.
// Mismos helpers de permisos que cmd.exe (canRead/canCreateInDir/...).

import type { CommandContext, CommandResponse, FileEntry } from '../../../types';
import {
  canRead, canEditFile, canCreateInDir, canDeleteInDir,
} from '../../../utils/permissions';
import { applyUmask } from '../../../utils/fs';
import {
  findFile, findDirEntry, findParentDir, defaultOwnership, buildNewFile, isUnderPath,
} from '../../../utils/fs';
import { readVirtualFile, buildFileReadMetadata } from '../../../utils/fileRead';
import { winDisplay } from '../../../utils/winPath';
import {
  WIN_ERR, winUser, winResolve, isDirPath, dirCanonical, winDate, entrySize,
} from '../../../utils/winCmd';
import { resolveCdTarget } from '../../windows/fs';
import { getParam, pathArg, type PsInvocation } from '../parser';

type PsExec = (inv: PsInvocation, ctx: CommandContext) => CommandResponse;

function usage(msg: string): CommandResponse {
  return { output: msg, isError: true };
}

// ── Get-ChildItem (gci / ls) ──────────────────────────────────────

const getChildItem: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv) ?? '.';
  const canonical = winResolve(ctx, raw, user);
  const dirEntry = findDirEntry(ctx.machine, canonical);
  if (!dirEntry) return { output: WIN_ERR.pathNotFound, isError: true };

  const prefix = canonical === '/' ? '/' : canonical + '/';
  const rows: string[] = [];

  for (const f of ctx.machine.files || []) {
    if (f.path.endsWith('/.dir')) {
      const dirPath = dirCanonical(f);
      if (dirPath === canonical) continue;
      const parent = dirPath.slice(0, dirPath.lastIndexOf('/')) || '/';
      if (parent === canonical) {
        const name = dirPath.slice(dirPath.lastIndexOf('/') + 1);
        if (name) rows.push(`d----  ${winDate(f.path)}  ${name}`);
      }
      continue;
    }
    if (!isUnderPath(f.path, canonical)) continue;
    const rel = f.path.slice(prefix.length);
    if (!rel || rel.includes('/')) continue;
    if (!canRead(ctx.machine, f, user)) continue;
    rows.push(`-a---  ${winDate(f.path)}  ${String(entrySize(f)).padStart(10)}  ${rel}`);
  }

  if (rows.length === 0) {
    return { output: '' };
  }
  return { output: rows.join('\n') };
};

// ── Get-Content (cat / gc / type) ─────────────────────────────────

const getContent: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv);
  if (!raw) return usage('Uso: Get-Content -Path <archivo>');

  const result = readVirtualFile(ctx.machine, raw, ctx.currentDir, user);
  if (!result.ok) {
    if (result.error === 'not-found') return { output: WIN_ERR.fileNotFound, isError: true };
    if (result.error === 'is-directory') return { output: WIN_ERR.isDirectory, isError: true };
    return { output: WIN_ERR.accessDenied, isError: true };
  }

  const meta = buildFileReadMetadata(ctx.machine, ctx.allMachines, result.resolved);
  const content = result.content.replace(/\n$/, '');
  return {
    output: content,
    type: 'fileRead' as const,
    fileRead: meta.fileRead,
    ...(meta.possibleUsers && { possibleUsers: meta.possibleUsers }),
  };
};

// ── Set-Content (sc) ──────────────────────────────────────────────

const setContent: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv);
  if (!raw) return usage('Uso: Set-Content -Path <archivo> -Value <texto>');

  const value = getParam<string>(inv, 'Value', 'v');
  const text = typeof value === 'string' ? value : inv.positionals.slice(1).join(' ');

  const canonical = winResolve(ctx, raw, user);
  const existing = findFile(ctx.machine, canonical);
  const files = [...(ctx.machine.files || [])];
  const umask = ctx.umask ?? 0o022;

  if (existing && !isDirPath(existing)) {
    if (!canEditFile(ctx.machine, existing, user)) {
      return { output: WIN_ERR.accessDenied, isError: true };
    }
    const idx = files.findIndex(f => f.path === existing.path);
    files[idx] = { ...existing, content: text };
    ctx.machine.files = files;
    return { output: '', filesChanged: files };
  }

  const parent = findParentDir({ files }, canonical);
  if (!parent) return { output: WIN_ERR.pathNotFound, isError: true };
  if (!canCreateInDir(ctx.machine, parent, user)) {
    return { output: WIN_ERR.accessDenied, isError: true };
  }
  const ownership = defaultOwnership(ctx.machine, user, applyUmask(0o644, umask));
  files.push(buildNewFile(canonical, text, 'text', ownership));
  ctx.machine.files = files;
  return { output: '', filesChanged: files };
};

// ── Remove-Item (rm / del / ri) ───────────────────────────────────

const removeItem: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv);
  if (!raw) return usage('Uso: Remove-Item -Path <archivo|directorio>');

  const canonical = winResolve(ctx, raw, user);
  const entry = findFile(ctx.machine, canonical);
  if (!entry) return { output: WIN_ERR.fileNotFound, isError: true };

  const parentPath = canonical.slice(0, canonical.lastIndexOf('/')) || '/';
  const parent = findDirEntry(ctx.machine, parentPath);
  if (!parent || !canDeleteInDir(ctx.machine, parent, entry, user)) {
    return { output: WIN_ERR.accessDenied, isError: true };
  }

  if (isDirPath(entry)) {
    const prefix = canonical + '/';
    const children = (ctx.machine.files || []).filter(f => f.path.startsWith(prefix));
    const recurse = getParam(inv, 'Recurse', 'r') === true;
    if (children.length > 0 && !recurse) {
      return { output: `El directorio no está vacío. (${winDisplay(canonical)})`, isError: true };
    }
  }

  const files = (ctx.machine.files || []).filter(f =>
    f.path !== entry.path && !(isDirPath(entry) && f.path.startsWith(canonical + '/'))
  );
  ctx.machine.files = files;
  return { output: '', filesChanged: files };
};

// ── Copy-Item (cp / copy / cpi) ───────────────────────────────────

const copyItem: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const srcRaw = inv.positionals[0] ?? pathArg(inv);
  const dstRaw = inv.positionals[1] ?? (typeof getParam(inv, 'Destination') === 'string'
    ? getParam<string>(inv, 'Destination') : undefined);
  if (!srcRaw || !dstRaw) return usage('Uso: Copy-Item -Path <origen> -Destination <destino>');

  const srcCanonical = winResolve(ctx, srcRaw, user);
  const src = findFile(ctx.machine, srcCanonical);
  if (!src || isDirPath(src)) return { output: WIN_ERR.fileNotFound, isError: true };
  if (!canRead(ctx.machine, src, user)) return { output: WIN_ERR.accessDenied, isError: true };

  const dstCanonical = winResolve(ctx, dstRaw, user);
  const dstEntry = findFile(ctx.machine, dstCanonical);
  const files = [...(ctx.machine.files || [])];
  const umask = ctx.umask ?? 0o022;

  if (dstEntry && !isDirPath(dstEntry)) {
    if (!canEditFile(ctx.machine, dstEntry, user)) return { output: WIN_ERR.accessDenied, isError: true };
    const idx = files.findIndex(f => f.path === dstEntry.path);
    files[idx] = { ...dstEntry, content: src.content };
    ctx.machine.files = files;
    return { output: '', filesChanged: files };
  }

  // Destino es directorio existente o inexistente → archivo nuevo en parent
  const targetPath = dstEntry && isDirPath(dstEntry)
    ? dstCanonical + '/' + src.path.slice(src.path.lastIndexOf('/') + 1)
    : dstCanonical;
  const parent = findParentDir({ files }, targetPath);
  if (!parent) return { output: WIN_ERR.pathNotFound, isError: true };
  if (!canCreateInDir(ctx.machine, parent, user)) return { output: WIN_ERR.accessDenied, isError: true };

  const ownership = defaultOwnership(ctx.machine, user, applyUmask(src.mode ?? 0o644, umask));
  const newType: 'text' | 'hash' | 'binary' | 'symlink' =
    src.type === 'symlink' || src.type === 'hash' || src.type === 'binary' ? src.type : 'text';
  files.push({ ...buildNewFile(targetPath, src.content, newType, ownership) });
  ctx.machine.files = files;
  return { output: '', filesChanged: files };
};

// ── New-Item (ni / mkdir) ─────────────────────────────────────────

const newItem: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv);
  if (!raw) return usage('Uso: New-Item -Path <directorio> [-ItemType Directory]');

  const itemType = getParam<string>(inv, 'ItemType', 'Type');
  const wantDir = itemType === 'Directory' || itemType === 'directory' || inv.positionals.length > 0
    ? true : true; // por defecto creamos dir en esta simulación (mkdir-like)

  const canonical = winResolve(ctx, raw, user);
  if (findDirEntry(ctx.machine, canonical) || findFile(ctx.machine, canonical)) {
    return { output: `El subdirectorio ya existe. (${winDisplay(canonical)})`, isError: true };
  }
  const parent = findParentDir({ files: ctx.machine.files || [] }, canonical);
  if (!parent) return { output: WIN_ERR.pathNotFound, isError: true };
  if (!canCreateInDir(ctx.machine, parent, user)) return { output: WIN_ERR.accessDenied, isError: true };

  const umask = ctx.umask ?? 0o022;
  const ownership = defaultOwnership(ctx.machine, user, applyUmask(0o777, umask));
  const files = [...(ctx.machine.files || []), buildNewFile(canonical + '/.dir', '', 'text', ownership)];
  ctx.machine.files = files;
  void wantDir;
  return { output: winDisplay(canonical), filesChanged: files };
};

// ── Resolve-Path (rp) ─────────────────────────────────────────────

const resolvePath: PsExec = (inv, ctx) => {
  const user = winUser(ctx);
  const raw = pathArg(inv) ?? '.';
  const canonical = winResolve(ctx, raw, user);
  const entry: FileEntry | null = findFile(ctx.machine, canonical) ?? findDirEntry(ctx.machine, canonical);
  if (!entry) return { output: WIN_ERR.pathNotFound, isError: true };
  const display = isDirPath(entry) ? dirCanonical(entry) : entry.path;
  return { output: winDisplay(display) };
};

// ── Set-Location (cd / sl / chdir) ────────────────────────────────
// Reutiliza las reglas de `cd` de cmd.exe (unidad absoluta, relativo al
// cwd, `\`, `~`) para que `cd c:\` y `cd ..` funcionen igual en las dos shells.

const setLocation: PsExec = (inv, ctx) => {
  const raw = pathArg(inv);
  // Sin destino: muestra el cwd (misma UX que `cd` solo en cmd.exe).
  if (raw === undefined || raw === '') {
    return { output: winDisplay(ctx.currentDir || winUser(ctx).home) };
  }
  const res = resolveCdTarget(ctx, raw);
  if (!res.ok) return { output: res.message, isError: true };
  ctx.setCurrentDir?.(res.canonical);
  return { output: '' };
};

// ── Get-Location (pwd / gl) ───────────────────────────────────────

const getLocation: PsExec = (_inv, ctx) => ({
  output: winDisplay(ctx.currentDir || winUser(ctx).home),
});

export const PS_FS_CMDLETS: Record<string, PsExec> = {
  'Get-ChildItem': getChildItem,
  'Get-Content': getContent,
  'Set-Content': setContent,
  'Remove-Item': removeItem,
  'Copy-Item': copyItem,
  'New-Item': newItem,
  'Resolve-Path': resolvePath,
  'Set-Location': setLocation,
  'Get-Location': getLocation,
};
