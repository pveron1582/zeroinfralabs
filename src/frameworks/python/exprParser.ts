// ── frameworks/python/exprParser.ts ─────────────────────────────────
// Parser de expresiones (descenso recursivo con precedencia estilo
// CPython): ifexp → or → and → not → comparación → aditiva →
// multiplicativa → unario → postfix (call/attr/subscript) → átomo.

import type { Expr } from './ast';
import { tokenize, type Token } from './lexer';
import { syntaxError } from './errors';

const COMP_OPS = ['==', '!=', '<=', '>=', '<', '>'];

export class ExprParser {
  protected pos = 0;
  constructor(protected readonly tokens: Token[]) {}

  protected peek(o = 0): Token {
    return this.tokens[Math.min(this.pos + o, this.tokens.length - 1)];
  }
  protected next(): Token {
    return this.tokens[this.pos++];
  }
  protected atKw(kw: string, o = 0): boolean {
    const t = this.peek(o);
    return t.type === 'NAME' && t.value === kw;
  }
  protected atOp(op: string, o = 0): boolean {
    const t = this.peek(o);
    return t.type === 'OP' && t.value === op;
  }
  protected expectOp(op: string): void {
    if (!this.atOp(op)) throw syntaxError(`se esperaba '${op}'`, this.peek().line);
    this.pos++;
  }
  protected expectName(what = 'un identificador'): string {
    const t = this.peek();
    if (t.type !== 'NAME') throw syntaxError(`se esperaba ${what}`, t.line);
    this.pos++;
    return t.value;
  }
  atEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  parseExpression(): Expr {
    return this.parseIfExp();
  }

