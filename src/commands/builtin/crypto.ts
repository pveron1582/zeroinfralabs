// ── commands/builtin/crypto.ts ────────────────────────────────────
// Hashes y strings (Tier 1): md5sum, sha256sum, base64, strings.
// Lee del FS virtual o stdin (pipe). Hashes de verdad (Node crypto).

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { readVirtualFile, buildFileReadMetadata } from '../../utils/fileRead';
import { md5 } from 'js-md5';
import { sha256 } from 'js-sha256';

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function b64Encode(input: string): string {
  const out: string[] = [];
  const bytes = Array.from(new TextEncoder().encode(input));
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out.push(
      B64_ALPHABET[(n >> 18) & 63],
      B64_ALPHABET[(n >> 12) & 63],
      i + 1 < bytes.length ? B64_ALPHABET[(n >> 6) & 63] : '=',
      i + 2 < bytes.length ? B64_ALPHABET[n & 63] : '='
    );
  }
  return out.join('');
}

function b64Decode(input: string): string | null {
  const clean = input.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) return null;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const a = B64_ALPHABET.indexOf(clean[i]);
    const b = B64_ALPHABET.indexOf(clean[i + 1]);
    const c = clean[i + 2] === '=' ? 0 : B64_ALPHABET.indexOf(clean[i + 2]);
    const d = clean[i + 3] === '=' ? 0 : B64_ALPHABET.indexOf(clean[i + 3]);
    if (a === -1 || b === -1 || c === -1 || d === -1) return null;
    const n = (a << 18) | (b << 12) | (c << 6) | d;
    bytes.push((n >> 16) & 255);
    if (clean[i + 2] !== '=') bytes.push((n >> 8) & 255);
    if (clean[i + 3] !== '=') bytes.push(n & 255);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
  // TextDecoder handles UTF-8 (multi-byte decode OK)
}

function readInput(ctx: CommandContext, files: string[]): { content: string; label: string; ok: boolean; error?: string; resolved?: FileEntry } {
  if (ctx.pipedInput !== undefined) return { content: ctx.pipedInput.replace(/\n$/, ''), label: '-', ok: true };
  if (files.length === 0) {
    return { content: '', label: '', ok: false };
  }
  const f = files[0];
  const user = getCurrentUser(ctx.machine);
  const r = readVirtualFile(ctx.machine, f, ctx.currentDir, user);
  if (!r.ok) {
    if (r.error === 'permission-denied') return { content: '', label: f, ok: false, error: 'Permission denied' };
    if (r.error === 'is-directory') return { content: '', label: f, ok: false, error: 'Is a directory' };
    return { content: '', label: f, ok: false };
  }
  // Los comandos core hashean el contenido sin el newline final implícito
  return { content: r.content.replace(/\n$/, ''), label: f, ok: true, resolved: r.resolved };
}

const MD5_HELP = `Usage: md5sum [FILE]
Print or check MD5 (128-bit) checksum.

Examples:
  md5sum file
  echo hello | md5sum`;

const SHA256_HELP = `Usage: sha256sum [FILE]
Print or check SHA-2 (256-bit) checksum.

Examples:
  sha256sum file
  echo hello | sha256sum`;

const BASE64_HELP = `Usage: base64 [OPTION] [FILE]
Base64 encode or decode.

Options:
  -d   Decode instead of encode

Examples:
  echo hello | base64
  echo aGVsbG8= | base64 -d
  base64 file`;

const STRINGS_HELP = `Usage: strings [OPTION] FILE
Print printable sequences of at least 4 characters.

Options:
  -n N   Minimum length (default 4)

Examples:
  strings /bin/bash
  strings -n 6 binary`;

function digest(algo: 'md5' | 'sha256', text: string): string {
  return algo === 'md5' ? md5(text) : sha256(text);
}

function sumCmd(algo: 'md5' | 'sha256', help: string, args: string[], ctx: CommandContext): CommandResponse {
  if (args.includes('-h') || args.includes('--help')) return { output: help };
  const flags = args.filter(a => a.startsWith('-'));
  if (flags.some(f => !['-h', '--help', '-b', '--binary', '-t', '--text'].includes(f))) {
    return { output: `${algo}sum: flag no soportado en este simulador.`, isError: true };
  }
  const files = args.filter(a => !a.startsWith('-'));
  const { content, label, ok, error } = readInput(ctx, files);
  if (!ok) {
    if (error) return { output: `${algo}sum: ${files[0] ?? ''}: ${error}`, isError: true };
    return { output: `${algo}sum: ${files[0] ?? ''}: No such file or directory`, isError: true };
  }
  const hex = digest(algo, content);
  // Formato real: `<hex>  <file>`; stdin: `<hex>  -`
  const suffix = files.length > 0 ? `  ${label}` : '  -';
  return { output: `${hex}${suffix}` };
}

export const cmd_md5sum = {
  name: 'md5sum',
  execute: (args: string[], ctx: CommandContext): CommandResponse => sumCmd('md5', MD5_HELP, args, ctx),
};

export const cmd_sha256sum = {
  name: 'sha256sum',
  execute: (args: string[], ctx: CommandContext): CommandResponse => sumCmd('sha256', SHA256_HELP, args, ctx),
};

export const cmd_base64 = {
  name: 'base64',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: BASE64_HELP };
    const decode = args.includes('-d') || args.includes('--decode');
    const files = args.filter(a => !a.startsWith('-'));
    const { content, ok, error } = readInput(ctx, files);
    if (!ok) {
      if (error) return { output: `base64: ${files[0] ?? ''}: ${error}`, isError: true };
      return { output: `base64: ${files[0] ?? ''}: No such file or directory`, isError: true };
    }
    const clean = content.replace(/\n$/, '');
    if (decode) {
      const dec = b64Decode(clean);
      if (dec === null) return { output: `base64: invalid input`, isError: true };
      return { output: dec };
    }
    return { output: b64Encode(clean) };
  },
};

export const cmd_strings = {
  name: 'strings',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: STRINGS_HELP };
    let min = 4;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-n') { min = parseInt(args[++i] ?? '4', 10) || 4; }
      else if (a.startsWith('-n') && a.length > 2) { min = parseInt(a.slice(2), 10) || 4; }
      else if (a.startsWith('-')) return { output: `strings: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true };
      else files.push(a);
    }
    const { content, ok, error, resolved } = readInput(ctx, files);
    if (!ok) {
      if (error) return { output: `strings: ${files[0] ?? ''}: ${error}`, isError: true };
      return { output: `strings: ${files[0] ?? ''}: No such file or directory`, isError: true };
    }
    // Extrae corridas de caracteres imprimibles (32-126) de longitud >= min
    const out: string[] = [];
    let cur = '';
    for (let i = 0; i < content.length; i++) {
      const c = content.charCodeAt(i);
      if (c >= 32 && c <= 126) { cur += content[i]; }
      else {
        if (cur.length >= min) out.push(cur);
        cur = '';
      }
    }
    if (cur.length >= min) out.push(cur);
    const output = out.join('\n');
    // strings cuenta como lectura de archivo para misiones (solo vía archivo)
    if (resolved && files.length > 0 && ctx.pipedInput === undefined) {
      const meta = buildFileReadMetadata(ctx.machine, ctx.allMachines ?? [ctx.machine], resolved);
      return { output, type: 'fileRead', fileRead: meta.fileRead, ...(meta.possibleUsers && { possibleUsers: meta.possibleUsers }) };
    }
    return { output: output };
  },
};
