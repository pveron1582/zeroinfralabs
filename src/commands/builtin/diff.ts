// ── commands/builtin/diff.ts ──────────────────────────────────────
// Compara archivos línea por línea (Tier 1): formato normal y -u
// unificado, más -q breve. LCS con tope para no colgar el navegador.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { readVirtualFile } from '../../utils/fileRead';

const DIFF_HELP = `Usage: diff [OPTION] FILE1 FILE2
Compare files line by line.

Options:
  -u          Unified format (@@ -a,b +c,d @@)
  -q, --brief Report only whether files differ

Examples:
  diff a.txt b.txt
  diff -u a.txt b.txt
  diff -q a.txt b.txt`;

type Op = { kind: 'same' | 'del' | 'add'; aIdx: number; bIdx: number };

// LCS por DP. Tope de celdas para archivos grandes.
function computeOps(a: string[], b: string[]): Op[] | null {
  if (a.length * b.length > 4_000_000) return null;
  const m = a.length;
  const n = b.length;
  const dp: Uint32Array[] = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { ops.push({ kind: 'same', aIdx: i, bIdx: j }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ kind: 'del', aIdx: i, bIdx: -1 }); i++; }
    else { ops.push({ kind: 'add', aIdx: -1, bIdx: j }); j++; }
  }
  while (i < m) { ops.push({ kind: 'del', aIdx: i, bIdx: -1 }); i++; }
  while (j < n) { ops.push({ kind: 'add', aIdx: -1, bIdx: j }); j++; }
  return ops;
}

function fmtRange(from: number, to: number): string {
  // Rangos 1-based estilo diff: N (una línea) o N,M
  return from === to ? String(from) : `${from},${to}`;
}

function normalDiff(a: string[], b: string[], ops: Op[]): string {
  const out: string[] = [];
  let k = 0;
  // Líneas consumidas de cada lado antes del hunk (base para a/d puros)
  let aPos = 0;
  let bPos = 0;
  while (k < ops.length) {
    if (ops[k].kind === 'same') {
      aPos++;
      bPos++;
      k++;
      continue;
    }
    const dels: number[] = [];
    const adds: number[] = [];
    while (k < ops.length && ops[k].kind !== 'same') {
      if (ops[k].kind === 'del') { dels.push(ops[k].aIdx); aPos++; }
      else { adds.push(ops[k].bIdx); bPos++; }
      k++;
    }
    let header: string;
    if (dels.length && adds.length) {
      header = `${fmtRange(dels[0] + 1, dels[dels.length - 1] + 1)}c${fmtRange(adds[0] + 1, adds[adds.length - 1] + 1)}`;
    } else if (dels.length) {
      header = `${fmtRange(dels[0] + 1, dels[dels.length - 1] + 1)}d${bPos - adds.length}`;
    } else {
      header = `${aPos - dels.length}a${fmtRange(adds[0] + 1, adds[adds.length - 1] + 1)}`;
    }
    out.push(header);
    for (const d of dels) out.push(`< ${a[d]}`);
    if (dels.length && adds.length) out.push('---');
    for (const ad of adds) out.push(`> ${b[ad]}`);
  }
  return out.join('\n');
}

function unifiedDiff(a: string[], b: string[], ops: Op[], f1: string, f2: string): string {
  const out: string[] = [`--- ${f1}`, `+++ ${f2}`];
  // Hunsk con contexto 3, fusionados si se solapan
  const changes: number[] = [];
  ops.forEach((op, idx) => { if (op.kind !== 'same') changes.push(idx); });
  if (changes.length === 0) return '';
  const groups: number[][] = [];
  let cur: number[] = [changes[0]];
  for (let c = 1; c < changes.length; c++) {
    if (changes[c] - cur[cur.length - 1] <= 6) cur.push(changes[c]);
    else { groups.push(cur); cur = [changes[c]]; }
  }
  groups.push(cur);

  for (const g of groups) {
    const start = Math.max(0, g[0] - 3);
    const end = Math.min(ops.length - 1, g[g.length - 1] + 3);
    // Líneas consumidas antes del hunk (0-based)
    let aBase = 0;
    let bBase = 0;
    for (let q = 0; q < start; q++) {
      if (ops[q].kind !== 'add') aBase++;
      if (ops[q].kind !== 'del') bBase++;
    }
    let aCount = 0;
    let bCount = 0;
    for (let q = start; q <= end; q++) {
      if (ops[q].kind !== 'add') aCount++;
      if (ops[q].kind !== 'del') bCount++;
    }
    const aHead = aCount === 0 ? aBase : aBase + 1;
    const bHead = bCount === 0 ? bBase : bBase + 1;
    out.push(`@@ -${aHead},${aCount} +${bHead},${bCount} @@`);
    for (let q = start; q <= end; q++) {
      const op = ops[q];
      if (op.kind === 'same') out.push(` ${a[op.aIdx]}`);
      else if (op.kind === 'del') out.push(`-${a[op.aIdx]}`);
      else out.push(`+${b[op.bIdx]}`);
    }
  }
  return out.join('\n');
}

export const cmd_diff = {
  name: 'diff',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let unified = false;
    let brief = false;
    const files: string[] = [];
    for (const a of args) {
      if (a === '-h' || a === '--help') return { output: DIFF_HELP };
      else if (a === '-u' || a === '--unified') { unified = true; }
      else if (a === '-q' || a === '--brief') { brief = true; }
      else if (a.startsWith('-')) { return { output: `diff: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true }; }
      else files.push(a);
    }
    if (files.length < 2) {
      return { output: 'diff: missing operand\nTry \'diff --help\' for more information.', isError: true };
    }

    const read = (f: string): { ok: true; content: string } | { ok: false; error: string } => {
      const user = getCurrentUser(ctx.machine);
      const r = readVirtualFile(ctx.machine, f, ctx.currentDir, user);
      if (!r.ok) {
        if (r.error === 'permission-denied') return { ok: false, error: `diff: ${f}: Permission denied` };
        if (r.error === 'is-directory') return { ok: false, error: `diff: ${f}: Is a directory` };
        return { ok: false, error: `diff: ${f}: No such file or directory` };
      }
      return { ok: true, content: r.content };
    };
    const r1 = read(files[0]);
    if (!r1.ok) return { output: r1.error, isError: true };
    const r2 = read(files[1]);
    if (!r2.ok) return { output: r2.error, isError: true };
    const c1 = r1.content;
    const c2 = r2.content;

    const norm = (s: string) => (s.replace(/\n$/, '') === '' ? [] as string[] : s.replace(/\n$/, '').split('\n'));
    const a = norm(c1);
    const b = norm(c2);
    const ops = computeOps(a, b);
    if (ops === null) {
      return { output: 'diff: files too large to compare in this simulator', isError: true };
    }

    const differ = ops.some(o => o.kind !== 'same');
    if (!differ) return { output: '' };
    if (brief) {
      return { output: `Files ${files[0]} and ${files[1]} differ`, isError: true };
    }
    const body = unified ? unifiedDiff(a, b, ops, files[0], files[1]) : normalDiff(a, b, ops);
    return { output: body, isError: true };
  },
};
