// ── commands/builtin/stat.ts ──────────────────────────────────────
// Estado detallado de archivos (Tier 1). Tamaños y fechas derivados del
// estado virtual (contenido real + hash estable del path).

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { formatModeFromFile } from '../../utils/permissions';
import { findFile, resolveSymlink } from '../../utils/fs';
import { getUser, getGroup, getCurrentUser } from '../../utils/users';

const STAT_HELP = `Usage: stat [OPTION] FILE...
Display file status.

Options:
  -c FORMAT  Use FORMAT instead of the default output (supports %n %s %a %U %G %F)
  -L         Dereference symlinks (show target instead of link)
  -h         Display this help

Examples:
  stat /etc/passwd
  stat -c '%a %n' script.sh`;

function hashPath(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Timestamp completo determinístico por path: `2024-03-14 09:32:11.000000000 +0000`
export function stableTimestamp(path: string): string {
  const h = hashPath(path || '/');
  const year = 2023 + (h % 2);
  const mon = String((Math.floor(h / 2) % 12) + 1).padStart(2, '0');
  const day = String((Math.floor(h / 24) % 28) + 1).padStart(2, '0');
  const hh = String(Math.floor(h / 672) % 24).padStart(2, '0');
  const mm = String(Math.floor(h / 16128) % 60).padStart(2, '0');
  const ss = String(Math.floor(h / 967680) % 60).padStart(2, '0');
  return `${year}-${mon}-${day} ${hh}:${mm}:${ss}.000000000 +0000`;
}

function uidOf(machine: CommandContext['machine'], name: string): { id: number; label: string } {
  const u = getUser(machine, name);
  if (u) return { id: u.uid, label: u.username };
  if (name === 'root') return { id: 0, label: 'root' };
  return { id: 1000, label: name };
}

function gidOf(machine: CommandContext['machine'], name: string): { id: number; label: string } {
  const g = getGroup(machine, name);
  if (g) return { id: g.gid, label: g.name };
  if (name === 'root') return { id: 0, label: 'root' };
  return { id: 1000, label: name };
}

function kindOf(entry: FileEntry): string {
  if (entry.type === 'symlink') return 'symbolic link';
  if (entry.path.endsWith('/.dir')) return 'directory';
  return 'regular file';
}

// Resuelve el target final de un symlink (realpath/strace estadian el destino).
function resolveEntry(machine: CommandContext['machine'], entry: FileEntry): FileEntry {
  return entry.type === 'symlink' ? (resolveSymlink(machine!, entry) ?? entry) : entry;
}

function defaultOutput(machine: CommandContext['machine'], raw: string, entry: FileEntry, deref: boolean): string {
  // Sin -L se muestra el enlace en sí (como stat real); con -L el destino.
  const shown = deref ? resolveEntry(machine, entry) : entry;
  const isDir = shown.path.endsWith('/.dir');
  const display = raw;
  const size = shown.type === 'symlink' && !deref
    ? (shown.linkTarget?.length ?? 0)
    : isDir ? 4096 : (shown.content ?? '').length;
  const blocks = Math.max(8, Math.ceil(size / 512));
  const mode = shown.mode ?? (isDir ? 0o755 : 0o644);
  const owner = shown.owner ?? 'root';
  const group = shown.group ?? 'root';
  const uid = uidOf(machine, owner);
  const gid = gidOf(machine, group);
  const kind = kindOf(shown);
  const accessStr = `${mode.toString(8).padStart(4, '0')}/${formatModeFromFile(shown)}`;
  const ts = stableTimestamp(shown.path);
  const extra = !deref && shown.type === 'symlink' && shown.linkTarget ? ` -> '${shown.linkTarget}'` : '';
  return [
    `  File: ${display}${extra}`,
    `  Size: ${size}\t\tBlocks: ${blocks}\t\t IO Block: 4096   ${kind}`,
    `Device: 801h/2049d\tInode: ${100000 + (hashPath(shown.path) % 900000)}  Links: ${isDir ? 2 : 1}`,
    `Access: (${accessStr})  Uid: (${String(uid.id).padStart(4, ' ')}/ ${uid.label.padEnd(8, ' ')})   Gid: (${String(gid.id).padStart(4, ' ')}/ ${gid.label.padEnd(8, ' ')})`,
    `Access: ${ts}`,
    `Modify: ${ts}`,
    `Change: ${ts}`,
    ` Birth: -`,
  ].join('\n');
}

function formatOutput(fmt: string, raw: string, entry: FileEntry, machine: CommandContext['machine']): string {
  const isDir = entry.path.endsWith('/.dir');
  const size = isDir ? 4096 : (entry.content ?? '').length;
  const mode = entry.mode ?? (isDir ? 0o755 : 0o644);
  return fmt
    .replace(/%n/g, raw)
    .replace(/%s/g, String(size))
    .replace(/%a/g, mode.toString(8))
    .replace(/%U/g, entry.owner ?? 'root')
    .replace(/%G/g, entry.group ?? 'root')
    .replace(/%F/g, kindOf(entry))
    .replace(/%u/g, String(uidOf(machine, entry.owner ?? 'root').id))
    .replace(/%g/g, String(gidOf(machine, entry.group ?? 'root').id));
}

export const cmd_stat = {
  name: 'stat',
  execute: (args: string[], { machine, currentDir }: CommandContext): CommandResponse => {
    let format: string | null = null;
    let deref = false;
    const targets: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-h' || a === '--help') return { output: STAT_HELP };
      else if (a === '-L' || a === '--dereference') { deref = true; }
      else if (a === '-c' || a === '--format') {
        if (args[i + 1] === undefined) return { output: `stat: option requires an argument -- 'c'\nTry 'stat --help' for more information.`, isError: true };
        format = args[++i];
      } else if (a.startsWith('-')) {
        return { output: `stat: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'\nTry 'stat --help' for more information.`, isError: true };
      } else targets.push(a);
    }
    if (targets.length === 0) {
      return { output: 'stat: missing operand\nTry \'stat --help\' for more information.', isError: true };
    }

    const home = machine ? (getCurrentUser(machine).home ?? '/') : '/';
    const outputs: string[] = [];
    let failed = false;
    for (const raw of targets) {
      const fullPath = normalizePath(resolvePath(raw, currentDir || '/', home));
      const entry = machine?.files ? findFile(machine, fullPath) : null;
      if (!machine || !entry) {
        outputs.push(`stat: cannot stat '${raw}': No such file or directory`);
        failed = true;
        continue;
      }
      outputs.push(format ? formatOutput(format, raw, deref ? resolveEntry(machine, entry) : entry, machine) : defaultOutput(machine, raw, entry, deref));
    }
    return { output: outputs.join('\n'), isError: failed ? true : undefined };
  },
};
