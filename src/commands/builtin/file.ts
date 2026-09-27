// ── commands/builtin/file.ts ──────────────────────────────────────
// Tipo de archivo por contenido (Tier 1). Heurística sobre magic bytes,
// shebang y extension, al estilo de `file(1)`.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { findFile } from '../../utils/fs';
import { canRead } from '../../utils/permissions';
import { getCurrentUser } from '../../utils/users';

const FILE_HELP = `Usage: file [OPTION] FILE...
Determine file type.

Options:
  -b  Brief mode (do not prepend filenames)
  -h  Display this help

Examples:
  file /bin/bash
  file -b script.sh`;

function isText(content: string): boolean {
  if (content.length === 0) return true;
  let nonPrintable = 0;
  const sample = content.slice(0, 4096);
  for (let i = 0; i < sample.length; i++) {
    const c = sample.charCodeAt(i);
    if (c === 9 || c === 10 || c === 13) continue;
    if (c < 32 || c === 127) nonPrintable++;
  }
  return nonPrintable / sample.length < 0.05;
}

export function describeFile(path: string, entry: FileEntry): string {
  if (entry.type === 'symlink') return `symbolic link to '${entry.linkTarget ?? ''}'`;
  if (entry.path.endsWith('/.dir')) return 'directory';
  const content = entry.content ?? '';
  if (content.length === 0) return 'empty';
  if (content.startsWith('\x7fELF')) {
    return content[4] === '\x02' ? 'ELF 64-bit LSB executable, x86-64' : 'ELF 32-bit LSB executable, Intel 80386';
  }
  if (content.startsWith('#!')) {
    const interp = content.split('\n')[0].slice(2).trim();
    if (interp.includes('bash')) return `Bourne-Again shell script, ASCII text executable`;
    if (interp.includes('sh')) return `POSIX shell script, ASCII text executable`;
    if (interp.includes('python')) return `Python script, ASCII text executable`;
    if (interp.includes('perl')) return `Perl script, ASCII text executable`;
    return `a ${interp} script, ASCII text executable`;
  }
  const lower = path.toLowerCase();
  const trimmed = content.trimStart();
  if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) return 'HTML document, ASCII text';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(content);
      return 'JSON data';
    } catch { /* no es JSON válido */ }
  }
  if (lower.endsWith('.zip') || content.startsWith('PK\x03\x04')) return 'Zip archive data';
  if (lower.endsWith('.gz') || content.startsWith('\x1f\x8b')) return 'gzip compressed data';
  if (lower.endsWith('.png') || content.startsWith('\x89PNG')) return 'PNG image data';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'JPEG image data';
  if (lower.endsWith('.pdf') || content.startsWith('%PDF')) return 'PDF document';
  if (lower.endsWith('.sh') || lower.endsWith('.txt') || lower.endsWith('.conf') || lower.endsWith('.log') || lower.endsWith('.md')) {
    return isText(content) ? 'ASCII text' : 'data';
  }
  if (isText(content)) {
    const longLines = content.split('\n').some(l => l.length > 300);
    return longLines ? 'ASCII text, with very long lines' : 'ASCII text';
  }
  return 'data';
}

export const cmd_file = {
  name: 'file',
  execute: (args: string[], { machine, currentDir }: CommandContext): CommandResponse => {
    const brief = args.includes('-b') || args.includes('--brief');
    if (args.includes('-h') || args.includes('--help')) return { output: FILE_HELP };
    const targets = args.filter(a => !a.startsWith('-'));
    if (targets.length === 0) {
      return { output: 'Usage: file [OPTION] FILE...', isError: true };
    }
    const home = machine ? (getCurrentUser(machine).home ?? '/') : '/';
    const user = machine ? getCurrentUser(machine) : null;
    const outputs: string[] = [];
    let failed = false;
    for (const raw of targets) {
      const fullPath = normalizePath(resolvePath(raw, currentDir || '/', home));
      const entry = machine?.files ? findFile(machine, fullPath) : null;
      if (!machine || !entry) {
        outputs.push(`${raw}: ERROR: cannot open '${raw}' (No such file or directory)`);
        failed = true;
        continue;
      }
      // Como file(1) real: stat del path no exige lectura; solo los
      // archivos regulares inspeccionan contenido (magic bytes).
      if (!entry.path.endsWith('/.dir') && entry.type !== 'symlink' && !canRead(machine, entry, user)) {
        outputs.push(`${raw}: ERROR: cannot open '${raw}' (Permission denied)`);
        failed = true;
        continue;
      }
      const desc = describeFile(raw, entry);
      outputs.push(brief ? desc : `${raw}: ${desc}`);
    }
    return { output: outputs.join('\n'), isError: failed ? true : undefined };
  },
};
