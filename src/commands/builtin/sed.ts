// ── commands/builtin/sed.ts ───────────────────────────────────────
// Editor de flujo básico (Tier 1): s///[gip], d, p, q con direcciones
// N, N,M y /re/. Sin rangos /re1/,/re2/, sin hold space, sin -i.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { readVirtualFile } from '../../utils/fileRead';

const SED_HELP = `Usage: sed [OPTION] SCRIPT [FILE]
  sed [OPTION] -e SCRIPT [-e SCRIPT] [FILE]

Commands (subset):
  s/re/repl/[g][p][i]   Substitute (any delimiter, \\1-\\9 supported)
  Nd, N,Md, /re/d       Delete lines
  Np, /re/p             Print lines (with -n, only these print)
  Nq                    Quit after line N

Options:
  -n          Suppress default output
  -e SCRIPT   Add script (repeatable)

Examples:
  sed 's/foo/bar/g' file
  sed -n '2p' file
  sed '1,3d' file`;

type SedInput = { ok: true; contents: string[] } | { ok: false; error: string };

function input(ctx: CommandContext, files: string[]): SedInput {
  if (ctx.pipedInput !== undefined) return { ok: true, contents: [ctx.pipedInput] };
  if (files.length === 0) return { ok: true, contents: [] };
  const out: string[] = [];
  const user = getCurrentUser(ctx.machine);
  for (const f of files) {
    const r = readVirtualFile(ctx.machine, f, ctx.currentDir, user);
    if (!r.ok) {
      if (r.error === 'permission-denied') return { ok: false, error: `sed: can't read ${f}: Permission denied` };
      if (r.error === 'is-directory') return { ok: false, error: `sed: can't read ${f}: Is a directory` };
      return { ok: false, error: `sed: can't read ${f}: No such file or directory` };
    }
    out.push(r.content);
  }
  return { ok: true, contents: out };
}

interface SedAddr { kind: 'none' | 'line' | 'range' | 'regex'; line?: number; end?: number; re?: RegExp }

interface SedCmd {
  addr: SedAddr;
  op: 's' | 'd' | 'p' | 'q';
  source?: string;
  // Reemplazo con \x00 donde iba & (match completo); \1..\9 ya son $1..$9
  repl?: string;
  global?: boolean;
  ignoreCase?: boolean;
  printFlag?: boolean;
}

function parseAddr(script: string, i: { pos: number }): SedAddr | null {
  const rest = script.slice(i.pos);
  // /re/ (con escapes)
  if (rest[0] === '/') {
    let j = 1;
    let pat = '';
    while (j < rest.length && rest[j] !== '/') {
      if (rest[j] === '\\' && j + 1 < rest.length) { pat += rest[j] + rest[j + 1]; j += 2; }
      else { pat += rest[j]; j++; }
    }
    if (j >= rest.length) return null;
    try {
      const re = new RegExp(pat);
      i.pos += j + 1;
      return { kind: 'regex', re };
    } catch {
      return null;
    }
  }
  const m = rest.match(/^(\d+)(,(\d+))?/);
  if (!m) return { kind: 'none' };
  i.pos += m[0].length;
  if (m[3] !== undefined) return { kind: 'range', line: parseInt(m[1], 10), end: parseInt(m[3], 10) };
  return { kind: 'line', line: parseInt(m[1], 10) };
}

// Convierte \1..\9 de sed a $1..$9 de JS (\\ queda literal).
function convertRepl(repl: string): string {
  let out = '';
  for (let k = 0; k < repl.length; k++) {
    if (repl[k] === '\\' && k + 1 < repl.length) {
      const n = repl[k + 1];
      if (n >= '1' && n <= '9') { out += '$' + n; k++; }
      else if (n === '\\') { out += '\\\\'; k++; }
      else { out += n; k++; }
    } else if (repl[k] === '$') {
      out += '$$';
    } else {
      out += repl[k];
    }
  }
  return out;
}

