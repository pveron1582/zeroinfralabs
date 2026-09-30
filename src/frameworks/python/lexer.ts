// ── frameworks/python/lexer.ts ──────────────────────────────────────
// Tokenizador con manejo de indentación estilo Python: emite NEWLINE,
// INDENT y DEDENT. Respeta continuación de línea dentro de (), [], {}
// y comentarios con #. F-strings se tokenizan como FSTRING con el
// contenido crudo (el parser separa texto y expresiones).

import { syntaxError } from './errors';

export interface Token {
  type: 'NAME' | 'NUMBER' | 'STRING' | 'FSTRING' | 'OP' | 'NEWLINE' | 'INDENT' | 'DEDENT' | 'EOF';
  value: string;
  line: number;
}

// Incluye '%=' y '//=' porque AUG_OPS del parser acepta esos aug-assign.
const MULTI_OPS = ['==', '!=', '<=', '>=', '//=', '+=', '-=', '*=', '/=', '//', '%='];
const SINGLE_OPS = '+-*/%=<>()[]{}:.,;';
const KEYWORDS = new Set([
  'if', 'elif', 'else', 'while', 'for', 'in', 'not', 'and', 'or', 'def',
  'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'break',
  'continue', 'pass', 'True', 'False', 'None',
]);

const isNameStart = (c: string) => /[A-Za-z_]/.test(c);
const isNameChar = (c: string) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);

// Lee un string desde content[from] (que debe ser la comilla de apertura).
// Devuelve el contenido con escapes resueltos y el índice siguiente al cierre.
function readString(content: string, from: number, line: number): { out: string; next: number } {
  const quote = content[from];
  let j = from + 1;
  let out = '';
  while (j < content.length && content[j] !== quote) {
    if (content[j] === '\\' && j + 1 < content.length) {
      const esc = content[j + 1];
      out += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc === '\\' ? '\\'
        : esc === "'" ? "'" : esc === '"' ? '"' : '\\' + esc;
      j += 2;
    } else {
      out += content[j];
      j++;
    }
  }
  if (j >= content.length) throw syntaxError('EOL while scanning string literal', line);
  return { out, next: j + 1 };
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const indents: number[] = [0];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let bracketDepth = 0;

  for (let ln = 0; ln < lines.length; ln++) {
    const lineNo = ln + 1;
    const raw = lines[ln];
    if (bracketDepth === 0) {
      const stripped = raw.trim();
      if (stripped === '' || stripped.startsWith('#')) continue;
      let col = 0;
      while (col < raw.length && (raw[col] === ' ' || raw[col] === '\t')) {
        col += raw[col] === '\t' ? 4 : 1;
      }
      const top = indents[indents.length - 1];
      if (col > top) {
        indents.push(col);
        tokens.push({ type: 'INDENT', value: '', line: lineNo });
      } else if (col < top) {
        while (indents.length > 1 && indents[indents.length - 1] > col) {
          indents.pop();
          tokens.push({ type: 'DEDENT', value: '', line: lineNo });
        }
        if (indents[indents.length - 1] !== col) {
          throw syntaxError('unindent does not match any outer indentation level', lineNo);
        }
      }
    }

    let i = 0;
    const push = (type: Token['type'], value: string) =>
      tokens.push({ type, value, line: lineNo });

    while (i < raw.length) {
      const c = raw[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '#') break;
      // f-string: detectar ANTES que NAME o la 'f' se come el identificador.
      if ((c === 'f' || c === 'F') && (raw[i + 1] === '"' || raw[i + 1] === "'")) {
        const parsed = readString(raw, i + 1, lineNo);
        push('FSTRING', parsed.out);
        i = parsed.next;
        continue;
      }
      if (isNameStart(c)) {
        let j = i;
        while (j < raw.length && isNameChar(raw[j])) j++;
        push('NAME', raw.slice(i, j));
        i = j;
        continue;
      }
      if (isDigit(c)) {
        let j = i;
        while (j < raw.length && (isDigit(raw[j]) || raw[j] === '.')) j++;
        push('NUMBER', raw.slice(i, j));
        i = j;
        continue;
      }
      if (c === '"' || c === "'") {
        const parsed = readString(raw, i, lineNo);
        push('STRING', parsed.out);
        i = parsed.next;
        continue;
      }
      // Los operadores de 3 caracteres ('//=') se prueban antes que los de 2
      // para que '//' no se los trague y queden '%=' / '//=' como token único.
      const three = raw.slice(i, i + 3);
      if (MULTI_OPS.includes(three)) { push('OP', three); i += 3; continue; }
      const two = raw.slice(i, i + 2);
      if (MULTI_OPS.includes(two)) { push('OP', two); i += 2; continue; }
      if (SINGLE_OPS.includes(c)) {
        if ('([{'.includes(c)) bracketDepth++;
        if (')]}'.includes(c)) bracketDepth = Math.max(0, bracketDepth - 1);
        push('OP', c);
        i++;
        continue;
      }
      throw syntaxError(`invalid syntax (carácter inesperado '${c}')`, lineNo);
    }

    if (bracketDepth === 0) push('NEWLINE', '');
  }

  if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'NEWLINE') {
    tokens.push({ type: 'NEWLINE', value: '', line: lines.length });
  }
  while (indents.length > 1) {
    indents.pop();
    tokens.push({ type: 'DEDENT', value: '', line: lines.length });
  }
  tokens.push({ type: 'EOF', value: '', line: lines.length });
  return tokens;
}

export function isNameToken(t: Token): boolean {
  return t.type === 'NAME' && !KEYWORDS.has(t.value);
}

export { KEYWORDS };