  private parseIfExp(): Expr {
    const body = this.parseOr();
    if (this.atKw('if')) {
      const line = this.next().line;
      const test = this.parseOr();
      if (!this.atKw('else')) throw syntaxError("se esperaba 'else'", this.peek().line);
      this.pos++;
      const orelse = this.parseIfExp();
      return { t: 'ifexp', body, test, orelse, line };
    }
    return body;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    if (this.atKw('or')) {
      const line = this.peek().line;
      const values = [left];
      while (this.atKw('or')) { this.pos++; values.push(this.parseAnd()); }
      left = { t: 'boolop', op: 'or', values, line };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    if (this.atKw('and')) {
      const line = this.peek().line;
      const values = [left];
      while (this.atKw('and')) { this.pos++; values.push(this.parseNot()); }
      left = { t: 'boolop', op: 'and', values, line };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.atKw('not')) {
      const line = this.next().line;
      return { t: 'unary', op: 'not', operand: this.parseNot(), line };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    const line = this.peek().line;
    const left = this.parseAdditive();
    const ops: string[] = [];
    const comparators: Expr[] = [];
    for (;;) {
      const t = this.peek();
      if (t.type === 'OP' && COMP_OPS.includes(t.value)) {
        this.pos++;
        ops.push(t.value);
      } else if (t.type === 'NAME' && t.value === 'in') {
        this.pos++;
        ops.push('in');
      } else if (t.type === 'NAME' && t.value === 'not' && this.atKw('in', 1)) {
        this.pos += 2;
        ops.push('not in');
      } else break;
      comparators.push(this.parseAdditive());
    }
    if (ops.length === 0) return left;
    return { t: 'compare', left, ops, comparators, line };
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    for (;;) {
      if (this.atOp('+') || this.atOp('-')) {
        const op = this.next();
        left = { t: 'binop', op: op.value, left, right: this.parseMultiplicative(), line: op.line };
      } else break;
    }
    return left;
  }

  private parseMultiplicative(): Expr {
    let left = this.parseUnary();
    for (;;) {
      if (this.atOp('*') || this.atOp('/') || this.atOp('//') || this.atOp('%')) {
        const op = this.next();
        left = { t: 'binop', op: op.value, left, right: this.parseUnary(), line: op.line };
      } else break;
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.atOp('-')) {
      const line = this.next().line;
      return { t: 'unary', op: '-', operand: this.parseUnary(), line };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expr {
    let expr = this.parseAtom();
    for (;;) {
      if (this.atOp('(')) {
        const line = this.next().line;
        const args: Expr[] = [];
        if (!this.atOp(')')) {
          args.push(this.parseExpression());
          while (this.atOp(',')) { this.pos++; args.push(this.parseExpression()); }
        }
        this.expectOp(')');
        expr = { t: 'call', func: expr, args, line };
      } else if (this.atOp('.')) {
        const line = this.next().line;
        const name = this.expectName('un nombre de atributo');
        expr = { t: 'attr', obj: expr, name, line };
      } else if (this.atOp('[')) {
        const line = this.next().line;
        const index = this.parseExpression();
        this.expectOp(']');
        expr = { t: 'subscript', obj: expr, index, line };
      } else break;
    }
    return expr;
  }

  private parseAtom(): Expr {
    const t = this.peek();
    if (t.type === 'NUMBER') {
      this.pos++;
      const value = Number(t.value);
      if (Number.isNaN(value)) throw syntaxError(`número inválido '${t.value}'`, t.line);
      return { t: 'num', value, line: t.line };
    }
    if (t.type === 'STRING') { this.pos++; return { t: 'str', value: t.value, line: t.line }; }
    if (t.type === 'FSTRING') { this.pos++; return this.parseFString(t.value, t.line); }
    if (t.type === 'NAME') {
      if (t.value === 'True') { this.pos++; return { t: 'bool', value: true, line: t.line }; }
      if (t.value === 'False') { this.pos++; return { t: 'bool', value: false, line: t.line }; }
      if (t.value === 'None') { this.pos++; return { t: 'none', line: t.line }; }
      this.pos++;
      return { t: 'name', name: t.value, line: t.line };
    }
    if (this.atOp('(')) {
      const line = this.next().line;
      if (this.atOp(')')) { this.pos++; return { t: 'tuple', items: [], line }; }
      const first = this.parseExpression();
      if (this.atOp(',')) {
        const items = [first];
        while (this.atOp(',')) { this.pos++; items.push(this.parseExpression()); }
        this.expectOp(')');
        return { t: 'tuple', items, line };
      }
      this.expectOp(')');
      return first;
    }
    if (this.atOp('[')) {
      const line = this.next().line;
      const items: Expr[] = [];
      if (!this.atOp(']')) {
        items.push(this.parseExpression());
        while (this.atOp(',')) { this.pos++; items.push(this.parseExpression()); }
      }
      this.expectOp(']');
      return { t: 'list', items, line };
    }
    if (this.atOp('{')) {
      const line = this.next().line;
      const keys: Expr[] = [];
      const values: Expr[] = [];
      if (!this.atOp('}')) {
        do {
          keys.push(this.parseExpression());
          this.expectOp(':');
          values.push(this.parseExpression());
        } while (this.atOp(',') && (this.pos++, true));
      }
      this.expectOp('}');
      return { t: 'dict', keys, values, line };
    }
    throw syntaxError('sintaxis inválida', t.line);
  }

  // Divide el contenido crudo del f-string en partes texto/expresión.
  private parseFString(raw: string, line: number): Expr {
    const parts: Array<string | Expr> = [];
    let text = '';
    let i = 0;
    while (i < raw.length) {
      const c = raw[i];
      if (c === '{' && raw[i + 1] === '{') { text += '{'; i += 2; continue; }
      if (c === '}' && raw[i + 1] === '}') { text += '}'; i += 2; continue; }
      if (c === '{') {
        if (text) { parts.push(text); text = ''; }
        const end = findBraceEnd(raw, i, line);
        const src = raw.slice(i + 1, end);
        parts.push(parseExpressionSource(src, line));
        i = end + 1;
        continue;
      }
      if (c === '}') throw syntaxError("'}' inesperado en f-string", line);
      text += c;
      i++;
    }
    if (text) parts.push(text);
    return { t: 'fstring', parts, line };
  }
}

function findBraceEnd(raw: string, start: number, line: number): number {
  let depth = 1; // la '{' de apertura ya está contada
  let quote: string | null = null;
  for (let i = start + 1; i < raw.length; i++) {
    const c = raw[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{' || c === '[' || c === '(') depth++;
    if (c === '}') {
      if (depth === 1) return i;
      depth--;
    }
    if (c === ']' || c === ')') depth--;
  }
  throw syntaxError("f-string: falta '}' de cierre", line);
}

// Parsea una expresión suelta (para f-strings y pruebas).
export function parseExpressionSource(src: string, line: number): Expr {
  const tokens = tokenize(src).filter(t =>
    t.type !== 'NEWLINE' && t.type !== 'INDENT' && t.type !== 'DEDENT');
  const p = new ExprParser(tokens);
  const expr = p.parseExpression();
  if (!p.atEnd()) throw syntaxError('sintaxis inválida en expresión', line);
  return expr;
}