function parseScript(script: string): { cmds: SedCmd[]; error?: string } {
  const cmds: SedCmd[] = [];
  // Un script -e es una sola expresión; ';' separa comandos (fuera de s///).
  // Por simplicidad: el script completo es UN comando (el caso común).
  // Múltiples comandos → repetir -e.
  const i = { pos: 0 };
  const addr = parseAddr(script, i);
  if (!addr) return { cmds, error: `sed: invalid address` };
  const rest = script.slice(i.pos);
  if (!rest) return { cmds, error: `sed: missing command` };
  const op = rest[0];

  if (op === 'd' || op === 'p' || op === 'q') {
    if (rest.length > 1) return { cmds, error: `sed: extra characters after '${op}'` };
    return { cmds: [{ addr, op }] };
  }
  if (op === 's') {
    const delim = rest[1];
    if (!delim) return { cmds, error: `sed: unterminated 's' command` };
    const parts: string[] = [];
    let j = 2;
    let cur = '';
    for (let n = 0; n < 2; n++) {
      cur = '';
      while (j < rest.length && rest[j] !== delim) {
        if (rest[j] === '\\' && j + 1 < rest.length && rest[j + 1] === delim) { cur += delim; j += 2; }
        else { cur += rest[j]; j++; }
      }
      if (j >= rest.length) return { cmds, error: `sed: unterminated 's' command` };
      parts.push(cur);
      j++;
    }
    const flags = rest.slice(j);
    if (!/^[gip]*$/.test(flags)) return { cmds, error: `sed: invalid 's' flags '${flags}' (supported: g, i, p)` };
    try {
      // Validar el regex ahora (se recompila fresco por línea en la ejecución)
      new RegExp(parts[0]);
    } catch {
      return { cmds, error: `sed: invalid regex '${parts[0]}'` };
    }
    return {
      cmds: [{
        addr, op: 's', source: parts[0],
        repl: convertRepl(parts[1].replace(/(?<!\\)&/g, '\x00')),
        global: flags.includes('g'),
        ignoreCase: flags.includes('i'),
        printFlag: flags.includes('p'),
      }],
    };
  }
  return { cmds, error: `sed: unknown command '${op}' (supported: s, d, p, q)` };
}

function addrMatches(addr: SedAddr, lineNum: number, line: string): boolean {
  if (addr.kind === 'none') return true;
  if (addr.kind === 'line') return lineNum === addr.line;
  if (addr.kind === 'range') return lineNum >= (addr.line ?? 1) && lineNum <= (addr.end ?? lineNum);
  if (addr.kind === 'regex') { addr.re!.lastIndex = 0; return addr.re!.test(line); }
  return false;
}

export const cmd_sed = {
  name: 'sed',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let quiet = false;
    const scripts: string[] = [];
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-h' || a === '--help') return { output: SED_HELP };
      else if (a === '-n' || a === '--quiet' || a === '--silent') { quiet = true; }
      else if (a === '-e' || a === '--expression') {
        if (args[i + 1] === undefined) return { output: 'sed: option requires an argument -- \'e\'', isError: true };
        scripts.push(args[++i]);
      } else if (a.startsWith('-') && a !== '-') {
        return { output: `sed: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}' (supported: -n, -e)`, isError: true };
      } else if (scripts.length === 0 && files.length === 0) {
        scripts.push(a);
      } else {
        files.push(a);
      }
    }
    if (scripts.length === 0) return { output: 'sed: no script\nUsage: sed [OPTION] SCRIPT [FILE]', isError: true };

    const parsed: SedCmd[] = [];
    for (const s of scripts) {
      const r = parseScript(s);
      if (r.error) return { output: r.error, isError: true };
      parsed.push(...r.cmds);
    }

    const loaded = input(ctx, files);
    if (!loaded.ok) {
      return { output: loaded.error, isError: true };
    }
    const inputs = loaded.contents;

    const out: string[] = [];
    for (const data of inputs) {
      const lines = data.replace(/\n$/, '') === '' ? [] : data.replace(/\n$/, '').split('\n');
      let quit = false;
      for (let li = 0; li < lines.length && !quit; li++) {
        let line: string | null = lines[li];
        const lineNum = li + 1;
        let explicitPrint = false;
        for (const cmd of parsed) {
          if (line === null) break;
          if (!addrMatches(cmd.addr, lineNum, line)) continue;
          if (cmd.op === 'd') { line = null; break; }
          if (cmd.op === 'q') { quit = true; break; }
          if (cmd.op === 'p') { explicitPrint = true; continue; }
          if (cmd.op === 's') {
            // Regex fresco por línea (sin lastIndex con estado)
            const re = new RegExp(cmd.source!, (cmd.ignoreCase ? 'i' : '') + (cmd.global ? 'g' : ''));
            const repl = cmd.repl!.split('\x00').join('$&');
            line = line.replace(re, repl);
            if (cmd.printFlag) explicitPrint = true;
          }
        }
        if (line === null) continue;
        // -n suprime la impresión por defecto; 'p' explícito imprime.
        // Sin -n, la línea (ya transformada) se imprime; 'p' la duplica.
        if (!quiet) out.push(line);
        if (explicitPrint) out.push(line);
      }
    }
    return { output: out.join('\n') };
  },
};
