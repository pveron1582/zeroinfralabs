// ── commands/builtin/awk.ts ───────────────────────────────────────
// AWK básico (Tier 1): patrones /re/, BEGIN/END, comparaciones de
// campos y acciones print (con $0 $N NF NR FNR, literales y números).
// Sin funciones, arrays, printf ni getline (ver help).

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { readVirtualFile } from '../../utils/fileRead';

const AWK_HELP = `Usage: awk [-F sep] 'program' [FILE...]
Pattern scanning with fields ($1, $2, ... $0 = whole line).

Program (subset):
  /re/ { print $1 }        Lines matching regex
  $3 > 100 { print $1 }    Field comparisons (== != > < >= <=)
  NR==1, NF, FNR           Record counters (FNR resets per file)
  BEGIN { ... }            Runs before input
  END { print NR }         Runs after input
  { print $1, $2 }         Comma = space; no comma = concatenate
  { print }                Prints the whole line ($0)
  { next }                 Skip to next line

Options:
  -F sep      Field separator (default: whitespace runs)

Examples:
  awk -F: '{print $1}' /etc/passwd
  awk '$3 > 1000 {print $1}' /etc/passwd
  awk 'END {print NR}' log.txt`;

type Value = string;

interface Rule {
  kind: 'begin' | 'end' | 'main';
  cond: string | null; // null = siempre
  action: string;
}

// Divide el programa en reglas: [patrón] { acción } con scan consciente
// de strings "..." y regex /.../ (llaves dentro no cuentan).
function splitProgram(program: string): { rules: Rule[]; error?: string } {
  const rules: Rule[] = [];
  let i = 0;
  const n = program.length;
  const skipWs = () => { while (i < n && /\s/.test(program[i])) i++; };

  while (true) {
    skipWs();
    if (i >= n) break;
    // Patrón opcional hasta la llave de apertura
    let pat = '';
    let inRe = false;
    let inStr = false;
    let j = i;
    while (j < n) {
      const c = program[j];
      if (inStr) {
        if (c === '\\') { pat += c + (program[j + 1] ?? ''); j += 2; continue; }
        if (c === '"') inStr = false;
        pat += c; j++;
        continue;
      }
      if (inRe) {
        if (c === '\\') { pat += c + (program[j + 1] ?? ''); j += 2; continue; }
        if (c === '/') inRe = false;
        pat += c; j++;
        continue;
      }
      if (c === '"') { inStr = true; pat += c; j++; continue; }
      if (c === '/') {
        const prev = pat.trimEnd().slice(-1);
        if (prev === '' || '({[;,=!<>|&~'.includes(prev)) {
          inRe = true; pat += c; j++; continue;
        }
        // División no existe en el subconjunto: '/' suelto termina el patrón
        pat += c; j++;
        continue;
      }
      if (c === '{') break;
      pat += c; j++;
    }
    if (j >= n) return { rules, error: `awk: missing '{' in program` };
    // Bloque de acción con llaves balanceadas (sin las llaves externas)
    let depth = 0;
    let k = j;
    inStr = false;
    let action = '';
    while (k < n) {
      const c = program[k];
      if (inStr) {
        if (c === '\\') { action += c + (program[k + 1] ?? ''); k += 2; continue; }
        if (c === '"') inStr = false;
        action += c; k++;
        continue;
      }
      if (c === '"') { inStr = true; action += c; k++; continue; }
      if (c === '{') {
        depth++;
        if (depth > 1) action += c;
        k++;
        continue;
      }
      if (c === '}') {
        depth--;
        if (depth === 0) { k++; break; }
        action += c;
        k++;
        continue;
      }
      action += c;
      k++;
    }
    if (depth !== 0) return { rules, error: `awk: missing '}' in program` };
    i = k;
    const p = pat.trim();
    const kind = p === 'BEGIN' ? 'begin' : p === 'END' ? 'end' : 'main';
    rules.push({ kind, cond: kind === 'main' && p !== '' ? p : null, action: action.trim() });
  }
  return { rules };
}

