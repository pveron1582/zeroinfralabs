// ── utils/shellParse.ts ────────────────────────────────────────────
// Parsing de línea de shell quote-aware: pipes (|), redirecciones
// (>/>>/<) y expansión de variables $VAR/${VAR} (ROADMAP Fase 7.3/7.4).
// Las comillas simples escapan literales; las dobles permiten expansión.

export interface ShellRedirection {
  command: string;
  inputFile?: string;
  operator?: '>' | '>>';
  outputFile?: string;
}

/** Divide la línea por un separador (p. ej. '|') ignorando comillas. */
export function splitTopLevel(line: string, sep: string): string[] {
  const parts: string[] = [];
  let inSingle = false;
  let inDouble = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; }
    else if (ch === '"' && !inSingle) { inDouble = !inDouble; }
    if (!inSingle && !inDouble && ch === sep) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
}

/** Tokeniza una línea en argumentos con semántica de shell: las comillas
 * (simples o dobles) agrupan y se eliminan cuando son el delimitador; dentro
 * de comillas dobles las simples son literales (necesario para payloads SQL
 * como -d "username=' OR '1'='1&password=x"). Las simples como delimitador
 * también se eliminan, igual que bash: echo 'hola' → hola. */
export function splitArgs(line: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let state: 'none' | 'single' | 'double' = 'none';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (state === 'none') {
      if (ch === '"') { state = 'double'; continue; }
      if (ch === "'") { state = 'single'; continue; }
      if (/\s/.test(ch)) {
        if (cur) { tokens.push(cur); cur = ''; }
        continue;
      }
      cur += ch;
    } else if (state === 'double') {
      if (ch === '"') { state = 'none'; continue; }
      cur += ch;
    } else {
      if (ch === "'") { state = 'none'; continue; }
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/** Extrae redirecciones de nivel superior (>, >>, <) fuera de comillas. */
export function extractRedirection(line: string): ShellRedirection | null {
  let inSingle = false;
  let inDouble = false;
  let inputFile: string | undefined;
  let operator: '>' | '>>' | undefined;
  let outputFile: string | undefined;
  let last = 0;
  let cmd = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; i++; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; i++; continue; }
    if (!inSingle && !inDouble && (ch === '<' || ch === '>')) {
      cmd += line.slice(last, i);
      const isAppend = ch === '>' && line[i + 1] === '>';
      const op = ch === '>' ? (isAppend ? '>>' : '>') : '<';
      let j = i + (isAppend ? 2 : 1);
      while (j < line.length && /\s/.test(line[j])) j++;
      let target = '';
      while (j < line.length && !/\s/.test(line[j])) {
        if (line[j] === '"' || line[j] === "'") { j++; continue; }
        target += line[j];
        j++;
      }
      if (op === '<') inputFile = target;
      else { operator = op; outputFile = target; }
      i = j;
      last = j;
      continue;
    }
    i++;
  }
  cmd += line.slice(last);
  const command = cmd.trim();
  if (!inputFile && !operator) return null;
  return {
    command,
    ...(inputFile ? { inputFile } : {}),
    ...(operator && outputFile ? { operator, outputFile } : {}),
  };
}

/** Expande $VAR y ${VAR} con el entorno dado. Comillas simples → literal. */
export function expandCommandLine(line: string, env: Record<string, string>): string {
  let out = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; out += ch; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; out += ch; continue; }
    if (ch === '$' && !inSingle) {
      if (line[i + 1] === '{') {
        const close = line.indexOf('}', i + 2);
        if (close !== -1) {
          const name = line.slice(i + 2, close);
          out += env[name] !== undefined ? env[name] : '';
          i = close;
          continue;
        }
      } else {
        const m = line.slice(i + 1).match(/^[A-Za-z_][A-Za-z0-9_]*/);
        if (m) {
          out += env[m[0]] !== undefined ? env[m[0]] : '';
          i += m[0].length;
          continue;
        }
      }
    }
    out += ch;
  }
  return out;
}