// Evalúa un operando con concatenación implícita: mezcla de $N, $0,
// $NF, NR, NF, FNR, literales "..." y texto (ej: $1"-"$2, NR": ").
function evalOperand(expr: string, fields: string[], line: string, NR: number, FNR: number): Value {
  const t = expr.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return t;
  const last = fields.length > 0 ? fields[fields.length - 1] : '';
  const sub = (run: string): string =>
    run
      .replace(/\$0/g, () => line)
      .replace(/\$NF/g, () => last)
      .replace(/\$(\d+)/g, (_m, d) => {
        const idx = parseInt(d, 10);
        return idx === 0 ? line : (fields[idx - 1] ?? '');
      })
      .replace(/\bNR\b/g, () => String(NR))
      .replace(/\bFNR\b/g, () => String(FNR))
      .replace(/\bNF\b/g, () => String(fields.length));
  let out = '';
  let i = 0;
  let run = '';
  const flush = () => { out += sub(run); run = ''; };
  while (i < t.length) {
    if (t[i] === '"') {
      flush();
      let j = i + 1;
      let lit = '';
      while (j < t.length && t[j] !== '"') {
        if (t[j] === '\\' && j + 1 < t.length) {
          const e = t[j + 1];
          lit += e === 'n' ? '\n' : e === 't' ? '\t' : e === '"' ? '"' : e === '\\' ? '\\' : e;
          j += 2;
        } else {
          lit += t[j];
          j++;
        }
      }
      out += lit;
      i = j + 1;
    } else {
      run += t[i];
      i++;
    }
  }
  flush();
  return out;
}

function isNumeric(s: string): boolean {
  return s.trim() !== '' && !isNaN(Number(s));
}

// Condición: /re/ | expr relop expr (== != > < >= <= ~ !~)
function evalCond(cond: string, fields: string[], line: string, NR: number, FNR: number): boolean {
  const c = cond.trim();
  if (c.startsWith('/') && c.endsWith('/') && c.length >= 2) {
    try {
      return new RegExp(c.slice(1, -1)).test(line);
    } catch {
      return false;
    }
  }
  const m = c.match(/^(.*?)\s*(==|!=|>=|<=|>|<|~|!~)\s*(.*)$/);
  if (!m) {
    // Condición suelta: verdadera si no vacía y distinta de "0"
    const v = evalOperand(c, fields, line, NR, FNR);
    return v !== '' && v !== '0';
  }
  const [, l, op, r] = m;
  const lv = evalOperand(l, fields, line, NR, FNR);
  const rv = evalOperand(r, fields, line, NR, FNR);
  if (op === '~' || op === '!~') {
    let hit = false;
    const body = rv.startsWith('/') && rv.endsWith('/') ? rv.slice(1, -1) : rv;
    try {
      hit = new RegExp(body).test(lv);
    } catch {
      hit = false;
    }
    return op === '~' ? hit : !hit;
  }
  if (isNumeric(lv) && isNumeric(rv)) {
    const a = Number(lv);
    const b = Number(rv);
    if (op === '==') return a === b;
    if (op === '!=') return a !== b;
    if (op === '>') return a > b;
    if (op === '<') return a < b;
    if (op === '>=') return a >= b;
    return a <= b;
  }
  if (op === '==') return lv === rv;
  if (op === '!=') return lv !== rv;
  if (op === '>') return lv > rv;
  if (op === '<') return lv < rv;
  if (op === '>=') return lv >= rv;
  return lv <= rv;
}

// Divide por un separador respetando comillas dobles.
function splitTop(s: string, sep: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === '\\' && i + 1 < s.length) { cur += c + s[i + 1]; i++; continue; }
      if (c === '"') inStr = false;
      cur += c;
      continue;
    }
    if (c === '"') { inStr = true; cur += c; continue; }
    if (c === sep) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

// Ejecuta una acción; retorna {printed, next} y agrega a out.
function runAction(
  action: string, fields: string[], line: string, NR: number, FNR: number, out: string[]
): { next: boolean } {
  for (const stmtRaw of splitTop(action, ';')) {
    const stmt = stmtRaw.trim();
    if (!stmt) continue;
    if (stmt === 'next') return { next: true };
    const pm = stmt.match(/^print\b(.*)$/);
    if (!pm) continue; // sentencias no soportadas se ignoran
    const rest = pm[1].trim();
    if (rest === '' || rest === '()') {
      out.push(line);
      continue;
    }
    const groups = splitTop(rest, ',').map(g =>
      splitTop(g.trim(), ' ')
        .filter(t => t !== '')
        .map(t => evalOperand(t, fields, line, NR, FNR))
        .join('')
    );
    out.push(groups.join(' '));
  }
  return { next: false };
}

export const cmd_awk = {
  name: 'awk',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let fs: string | null = null;
    let program: string | null = null;
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-h' || a === '--help') return { output: AWK_HELP };
      else if (a === '-F') { fs = args[++i] ?? null; }
      else if (a.startsWith('-F') && a.length > 2) { fs = a.slice(2); }
      else if (a === '-v') { i++; /* asignación -v var=val: no soportada */ }
      else if (a.startsWith('-')) { return { output: `awk: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}' (supported: -F)`, isError: true }; }
      else if (program === null) { program = a; }
      else files.push(a);
    }
    if (program === null) return { output: 'awk: no program\nUsage: awk [-F sep] \'program\' [FILE...]', isError: true };

    const split = splitProgram(program);
    if (split.error) return { output: split.error, isError: true };

    const splitFields = (l: string): string[] => {
      if (fs === null) {
        if (/^[ \t]*$/.test(l)) return [];
        return l.replace(/^[ \t]+/, '').split(/[ \t]+/);
      }
      if (fs === '') return [...l];
      if (fs.length === 1) return l.split(fs);
      try {
        return l.split(new RegExp(fs));
      } catch {
        return [l];
      }
    };

    const inputs: string[] = [];
    if (ctx.pipedInput !== undefined) {
      inputs.push(ctx.pipedInput);
    } else {
      if (files.length === 0) return { output: '', isError: false };
      for (const f of files) {
        const user = getCurrentUser(ctx.machine);
        const r = readVirtualFile(ctx.machine, f, ctx.currentDir, user);
        if (!r.ok) {
          if (r.error === 'permission-denied') return { output: `awk: can't open '${f}': Permission denied`, isError: true };
          if (r.error === 'is-directory') return { output: `awk: can't open '${f}': Is a directory`, isError: true };
          return { output: `awk: can't open '${f}': No such file or directory`, isError: true };
        }
        inputs.push(r.content);
      }
    }

    const out: string[] = [];
    const doRules = (rules: Rule[], fields: string[], line: string, NR: number, FNR: number): boolean => {
      for (const r of rules) {
        if (r.kind !== 'main') continue;
        if (r.cond !== null && !evalCond(r.cond, fields, line, NR, FNR)) continue;
        if (runAction(r.action, fields, line, NR, FNR, out).next) return true;
      }
      return false;
    };

    let NR = 0;
    for (const r of split.rules) {
      if (r.kind !== 'begin') continue;
      runAction(r.action, [], '', 0, 0, out);
    }
    inputs.forEach(data => {
      const lines = data.replace(/\n$/, '') === '' ? [] : data.replace(/\n$/, '').split('\n');
      let FNR = 0;
      for (const line of lines) {
        NR++;
        FNR++;
        const fields = splitFields(line);
        doRules(split.rules, fields, line, NR, FNR);
      }
    });
    for (const r of split.rules) {
      if (r.kind !== 'end') continue;
      runAction(r.action, [], '', NR, 0, out);
    }
    return { output: out.join('\n') };
  },
};
